import axios from "axios";
import {UserInterface} from "../../models/User";

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

    function interleaveMessages(userMessages: { role: string, content: string }[], chatMessages: {
        role: string,
        content: string
    }[]): { role: string, content: string }[] {
        const result: { role: string, content: string }[] = [];
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

    const role = Object.entries(user.currentRole)[0]

    const data = {
        model: 'gpt-3.5-turbo',
        messages: [{
            "role": "system",
            "content": role[1] || ''
        }, ...interleaveMessages(userMessages, chatMessages)],
        temperature: 0.7
    };

    try {
        console.log(data)
        const result: any = await axios.post(process.env.OPEN_AI_API_URL || '', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`
            }
        })

        return {text: result.data.choices[0].message.content, cost: result.data.usage}
    } catch (e) {
        console.error(e)
    }
}