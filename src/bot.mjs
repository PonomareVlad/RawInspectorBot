import { Bot, InputFile } from 'grammy'
import { fmt, pre } from '@grammyjs/parse-mode'
import { toHTML, toMarkdownV2 } from '@telegraf/entity'

export const {
    TELEGRAM_BOT_TOKEN: token,
    TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(':').pop(),
} = process.env

export const bot = new Bot(token)

const safe = bot.errorBoundary(console.error)

safe.on('msg', async ctx => {
    let extension
    let formatter

    switch (true) {
        case ctx.hasCommand('html'):
            extension = 'html'
            formatter = toHTML
            break
        case ctx.hasCommand('md'):
            extension = 'md'
            formatter = toMarkdownV2
            break
        default: {
            const json = JSON.stringify(ctx.update, null, 2)
            const { text, entities } = fmt`${pre('json')}${json}${pre}`
            return ctx.reply(text, { entities })
        }
    }

    const target = ctx.msg.reply_to_message
    const text = target?.text ?? target?.caption

    if (text === undefined) {
        return ctx.reply('Reply to a text message or caption with this command.')
    }

    const entities = target.entities ?? target.caption_entities ?? []
    const message = { text, entities: [...entities] }
    const formatted = formatter(message)
    const file = new InputFile(
        new TextEncoder().encode(formatted),
        `message.${extension}`,
    )

    await ctx.replyWithDocument(file, {
        reply_parameters: { message_id: target.message_id },
    })
    await ctx.deleteMessage().catch(console.error)
})
