// noinspection JSUnusedGlobalSymbols

import { bot, secretToken } from '../src/bot.mjs'
import { webhookCallback } from 'grammy'

export const POST = webhookCallback(bot, 'std/http', {
    timeoutMilliseconds: 24_000,
    secretToken,
})
