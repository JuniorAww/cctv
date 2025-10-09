import handleAdmin from '../handlers/handleAdmin'
import getUser from '../utils/getUser'

/* Вывод userId в консоль */
let batch = []

setInterval(() => {
    if(!batch.length) return;
    const i = batch.length
    console.log(`> Обработан${i>1?'о':''} ${i} запрос${i>4?'ов':i>1?'а':''}\n${batch.join(', ')}`)
    batch = []
}, 5000)

/* Защита от спама */
const spamblock = {}
const latestmsg = {}
const aliveresp = {}

const handleMessages = async (ctx, next) => {
    const { id, username } = ctx.from
    const NOW = Date.now()
    
    const name = username ? ('@'+username) : id
    
    batch.push(name)
    
    //if(!admin[name]) return;
    
    if(spamblock[id] > NOW) return;
    
    if(latestmsg[id] > NOW - 500) {
        spamblock[id] = NOW + 2000
        return await ctx.reply(`💫 <b>Пожалуйста, пишите реже ❤️</b>\nТак вы снижаете нагрузку на бота`, { parse_mode: 'HTML' })
    }
    
    latestmsg[id] = NOW
    
    ctx.reply = (text, params) => ctx.sendMessage(text, { parse_mode: 'HTML', ...params })
    
    if(ctx.message.date < (NOW / 1000 - 5)) {
        if(aliveresp[ctx.from.id]) return;
        aliveresp[ctx.from.id] = true;
        return await ctx.reply(`💫 <b>Бот снова доступен!</b>`)
    }
    
    ctx.user = await getUser(ctx).catch(async e => {
        console.error(e)
        await ctx.reply(`💫 <b>Упс! Испытываем проблемы.</b>\nПожалуйста, свяжитесь с разработчиком`)
        return null
    })
    
    if(ctx.user?.id === 1) handleAdmin(ctx)
    
    next() 
}

export default handleMessages
