import request from '../utils/request'
import { generate } from '../utils/qrController'
import ArrowPanel from '../utils/ArrowPanel'

let cmdNum = 0

const handleAdmin = async ctx => {
    ctx.args = ctx.text?.split(' ')
    
    if(!ctx.args) return false;
    
    const [ cmd ] = ctx.args.splice(0, 1)
    
    console.log('Executing admin command', ctx.text)
    
    if(cmd === "/crgrp") await createGroup(ctx)
    else if(cmd === "/jngrp") await addUserToGroup(ctx)
    else if(cmd === "/invitel") await createInvite(ctx)
    else if(cmd === "/delusr") await deleteUser(ctx)
    else if(cmd === "/addcm") await createCamera(ctx)
    else if(cmd === "/delcm") await deleteCamera(ctx)
    // new ones
    else if(cmd === "/guser") await getUser(ctx)
    else if(cmd === "/gusers") await getUsers(ctx)
    else if(cmd === "/ggr") await getGroups(ctx)
    else if(cmd === "/gcams") await getCameras(ctx)
    else if(cmd === "/ggu") await getGroupUsers(ctx)
    else if(cmd === "/patch") await patchEntry(ctx)
}

/*
// Отображение ответа сервера
*/
const debug = (ctx, info, data) => {
    return ctx.reply(`${info}\n${JSON.stringify(data, null, 2)}`)
}

const patchEntry = async (ctx) => {
    const [ table, id, key, value ] = ctx.args
    if(!value) return ctx.reply(`<b>Использование:</b> /patch TABLE ENTRY_ID KEY VALUE`)
    
    const body = { table, id, key, value }
    const response = await request(ctx, `admin`, { method: 'PATCH', body })

    await debug(ctx, "Patch выполнен", response)
}

/*
// Управление камерами
*/

const getUsers = async (ctx) => {
    const response = await request(ctx, `users?fields=accounts,groups`, { method: 'GET' })
    
    const text = `💫 <b>Список пользователей</b>`
    
    await (new ArrowPanel(ctx, "users").setArray(response.users).setText(text).send())
}

const getGroupUsers = async (ctx) => {
    const [ groupId ] = ctx.args
    
    const response = await request(ctx, `groups/${groupId}/users?fields=accounts`, { method: 'GET' })
    console.log()
    const text = `💫 <b>Список участников</b>`
    
    await (new ArrowPanel(ctx, "gusers").setArray(response.members).setText(text).send())
}

// создание web-юзера
const createUser = async (ctx) => {

}

const deleteUser = async (ctx) => {
    const [ userId ] = ctx.args
    
    const body = { userId }
    const response = await request(ctx, `users`, { method: 'DELETE', body })

    await debug(ctx, "Успешное удаление User", response)
}


/*
// Управление группами
*/

const getGroups = async (ctx) => {
    const response = await request(ctx, `groups?fields=users,cameras`, { method: 'GET' })
    
    const text = `💫 <b>Список групп</b>`
    
    await (new ArrowPanel(ctx, "groups").setArray(response.groups).setText(text).send())
}

const createGroup = async (ctx) => {
    const [ name ] = ctx.args
    
    const body = { name } // name ?
    const response = await request(ctx, 'groups', { method: 'POST', body })
    
    await debug(ctx, "Успешное создание Group", response)
}

const addUserToGroup = async (ctx) => {
    const [ groupId, userId, name ] = ctx.args
    
    const body = { userId, name }
    
    const response = await request(ctx, `groups/${groupId}/users`, { method: 'POST', body })
    
    await debug(ctx, "Успешное создание GroupUser", response)
}

const createInvite = async (ctx) => {
    const [ groupId, userId ] = ctx.args
    
    const body = { groupId, userId }
    const invite = await request(ctx, 'invites', { method: 'POST', body })
    
    console.log(invite)
    
    const { buf } = await generate(
        '0000.' + invite.nonce + '.' + invite.expiresAt, 'favicon.png',
        { scale: 8, margin: 4, ecLevel: 'H', centerRatio: 0.27, framePadding: 12 }
    );
    
    const photoSource = { source: buf }
    await ctx.replyWithPhoto(photoSource, {
        parse_mode: 'HTML',
        caption: "💫 <b>Приглашение в группу</b>\nБудет действовать ещё 10 минут!"
               + `\nЕсли сканер не работает: <b>${invite.nonce}</b> (код группы)` })
}


/*
// Управление камерами
*/

const getCameras = async (ctx) => {
    const [ groupId ] = ctx.args
    
    const response = await request(ctx, `cameras?groupId=${groupId}`, { method: 'GET' })
    
    const text = `💫 <b>Список источников ${groupId ? ("группы " + groupId) : "всех групп"}</b>`
    
    await (new ArrowPanel(ctx, "cameras").setArray(response.cameras).setText(text).send())
}

const createCamera = async (ctx) => {
    const [ groupId, name, ...config ] = ctx.args
    
    const body = { groupId, name, config: config.join(' ') }
    const response = await request(ctx, `cameras`, { method: 'POST', body })
    
    await debug(ctx, "Успешное добавление Camera", response)
}

const deleteCamera = async (ctx) => {
    const [ cameraId ] = ctx.args
    const response = await request(ctx, `cameras/${cameraId}`, { method: 'DELETE' })

    await debug(ctx, "Успешное удаление Camera", response)
}

export default handleAdmin
