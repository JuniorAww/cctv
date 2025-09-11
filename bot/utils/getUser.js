import request from './request'

/*
// Получение User из базы данных через Internal API
*/

const getUser = async ctx => {
    const name = ctx.from.first_name + (ctx.from.last_name ? (' ' + ctx.from.last_name) : '')
    
    const body = {
        telegramId: ctx.from.id,
        name,
        tag: ctx.from.username || '',
    }
    
    const response = await request(ctx, "users/getOrCreate", { method: 'POST', body })
    return response
}

export default getUser
