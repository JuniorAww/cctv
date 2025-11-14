import 'dotenv/config'
import { Telegraf } from 'telegraf'

import handleMessages from './handlers/handleMessages'
import handleStart from './handlers/handleStart'
import ArrowPanel from './utils/ArrowPanel'

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.on('message', handleMessages)
bot.command('start', handleStart)

bot.on('callback_query', ArrowPanel.handleAction)

bot.launch()
console.log('Success!\nBot initialized')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
