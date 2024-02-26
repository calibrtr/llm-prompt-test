import {LLMAdapterConfig, LLMType} from "./llmAdapter.js";
import {OpenAIAdapter} from "./openAIAdapter.js";

export interface LLMFactory {
    executeLLM(llmType: LLMType, prompt: string, resultVariations: number, returnJson: boolean): Promise<string[]>;
}

export const configureLLMs = (config: LLMAdapterConfig): LLMFactory => {
    let openAIAdapter: OpenAIAdapter | undefined = undefined;
    return {
        async executeLLM(llmType: LLMType, prompt: string, resultVariations: number, returnJson: boolean): Promise<string[]> {
            if (llmType.provider === "openAI") {
                if (openAIAdapter === undefined) {
                    if (config.openAI === undefined) {
                        throw new Error("OpenAI adapter not configured");
                    }
                    openAIAdapter = new OpenAIAdapter(config.openAI.apiKey);
                }
                return await openAIAdapter.executeLLM(llmType.model, prompt, resultVariations, returnJson);
            }
            if (config.custom === undefined) {
                throw new Error("No custom adapters configured");
            }
            const adapter = config.custom[llmType.provider];
            if (adapter === undefined) {
                throw new Error(`No adapter for provider ${llmType.provider}`);
            }
            return await adapter.executeLLM(llmType.model, prompt, resultVariations, returnJson);
        }
    }
}