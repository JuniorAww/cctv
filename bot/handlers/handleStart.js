import { Markup } from 'telegraf'

const handleStart = async ctx => {
    const keyboard = Markup.inlineKeyboard([
        //[ Markup.button.callback('💫 Камеры', 'cctv') ],
        //[ Markup.button.callback('❌ Найти запись', 'disk') ],
    ])
    
    const message = await ctx.reply(`💫 <b>Приветствую!</b>`, keyboard)
}

export default handleStart
