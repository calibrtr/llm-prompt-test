import OpenAI from "openai";
import {LLMAdapter} from "./llmAdapter.js";

export class OpenAIAdapter implements LLMAdapter {
    #openAI: OpenAI;

    constructor(apiKey: string) {
        this.#openAI = new OpenAI({apiKey});
    }

    async executeLLM(model: string, prompt: string, resultVariations: number, returnJson: boolean): Promise<string[]> {
        const response: OpenAI.Chat.ChatCompletion = await this.#openAI.chat.completions.create({
            model: model,
            messages: [
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature: 1,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            n: resultVariations,
            response_format: returnJson ? {"type": "json_object"} : undefined,
        });
        return response.choices.map((choice) => choice.message.content)
            .filter((content) => content !== null)
            .map((c) => c as string);
    }
}