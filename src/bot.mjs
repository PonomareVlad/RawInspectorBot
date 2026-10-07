import { Bot } from 'grammy'
import { fmt, pre } from '@grammyjs/parse-mode'
import { entitiesToFormatted } from '@telegram.ts/formatters'

export const {
    TELEGRAM_BOT_TOKEN: token,
    TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(':').pop(),
} = process.env

export const bot = new Bot(token)

const safe = bot.errorBoundary(console.error)

const replyWithFormattedMessage = (ctx, mode, language) => {
    const target = ctx.msg.reply_to_message
    const text = target?.text ?? target?.caption

    if (text === undefined) {
        return ctx.reply('Reply to a text message or caption with this command.')
    }

    const entities = target.entities ?? target.caption_entities ?? []
    const formatted = entitiesToFormatted(text, entities, mode)
    const { text: replyText, entities: replyEntities } =
        fmt`${pre(language)}${formatted}${pre}`

    return ctx.reply(replyText, { entities: replyEntities })
}

safe.command('html', ctx =>
    replyWithFormattedMessage(ctx, 'HTML', 'html'),
)

safe.command('md', ctx =>
    replyWithFormattedMessage(ctx, 'MarkdownV2', 'markdown'),
)

safe.on('msg', ctx => {
    const json = JSON.stringify(ctx.update, null, 2)
    const { text, entities } = fmt`${pre('json')}${json}${pre}`
    return ctx.reply(text, { entities })
})
