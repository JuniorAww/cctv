import { Markup } from 'telegraf'

// drag&drop скрипт для стрелочных панелек
// капирайт джуниорав ентертейнмент (С)

export default class ArrowPanel {
    static panels = {} // TODO redis
    array = []
    text = null
    max = 5 // Max entries per page
    page = 0
    
    static getId(ctx, name) {
        return `${ctx.from.id}:${name}`
    }
    
    constructor(ctx, name) {
        const id = ArrowPanel.getId(ctx, name)
        let panel = ArrowPanel.panels[id]
        
        if(!panel) {
            panel = { user: ctx.from.id, name, max: 5, page: 0, text: null, array: [] }
            ArrowPanel.panels[id] = panel
        } else {
            this.text = panel.text
            this.array = panel.array
            this.max = panel.max
            this.page = panel.page
        }
        
        this.id = id
        this.reply = (text, args) => ctx.reply(text, { ...args, parse_mode: 'HTML' })
        this.deleteMessage = ctx.telegram.deleteMessage
        this.user = panel.user
        this.name = panel.name
        this.message_id = panel.message_id
        
        if(this.message_id) ctx.telegram.deleteMessage(this.user, this.message_id)
    }
    
    setArray(data) {
        this.array = data 
        ArrowPanel.panels[this.id].array = data
        return this
    }
    setText(data) {
        this.text = data 
        ArrowPanel.panels[this.id].text = data
        return this
    }
    setMax(data) {
        this.max = data 
        ArrowPanel.panels[this.id].max = data
        return this
    }
    
    async send() {
        try {
            const keyboard = this.getKeyboard();
            const panelInfo = `\n⭐ Страница: <b>${this.page+1}/${Math.ceil(this.array.length / this.max)}</b>`
            const { message_id } = await this.reply(this.text + panelInfo, keyboard)
            ArrowPanel.panels[this.id].message_id = message_id
        } catch (e) { console.error(e) }
    }
    
    getKeyboard() {
        const firstElementIndex = this.page * this.max
        return Markup.inlineKeyboard([
            ...this.array.slice(firstElementIndex, firstElementIndex + this.max).map((el, index) => {
                return [Markup.button.callback(`${firstElementIndex + index + 1}. ID ${el.id} NAME ${el.name}`, `AP$ ${this.name} open ${firstElementIndex + index}`)]
            }),
            [ Markup.button.callback('<', `AP$ ${this.name} back`),
              Markup.button.callback('x', `AP$ ${this.name} close`),
              Markup.button.callback('>', `AP$ ${this.name} next`) ],
        ])
    }
    
    static async handleAction(ctx, next) {
        const data = ctx.update.callback_query.data.split(' ')
        const [ type ] = data.splice(0, 1)
        if(type === 'AP$') {
            const [ name, action, index ] = data
            const panel = new ArrowPanel(ctx, name)
            if(panel) {
                if(action === 'back' || action === 'next' || action === 'reopen') {
                    if(action === 'back') panel.page = 
                        (panel.page - 1) < 0 ? (Math.ceil(panel.array.length / panel.max) - 1) : (panel.page - 1)
                    else if(action === 'next') panel.page = 
                        (panel.page + 1) % Math.ceil(panel.array.length / panel.max)
                    ArrowPanel.panels[panel.id].page = panel.page
                    await panel.send()
                }
                else if(action === 'close') {
                    ArrowPanel.panels[panel.id] = undefined
                    await ctx.reply("Панель закрыта")
                }
                else if(action === 'open') {
                    const element = panel.array[index]
                    const closeKeys = Markup.inlineKeyboard([ Markup.button.callback('Обратно', `AP$ ${panel.name} reopen`) ])
                    const entries = Object.entries(element).map(([ key, value ]) => {
                        let _value
                        if(value === null || value === undefined) _value = "не задано"
                        else if(Array.isArray(value)) {
                            if(value.length) _value = value.map(val => JSON.stringify(val)).join(', ')
                            else _value = "пустой массив"
                        }
                        else if(typeof value === 'object') _value = JSON.stringify(value)
                        else _value = value
                        return `<b>${key}</b>: ${_value}`
                    })
                    const text = `⭐ <b>Значения объекта</b>\n` + entries.join("\n")
                    const { message_id } = await panel.reply(text, closeKeys)
                    ArrowPanel.panels[panel.id].message_id = message_id
                }
            }
            return;
        }
        next()
    }
}
