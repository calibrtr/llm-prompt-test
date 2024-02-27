// Step 1: Import the necessary functions from the LLM Prompt Test library
import {
    executeLLM,
    testLLMResponse,
    configureLLMs,
    ResponseTest,
    generateImprovedPromptCandidates,
    configureCachingLLMs
} from "../index.js"

// Define the prompt for the LLM
const prompt = "Help me rewrite this linked in post: {post}";

// Specify any variables used in the prompt
const variables = {
    post: "I've got a great idea for a new app.  It's going to be a game changer.  I just need a developer to help me build it.  I'm looking for someone who is passionate about coding and wants to make a difference.  If that's you, get in touch!"
};

// Define the tests to run against the LLM's response
const tests :ResponseTest[] = [
    {
        type: "SizeResponseTest",
        minWords: 100,
        maxWords: 500
    },
    {
        type: "AIResponseTest",
        llmType: {
            provider: "openAI",
            model: "gpt-3.5-turbo"
        },
        should: "use simple english that's easy to understand"
    },
    {
        type: "AIResponseTest",
        llmType: {
            provider: "openAI",
            model: "gpt-3.5-turbo"
        },
        should: "polite and professional"
    },
    {
        type: "NSFWResponseTest",
        llmType: {
            provider: "openAI",
            model: "gpt-3.5-turbo"
        },
    },
    {
        type: "AIResponseTest",
        llmType: {
            provider: "openAI",
            model: "gpt-3.5-turbo"
        },
        should: "have have a catchy headline"
    },
    {
        type: "AIResponseTest",
        llmType: {
            provider: "openAI",
            model: "gpt-3.5-turbo"
        },
        should: "have a call to action"
    },

];

// The main function where the action happens
const main = async () => {
    // Configure the LLMs with API keys
    const llmFactory = configureCachingLLMs({
        cacheRoot: "llm-cache",
        openAI: {apiKey: process.env.OPENAI_API_KEY!}});

    // Execute the LLM with the specified prompt and tests
    const responses = await executeLLM(llmFactory, {provider: "openAI", model: "gpt-3.5-turbo"}, prompt, 5, variables);

    // Loop through each response and test it
    for (let i = 0; i < responses.length; i++) {
        console.log('Response ' + i);
        console.log(responses[i]);
        const results = await testLLMResponse(llmFactory, responses[i], tests);
        console.log(JSON.stringify(results, null, 2));
    }


    const improvedPrompts = await generateImprovedPromptCandidates(llmFactory,
        {provider: "openAI", model: "gpt-4-turbo-preview"},
        prompt,
        5,
        variables,
        tests);

    for(const improvedPrompt of improvedPrompts) {
        console.log(improvedPrompt);
    }
};

main();