import {Composer, Context, Markup} from "telegraf";
import {User, UserInterface} from "../../db/models/User";
import {UserRoles} from "../../db/models/UserRoles";

const commands = new Composer()

commands.start(async (ctx: any): Promise<void> => {
    if (ctx.chat) {
        let chatUsername = '';
        if (ctx.chat.type === 'private') {
            chatUsername = ctx.chat.username || '';
        }
        const existingUser: UserInterface | null = await User.findOne({chatId: ctx.chat.id});

        if (!existingUser) {
            const currentTime = new Date();
            const nextMonth = new Date(currentTime.getFullYear(), currentTime.getMonth() + 1, currentTime.getDate(), currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());

            const user = await User.create({
                username: chatUsername,
                chatId: ctx.chat.id,
                subscriptionEndAt: nextMonth,
                referralId: ctx.startPayload
            });
            const roles = await UserRoles.create({})
            await User.updateOne({_id: user._id}, {
                roles: roles._id
            });

            await ctx.replyWithMarkdownV2(
                'Hi, it\'s Eva, your personal assistant chatbot powered by LLM technologies\\. I\'m here 24/7 to help you out with a variety of daily and work\\-related tasks\\. If you don\'t know where to start, let me give you a couple of examples\\. \n' +
                '\n' +
                'I can:\n' +
                '\\- conduct reasearch;\n' +
                '\\- master new langages and skills \\(even prepare for IELTS, GMAT or GRE\\);\n' +
                '\\- summarize and analyze complex texts and articles;\n' +
                '\\- generate images \\(type /img to access this command\\)\n' +
                '\n' +
                'I’m also good at coding, SEO writing systematization and prompt\\-knows\\-what\\!\n' +
                '\n' +
                'By the way, it all really depends on your prompt\\. Be cautious when giving tasks to get correct and accurate answers\\. From time to time I’ll be posting useful tips about prompting and talling to AIs like me in my telegram channel\\. Stay tuned for updates, join the early comunity and learn to drive the most out of AI\\!'
            )
            await ctx.replyWithMarkdownV2(
                '\*Limitations of How2Eva*' +
                '\n' +
                'Searching the web: for now Bot can not access real\\-time websearch, but we\'re working on it\n' +
                '\n' +
                'Inaccuracy and occasional mistakes: Bot may occasionally provide incorrect or incomplete answers\\.\n' +
                '\n' +
                'Context understanding: Bot can struggle with understanding context which may lead to misunderstandings\\. Be accurate when giving it prompts\\!\n' +
                '\n' +
                '\*Data Privacy Notification*' +
                '\n' +
                'Remember that chat bot is learning from their users, so don\'t overshare your personal data or sensitive information for security reasons\\.\n' +
                '\n' +
                '\*Please report all bugs and mistakes to [t\\.me/postikiDev](http://t.me/postikiDev)*'
            )
            await ctx.replyWithMarkdownV2(
                'For a starter, here are your 10,000 words and 10 images for free\\!',
                Markup.keyboard([
                    ['About Eva', 'Support'],
                    ['How2use', 'How2Pay',],
                ])
            )
        } else {
            await ctx.reply(
                `Привет, ${existingUser.username}!`,
                Markup.keyboard([
                    ['About Eva', 'Support'],
                    ['How2use', 'How2Pay',],
                ])
            );
        }
    }
});


commands.hears('About Eva', async (ctx: Context) => {
    await ctx.replyWithMarkdownV2(
        'How2Eva is your personal assistant chatbot powered by GPT technology\\. Chat can help you 24/7 with a variety of daily and work\\-related tasks\\. It can do reasearch, plan a holiday, help you learn a new language or master skills\\. Eva’s abilities are vast and she’s learning simultaneously\\.\n' +
        '\n' +
        'Eva’s good at coding, SEO writing, systematization and prompt\\*\\-knows\\-what\\. The quality of her answer can be adjusted with correct prompts and presets\\.\n' +
        '\n' +
        'How2Eva comes with a host of technical abilities to enhance your experience like:\n' +
        'personalization, scalability, analytics and intent\\-based search engine\\.\n' +
        '\n' +
        'With personalized recommendations based on your previous interactions, How2Eva is designed to make your life easier and more productive\\.'
    )
})
commands.hears('How2use', async (ctx: Context) => {
    await ctx.replyWithMarkdownV2(
        'Eva is a chat bot that can keep up conversation and respond in forms of:\n' +
        '\\-   text\n' +
        '\\-   images \\(\*/img command*\\)\n' +
        '\n' +
        'When talking to Eva, keep in mind how AI\\-based bots operate and use the following tips:\n' +
        '1\\.  Be clear and concise: Keep your prompts simple and to the point\\. Avoid using complex language or convoluted sentence structures\\.\n' +
        '2\\.  Use natural language: Write prompts in a conversational tone using natural language\\. Avoid using technical jargon or industry\\-specific terms that the AI may not recognize\\. Or provide it with relevan context\\.\n' +
        '3\\.  Be specific: Provide clear and specific instructions to the AI to ensure it understands what you are asking\\.\n' +
        '4\\.  Avoid ambiguity: Avoid using ambiguous language that could be interpreted in multiple ways\\. This can lead to the AI providing irrelevant or incorrect responses\\.\n' +
        '5\\.  Provide context: Give the AI context for the prompt by providing relevant information about the topic or task at hand\\.\n' +
        '6\\.  Use examples: Provide examples to help the AI understand what you are asking for and to provide a framework for the response\\.\n' +
        '7\\.  Stay on topic: Keep the prompt focused on the specific task or topic at hand\\. Avoid including irrelevant information or asking unrelated questions\\.\n' +
        '8\\.  Test the prompt: Test the prompt with the AI to ensure it understands what you are asking and provides the desired response\\.\n' +
        '9\\.  Revise as needed: If the AI is not providing the desired response, revise the prompt to make it more clear or specific\\.\n' +
        '10\\. Keep it human: Remember that the ultimate goal of AI is to mimic human intelligence\\. Write prompts that are human\\-like in their tone and language to help the AI better understand and respond to the request\\.\n'
    )
})
commands.hears('Support', async (ctx: Context) => {
    await ctx.replyWithMarkdownV2(
        '\*Please submit all questions, bug reports to [t\\.me/postikiDev](http://t.me/postikiDev)* \n' +
        '\n' +
        'If you have any ideas of features you\'d love to see in upcoming How2Eva updates \\- drop us a message and we\'ll work on that\\!'
    )
})
commands.hears('How2Pay', async (ctx: Context) => {
    const chat = ctx.chat
    const user = await User.findOne({chatId: chat?.id})
    if (user) {
        await ctx.replyWithMarkdownV2(
            '1\\.  Connect your wallet\n' +
            '2\\.  Click pay button\n' +
            '3\\.  Confirm approve transaction in your wallet\n' +
            '4\\.  Wait\n' +
            '5\\.  Confirm pay transaction in your wallet\n' +
            '6\\.  Wait\n' +
            '7\\.  Success'
            , Markup.inlineKeyboard([
            [Markup.button.url('Metamask', (process.env.PAYMENT_FRONT_URL || '') + `?userId=${chat?.id}&referralId=${user.referralId}`)]
        ]));
    }
})


commands.command('img', async (ctx: any) => {
    const chat: any = ctx.chat
    const user: any = await User.findOne({chatId: chat.id})
    if (user) {
        if (user.imgTotal > user.maxImg) {
            await ctx.reply('Subscription end')
        } else {
            await ctx.scene.enter('GENERATE_IMG')
        }
    }
})

commands.command('newchat', async (ctx: Context) => {
    const chat: any = ctx.chat
    await User.findOneAndUpdate({chatId: chat.id}, {
        userCache: [],
        chatCache: []
    })
    await ctx.reply('Start new conversation')
})

commands.command('roles', async (ctx: Context) => {
    const chat = ctx.chat
    const user = await User.findOne({chatId: chat?.id}).populate('roles')
    if (user) {
        const arrOfUserRoles = Object.entries(user.roles.roles || {})
        const rolesButtons = Object.entries(user.roles.roles || {}).map((item, index) => {
            return Markup.button.callback(item[0], `role${index}`)
        })

        const controlsButtons = [
            Markup.button.callback('Add role', 'addrole')
        ]
        user.currentRole !== null && controlsButtons.push(Markup.button.callback('Remove role', 'removerole'))
        arrOfUserRoles.length > 0 && controlsButtons.push(Markup.button.callback('Delete role', 'deleterole'))


        await ctx.reply('Here is your roles manager menu', Markup.inlineKeyboard([
            [...rolesButtons],
            [...controlsButtons]
        ]))
    }
})
commands.action('addrole', async (ctx: any) => {
    await ctx.scene.enter('CREATE_USER_ROLE');
});
commands.action('deleterole', async (ctx: any) => {
    await ctx.scene.enter('DROP_USER_ROLE');
});
commands.action('removerole', async (ctx: any) => {
    const chat = ctx.chat

    await User.findOneAndUpdate({chatId: chat.id}, {
        currentRole: null,
    })
    await ctx.reply('Success remove role')
});
commands.action(/role\d+/, async (ctx: any) => {
    const chat = ctx.chat
    const roleIndex = parseInt(ctx.match[0].substring(4))

    const user = await User.findOne({chatId: chat.id})

    if (user) {
        const userRoles = await UserRoles.findOne({_id: user.roles})
        const parsedRoles = Object.entries(userRoles?.roles || {})
        const currentRole = parsedRoles[roleIndex]
        await User.findOneAndUpdate({chatId: chat.id}, {
            currentRole: {
                [currentRole[0]]: currentRole[1]
            }
        })
        await ctx.reply(`Now, you are ${currentRole[0]}`)
    }
});

export default commands;