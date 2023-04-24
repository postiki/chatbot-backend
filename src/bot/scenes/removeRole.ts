import {Scenes} from "telegraf";
import {UserRoles} from "../../models/UserRoles";
import {User} from "../../models/User";

export const removeRoleScenes = new Scenes.WizardScene('REMOVE_USER_ROLE',
    async (ctx: any) => {
        await ctx.reply('Write role name');
        return ctx.wizard.next();
    },
    async (ctx: any) => {
        const name = ctx.message.text;

        const user = await User.findOne({chatId: ctx.chat.id})
        const userRoles = await UserRoles.findOne({_id: user?.roles})

        if (user && userRoles) {
            const updatedRoles = {...userRoles.roles};
            delete updatedRoles[name];

            await UserRoles.findOneAndUpdate({_id: user?.roles}, {
                roles: updatedRoles
            })

            await ctx.reply(`Remove ${''}`);
            return ctx.scene.leave();
        }
    }
);