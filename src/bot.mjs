import { Bot, InputFile } from 'grammy'
import { fmt, pre } from '@grammyjs/parse-mode'
import { toHTML, toMarkdownV2 } from '@telegraf/entity'

export const {
    TELEGRAM_BOT_TOKEN: token,
    TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(':').pop(),
} = process.env

export const bot = new Bot(token)

const safe = bot.errorBoundary(console.error)

safe.command('md', replyWithFormattedMessage.bind(null, 'md', toMarkdownV2))
safe.command('html', replyWithFormattedMessage.bind(null, 'html', toHTML))

safe.on('msg', ctx => {
    const json = JSON.stringify(ctx.update, null, 2)
    const { text, entities } = fmt`${pre('json')}${json}${pre}`
    return ctx.reply(text, { entities })
})

const replyWithFormattedMessage = async (extension, method, ctx) => {
    const { reply_to_message } = ctx.msg
    await ctx.replyWithDocument(
        new InputFile(
            new TextEncoder().encode(method(reply_to_message)),
            `message.${extension}`
        ),
        { reply_parameters: reply_to_message }
    )
    await ctx.deleteMessage().catch(console.error)
}
