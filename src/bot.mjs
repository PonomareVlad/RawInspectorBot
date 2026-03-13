import { Bot } from 'grammy'
import { fmt, pre } from '@grammyjs/parse-mode'

export const {
    TELEGRAM_BOT_TOKEN: token,
    TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(':').pop(),
} = process.env

export const bot = new Bot(token)

const safe = bot.errorBoundary(console.error)

const keysToErase = ['text', 'entities', 'caption', 'caption_entities']

function eraseContent(update) {
    const clone = JSON.parse(JSON.stringify(update))
    for (const value of Object.values(clone)) {
        if (value && typeof value === 'object') {
            for (const key of keysToErase) delete value[key]
            if (value.message && typeof value.message === 'object') {
                for (const key of keysToErase) delete value.message[key]
            }
        }
    }
    return clone
}

safe.on('msg', async ctx => {
    const json = JSON.stringify(ctx.update, null, 2)
    const erased = JSON.stringify(eraseContent(ctx.update), null, 2)

    const { message_id } = await ctx.reply(erased)

    const { text, entities } = fmt`${pre('json')}${erased}${pre}`
    await ctx.api
        .editMessageText(ctx.chat.id, message_id, text, { entities })
        .catch(() => {})

    const { text: fullText, entities: fullEntities } =
        fmt`${pre('json')}${json}${pre}`
    await ctx.api
        .editMessageText(ctx.chat.id, message_id, fullText, {
            entities: fullEntities,
        })
        .catch(() => {})
})
