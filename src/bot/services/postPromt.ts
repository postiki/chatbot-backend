import {UserInterface} from "../../db/models/User";
import {openai} from "./openAi";

interface PromptResult {
    text: string;
    cost: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    }
}

export const postPrompt = async (userHistory: Array<string>, chatHistory: Array<string>, user: UserInterface): Promise<PromptResult | undefined> => {
    const userMessages = userHistory.map(props => {
        return {"role": "user", "content": `${props}`}
    });
    const chatMessages = chatHistory.map(props => {
        return {"role": "assistant", "content": `${props}`}
    });

    function interleaveMessages(userMessages: any, chatMessages: any) {
        const result = [];
        const maxLength = Math.max(userMessages.length, chatMessages.length);
        for (let i = 0; i < maxLength; i++) {
            if (userMessages[i]) {
                result.push(userMessages[i]);
            }
            if (chatMessages[i]) {
                result.push(chatMessages[i]);
            }
        }
        return [...result];
    }

    const role = user.currentRole ? Object.entries(user.currentRole)[0][1] : ''

    const data = {
        model: 'gpt-3.5-turbo',
        messages: [{
            "role": "system",
            "content": role,
        }, ...interleaveMessages(userMessages, chatMessages)],
        temperature: 0.7
    };

    try {
        const result: any = await openai.createChatCompletion(data)

        return {text: result.data.choices[0].message.content, cost: result.data.usage}
    } catch (e) {
        console.error(e)
    }
}