// Step 1: Import the necessary functions from the LLM Prompt Test library
import {
    calculatePromptStability,
    testLLMResponse,
    generateImprovedPromptCandidates,
    configureCachingLLMs
} from "../index.js"

// Define the prompt for the LLM
const prompt = "Help me rewrite this linked in post: {post}";

// Specify any variables used in the prompt
const variables = {
    post: "I've got a great idea for a new app.  It's going to be a game changer.  I just need a developer to help me build it.  I'm looking for someone who is passionate about coding and wants to make a difference.  If that's you, get in touch!"
};

const alternativePrompt = "Assist in enhancing the clarity and appeal of this LinkedIn post by simplifying the language, ensuring professionalism, crafting a catchy headline, and including a call to action: {post}";


// The main function where the action happens
const main = async () => {
    // Configure the LLMs with API keys
    const llmFactory = configureCachingLLMs({
        cacheRoot: "llm-cache",
        openAI: {apiKey: process.env.OPENAI_API_KEY!}});

    const meanResponseSimilarity = await calculatePromptStability(llmFactory,
        {provider: "openAI", model: "gpt-4-turbo-preview"},
        {provider: 'openAI', model: 'text-embedding-3-small'},
        prompt,
        10,
        variables);

    const similarityPerc = (meanResponseSimilarity * 100).toFixed(0);

    console.log(`For prompt "${prompt}", responses are ${similarityPerc}% similar`);

    const improvedPromptSimilarity = await calculatePromptStability(llmFactory,
        {provider: "openAI", model: "gpt-4-turbo-preview"},
        {provider: 'openAI', model: 'text-embedding-3-small'},
        alternativePrompt,
        10,
        variables);

    const improvedSimilarityPerc = (improvedPromptSimilarity * 100).toFixed(0);

    console.log(`For prompt "${alternativePrompt}", responses are ${improvedSimilarityPerc}% similar`);
};

main();