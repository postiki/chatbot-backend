import {Composer, Context, Markup} from "telegraf";
import {User, UserInterface} from "../../models/User";
import {UserRoles} from "../../models/UserRoles";

const commands = new Composer()

commands.start(async (ctx: Context): Promise<void> => {
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

            });
            const roles = await UserRoles.create({})
            await User.updateOne({_id: user._id}, {
                roles: roles._id
            });

            await ctx.reply('Привет! Я бот!');
        } else {
            await ctx.reply(`Привет, ${existingUser.username}!`);
        }
    }
});

commands.command('payment', async (ctx: Context) => {
    const chat = ctx.chat
    await ctx.reply('Pay by:', Markup.inlineKeyboard([
        [Markup.button.url('Metamask', (process.env.PAYMENT_FRONT_URL || '') + `?userId=${chat?.id}`)]
    ]));
})

commands.command('roles', async (ctx: Context) => {
    const chat = ctx.chat
    const user = await User.findOne({chatId: chat?.id}).populate('roles')
    if (user) {
        const arrOfUserRoles = Object.entries(user.roles.roles || {})
        const rolesButtons = Object.entries(user.roles.roles || {}).map((item, index) => {
            return Markup.button.callback(item[0], `role${index}`)
        })
        const buttons = [
            ...rolesButtons,
            Markup.button.callback('Add role', 'addrole'),
        ]
        arrOfUserRoles.length > 0 && buttons.push(Markup.button.callback('Remove role', 'removerole'))
        await ctx.reply('Here is your roles manager menu', Markup.inlineKeyboard(buttons))
    }
})
commands.action('addrole', async (ctx: any) => {
    await ctx.scene.enter('CREATE_USER_ROLE');
});
commands.action('removerole', async (ctx: any) => {
    await ctx.scene.enter('REMOVE_USER_ROLE');
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

commands.command('img', async (ctx: any) => {
    await ctx.scene.enter('GENERATE_IMG')
})

export default commands;