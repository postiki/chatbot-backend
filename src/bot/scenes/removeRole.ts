import {Scenes} from "telegraf";
import {UserRoles} from "../../db/models/UserRoles";
import {User} from "../../db/models/User";

export const removeRoleScenes = new Scenes.WizardScene('DROP_USER_ROLE',
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

            await ctx.reply(`Remove ${name}`);
            return ctx.scene.leave();
        }
    }
);