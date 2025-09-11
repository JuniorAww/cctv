const API_ROOT = process.env.API_ROOT

const request = async (ctx, url, data) => {
    try {
        const response = await fetch(API_ROOT + url, { 
            ...data,
            body: JSON.stringify(data.body),
            headers: {
                'X-Secret': process.env.SECRET
            }
        });console.log(process.env.SECRET)
        return await response.json()
    } catch (e) {
        console.log(e)
        ctx.reply(`<b>Ошибка!</b> Свяжитесь с разработчиком`)
    }
}

export default request
