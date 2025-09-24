import Session from '../db/models/Session'
import User from '../db/models/User'
import Invite from '../db/models/Invite'
import Camera from '../db/models/Camera'
import GroupUser from '../db/models/GroupUser'
import Group from '../db/models/Group'
import { getToken } from '../utils/tokens'
import sequelize from '../db/index'
import redis from '../utils/redis'

const SessionController = new class SessionController {
    async get(request, url) {
        const params = url.searchParams;
        const requestedUserId = Number(params.get('userId'))
        
        const canAccessAllSessions = request.access === "ALL"
        
        if(!canAccessAllSessions) {
            if(!requestedUserId) return sendJson({ error: 'No Access' })
            const { userId } = request
            
            const user = await User.findOne({
                where: { userId },
                include: 'sessions'
            })
            
            if(!user) return sendJson({ error: 'No Access' })
            
            const response = { success: true, sessions: user.sessions.map(x => {
                return {
                    id: x.id,
                    name: x.name,
                    expiresAt: x.expiresAt,
                    disabled: x.disabled,
                    history: x.history
            } }) }
            
            return sendJson(response)
        }
        else {
            const response = { success: true }
            
            const condition = requestedUserId ? { userId: requestedUserId } : {}
            
            response.sessions = await Session.findAll({
                where: condition,
                raw: true,
            })
            
            return sendJson(response)
        }
    }
    
    async delete(request, sessionId) {
        const { userId } = request;
        const canAccessAllSessions = request.access === "ALL"
        
        if(!canAccessAllSessions) {
            if(!sessionId) return sendJson({ error: 'No Access' })
            
            if(!userId) return sendJson({ error: 'No Access' })
            
            const [ updated ] = await Session.update({
                disabled: true
            }, {
                where: {
                    id: sessionId,
                    userId
                }
            })
            
            if (!updated) return sendJson({ error: 'Not Found' })
            
            return sendJson({ success: true })
        }
    }
}

const sendJson = (json, headers) => {
    return new Response(JSON.stringify(json), { headers: { 'Content-Type': 'application/json', ...headers } })
}

export default SessionController
