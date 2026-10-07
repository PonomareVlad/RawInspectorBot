import { InputFile } from 'grammy'

export const replyWithFormattedMessage = async (extension, method, ctx) => {
    const { reply_to_message } = ctx.msg
    await ctx.replyWithDocument(
        new InputFile(
            new TextEncoder().encode(method(reply_to_message)),
            `message.${extension}`
        ),
        { reply_parameters: reply_to_message }
    )
    await ctx.deleteMessage().catch(console.warn)
}
