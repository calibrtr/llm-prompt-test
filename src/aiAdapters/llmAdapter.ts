export interface LLMAdapter {
    executeLLM(model: string,
               prompt: string,
               resultVariations: number,
               returnJson: boolean): Promise<string[]>;

    generateEmbedding(model: string, text: string, dimensions: number | undefined): Promise<number[]>;
}

export type OpenAIAdapterConfig = {
    apiKey: string;
}


export type LLMAdapterConfig = {
    openAI?: OpenAIAdapterConfig;
    custom?: {
        [key: string]:
            {
                executeLLM?: (model: string, prompt: string, resultVariations: number, returnJson: boolean) => Promise<string[]>;
                generateEmbedding?: (model: string, text: string, dimensions: number | undefined) => Promise<number[]>;
            }
    };
}

export type LLMType = {
    provider: string;
    model: string;
}

