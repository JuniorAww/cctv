import User from '../db/models/User'
import Session from '../db/models/Session'
import Invite from '../db/models/Invite'
import GroupUser from '../db/models/GroupUser'
import path from 'node:path'

const GroupUserController = new class GroupUserController {
    async addToGroup(request, groupId) {
        if(request.access !== "ALL") return new Response()
        try {
            console.log('kitty')
            const { userId, name } = await request.json()
            const user = await User.findOne({ where: { id: userId } })
            await user.addGroup(groupId, {
              through: { name: 'Участник', role: 0 }
            })
        } catch (e) {
            console.error(e)
            return sendJson({ success: false })
        }
        return sendJson({ success: true })
    }

    async update(request, [ url, groupId ]) {
        const { userId } = request
        
        if (!groupId || !userId) return sendJson({ error: 'No Access' })
        
        const groupUser = await GroupUser.findOne({ where: { userId, groupId } })
        if (!groupUser) return sendJson({ error: 'No Access' })
        
        const { name } = await request.json()
        
        if(name) {
            if(name.length < 3 || name.length > 24) return sendJson({ error: 'Wrong Length' })
            await groupUser.update({ name })
        }
        
        return sendJson({ success: true })
    }

    async updateAvatar(request, [ url, groupId ]) {
        const { userId } = request
        
        if (!groupId || !userId) return sendJson({ error: 'No Access' })
        
        const groupUser = await GroupUser.findOne({ where: { userId, groupId } })
        if (!groupUser) return sendJson({ error: 'No Access' })
        
        const formData = await request.formData()
        const file = formData.get('avatar')
        if (!file) return sendJson({ error: 'No file' })

        // проверка размера ≤ 1 МБ
        const arrayBuffer = await file.arrayBuffer()
        if (arrayBuffer.byteLength > 512 * 1024) {
            return new Response(JSON.stringify({ error: 'File too large (max 512Kb)' }), { status: 400 })
        }

        const filename = `${Date.now()}_${file.name}`
        const filePath = path.join(UPLOAD_DIR, filename)
        await Bun.write(filePath, new Uint8Array(arrayBuffer))
        
        await groupUser.update({ avatar: `avatars/${filename}` })
        console.log('set avatar')
        
        return sendJson({ url: `avatars/${filename}` })
    }
}

const UPLOAD_DIR = "/var/www/html/avatars"

const sendJson = json => {
    return new Response(JSON.stringify(json), { headers: { 'Content-Type': 'application/json' } })
}

export default GroupUserController
