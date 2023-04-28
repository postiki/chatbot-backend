import {Scenes} from "telegraf";
import {UserRoles} from "../../db/models/UserRoles";
import {User} from "../../db/models/User";

export const addRoleScenes = new Scenes.WizardScene('CREATE_USER_ROLE',
    async (ctx: any) => {
        await ctx.reply('Write role name');
        return ctx.wizard.next();
    },
    async (ctx: any) => {
        const name = ctx.message.text;
        ctx.session.name = name;
        await ctx.reply('Write a description about your role');
        return ctx.wizard.next();
    },
    async (ctx: any) => {
        const role = ctx.message.text;
        const name = ctx.session.name;
        try {
            const user = await User.findOne({chatId: ctx.chat.id}).populate('roles')
            await UserRoles.findOneAndUpdate({_id: user?.roles}, {
                roles: {...user?.roles.roles, [name]: role}
            })
            await ctx.reply(`Added a new role ${name}`);
            return ctx.scene.leave();
        } catch (e) {
            console.error(e)
        }
    },
);