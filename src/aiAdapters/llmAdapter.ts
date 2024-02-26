export interface LLMAdapter {
    executeLLM(model: string,
               prompt: string,
               resultVariations: number,
               returnJson: boolean): Promise<string[]>;
}

export type OpenAIAdapterConfig = {
    apiKey: string;
}


export type LLMAdapterConfig = {
    openAI?: OpenAIAdapterConfig;
    custom?: { [key: string]: LLMAdapter };
}

export type LLMType = {
    provider: string;
    model: string;
}

