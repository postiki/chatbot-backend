import {Scenes} from "telegraf";
import {openai} from "../services/openAi";
import {User} from "../../db/models/User";

export const generateImg = new Scenes.WizardScene('GENERATE_IMG',
    async (ctx: any) => {
            await ctx.reply('Write img prompt, max 1000 symbols');
        return ctx.wizard.next();
    },
    async (ctx: any) => {
        const message = ctx.message.text;
        const string = message.length <= 1000 ? message : message.slice(0, 1000)

        const result = await openai.createImage(
            {
                prompt: string,
                n: 1,
                size: "512x512",
            }
        )

        await User.findOneAndUpdate({chatId: ctx.chat.id}, {
            $inc: {"limits.imgTotal": 1},
        })

        await ctx.replyWithPhoto(result.data.data[0].url);
        return ctx.scene.leave();
    }
);