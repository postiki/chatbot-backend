import {Context, Scenes, session, Telegraf} from "telegraf";
import {User} from "../db/models/User";
import commands from "./commands/commands";
import {addRoleScenes} from "./scenes/addRole";
import config from "../config";
import {removeRoleScenes} from "./scenes/removeRole";
import {generateImg} from "./scenes/generateImg";
import {postPrompt} from "./services/postPromt";

const bot = new Telegraf(config.telegramApiKey);
const stage = new Scenes.Stage([addRoleScenes, removeRoleScenes, generateImg]);

bot.use((ctx, next) => {
    return next().catch(async (err) => {
        console.error('Error:', err)
        await ctx.reply('Something went wrong please try again')
    })
})

bot.use(session());
bot.use(stage.middleware())
bot.use(commands.middleware())

bot.on('message', async (ctx: Context) => {
    const message: any = ctx.message
    const chat = ctx.chat

    try {
        const user = await User.findOne({chatId: chat?.id})

        if (user) {
            const userMessages = user.userCache.length < user.cacheLength ? user.userCache : user.userCache.slice(-user.cacheLength)
            const chatMessages = user.chatCache.length < user.cacheLength ? user.chatCache : user.chatCache.slice(-user.cacheLength)

            if (user.limits.wordsTotal < user.limits.maxWords && Date.now() < Date.parse(user.subscriptionEndAt)) {
                const start = Date.now()
                const result = await postPrompt(userMessages.concat([message.text]), chatMessages, user);
                const end = Date.now();
                await User.updateOne(
                    {chatId: chat?.id},
                    {
                        $inc: {"limits.wordsTotal": message.text.trim().split(/\s+/).length},
                        chatCache: chatMessages.concat(result?.text || ''),
                        userCache: userMessages.concat(message.text)
                    },
                )
                await ctx.reply(
                    `${result?.text}

                    totalTokens: {
                        total_words_string: ${message.text.trim().split(/\s+/).length},
                        responseTime: ${end - start}
                    }`,
                );
            } else {
                await ctx.reply('Subscription end!')
            }
        }
    } catch (e) {
        console.error(e)
    }
});

export default bot;