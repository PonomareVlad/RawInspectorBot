import { Bot } from 'grammy'
import { fmt, pre } from '@grammyjs/parse-mode'

export const {
    TELEGRAM_BOT_TOKEN: token,
    TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(':').pop(),
} = process.env

export const bot = new Bot(token)

const safe = bot.errorBoundary(console.error)

safe.on('msg', ctx => {
    const json = JSON.stringify(ctx.update, null, 2)
    const { text, entities } = fmt`${pre('json')}${json}${pre}`
    return ctx.reply(text, { entities })
})
