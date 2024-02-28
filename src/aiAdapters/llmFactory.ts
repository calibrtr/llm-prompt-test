import {LLMAdapter, LLMAdapterConfig, LLMType} from "./llmAdapter.js";
import {OpenAIAdapter} from "./openAIAdapter.js";

export interface LLMFactory {
    executeLLM(llmType: LLMType, prompt: string, resultVariations: number, returnJson: boolean): Promise<string[]>;
    generateEmbedding(llmType: LLMType, text: string, dimensions: number | undefined): Promise<number[]>;
}

export const configureLLMs = (config: LLMAdapterConfig): LLMFactory => {
    let openAIAdapter: OpenAIAdapter | undefined = undefined;
    const getOpenAIAdapter = () => {
        if (openAIAdapter === undefined) {
            if (config.openAI === undefined) {
                throw new Error("OpenAI adapter not configured");
            }
            openAIAdapter = new OpenAIAdapter(config.openAI.apiKey);
        }
        return openAIAdapter;
    }
    const getAdapter = (provider: string ): LLMAdapter => {
        if (provider === "openAI") {
            return getOpenAIAdapter();
        }
        if (config.custom === undefined) {
            throw new Error("No custom adapters configured");
        }
        const customAdaptor = config.custom[provider];
        if (customAdaptor === undefined) {
            throw new Error(`No adapter for provider ${provider}`);
        }
        return {
            executeLLM: customAdaptor.executeLLM ?? ((model: string, prompt: string, resultVariations: number, returnJson: boolean) => {
                return customAdaptor.executeLLM!(model, prompt, resultVariations, returnJson);
            }),
            generateEmbedding: customAdaptor.generateEmbedding ?? ((model: string, text: string, dimensions: number | undefined) => {
                return customAdaptor.generateEmbedding!(model, text, dimensions);
            })
        };
    }
    return {
        async executeLLM(llmType: LLMType, prompt: string, resultVariations: number, returnJson: boolean): Promise<string[]> {
            return await getAdapter(llmType.provider).executeLLM(llmType.model, prompt, resultVariations, returnJson);
        },
        async generateEmbedding(llmType: LLMType, text: string, dimensions: number | undefined): Promise<number[]> {
            return await getAdapter(llmType.provider).generateEmbedding(llmType.model, text, dimensions);
        }
    }
}