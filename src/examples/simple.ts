import {executeLLM, testLLMResponse} from "../promptTesting/promptTesting.js";
import {ResponseTest} from "../promptTesting/types.js";
import figlet from 'figlet';
import {configureCachingLLMs} from "../aiAdapters/cachingFactory.js";


const prompt = "Generate some javascript code to {variable1}"

const variables = {
    variable1: "multiply two numbers"
}

const tests: ResponseTest[] = [
    {
        type: "AIResponseTest",
        llmType: {
            provider: "openAI",
            model: "gpt-3.5-turbo",
        },
        should: "javascript code to add two numbers"
    },
    {
        type: "SizeResponseTest",
        minChars: 10,
        maxChars: 10000,
        minWords: 3,
        maxWords: 1000
    },
    {
        type: "FormatResponseTest",
        expectedFormat: "javascript",
    },
    {
        type: "NSFWResponseTest",
        llmType: {
            provider: "openAI",
            model: "gpt-3.5-turbo",
        },
    }
]

const main = async () => {
    const llmFactory = configureCachingLLMs({
        cacheRoot: "llm-cache",
        openAI: {apiKey: process.env.OPENAI_API_KEY!}});

    console.log(figlet.textSync('Simple Prompt Test'));
    const responses = await
        executeLLM(llmFactory,
            {provider: "openAI", model: "gpt-3.5-turbo"},
            prompt,
            5,
            variables);

    for (let i = 0; i < responses.length; i++) {
        console.log(figlet.textSync('Response ' + i));

        console.log(responses[i]);
        const results = await testLLMResponse(llmFactory, responses[i], tests);
        console.log(JSON.stringify(results, null, 2));
    }

}

main();