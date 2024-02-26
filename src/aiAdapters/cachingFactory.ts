import {LLMAdapterConfig, LLMType} from "./llmAdapter.js";
import {configureLLMs, LLMFactory} from "./llmFactory.js";
import * as fs from "fs";
import * as crypto from "crypto";


type CachingConfig = {
    cacheRoot: string;

} & LLMAdapterConfig;

const getCacheKey = (prompt: string, resultVariations: number, returnJson: boolean): string => {
    const json =  JSON.stringify({prompt, resultVariations, returnJson});
    return crypto.createHash('sha256').update(json).digest('hex');
}

type PromptFileFormat = {
    prompt: string;
    resultVariations: number;
    returnJson: boolean;
    responses: string[];
}

export const configureCachingLLMs = (config: CachingConfig): LLMFactory => {
    const llmFactory = configureLLMs(config);

    return {
        async executeLLM(llmType: LLMType, prompt: string, resultVariations: number, returnJson: boolean): Promise<string[]> {
            const cacheKey = getCacheKey(prompt, resultVariations, returnJson);
            const dirPath = `${config.cacheRoot}/${llmType.provider}/${llmType.model}`;
            if(!fs.existsSync(dirPath)){
                fs.mkdirSync(dirPath, { recursive: true });
            }
            const cacheFilePath = `${dirPath}/${cacheKey}.prompt`;
            if(fs.existsSync(cacheFilePath)){
                const cachedJson = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
                return cachedJson.responses;
            }
            const result = await llmFactory.executeLLM(llmType, prompt, resultVariations, returnJson);
            fs.writeFileSync(cacheFilePath, JSON.stringify({
                prompt,
                resultVariations,
                returnJson,
                responses: result
            }, null, 2));
            return result;
        }
    }
}