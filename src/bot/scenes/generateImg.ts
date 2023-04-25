import {Scenes} from "telegraf";
import {openai} from "../services/openAi";

export const generateImg = new Scenes.WizardScene('GENERATE_IMG',
    async (ctx: any) => {
        await ctx.reply('Write img prompt');
        return ctx.wizard.next();
    },
    async (ctx: any) => {
        const message = ctx.message.text;
        const result = await openai.createImage(
            {
                prompt: message,
                n: 1,
                size: "512x512",
            }
        )

        await ctx.replyWithPhoto(result.data.data[0].url);
        return ctx.scene.leave();
    }
);