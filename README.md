# LLM Prompt Test

Welcome to LLM Prompt Test! This toolset is designed to help you 
**test** Large Language Models (**LLMs**) **prompts** 
to ensure they **consistently** meet your expectations. 


Whether you're developing applications, conducting research, 
or just exploring the capabilities of LLMs, LLM Prompt Test can streamline the process by 
automating the testing of prompts.

## Getting Started

### How to Install

You can add LLM Prompt Test to your project in two ways:

#### Option 1: Install via npm

Use npm (Node Package Manager) to quickly add LLM Prompt Test to your project with the following command:

```bash 
npm install llm-prompt-test
```

#### Option 2: Install from Source

If you prefer to work with the source code directly or want to contribute to the project, clone the repository using Git:

```bash
git clone https://github.com/calibrtr/llm-prompt-test.git
```


## How to Use LLM Prompt Test Tools

Here's a quick guide to get you started with LLM Prompt Test. This example demonstrates how to test the output of an LLM for a specific task.

```javascript
// Step 1: Import the necessary functions from the LLM Prompt Test library
import {executeLLM, testLLMResponse, configureLLMs} from "llm-prompt-test";

// Define the prompt for the LLM
const prompt = "Generate some javascript code to {variable1}";

// Specify any variables used in the prompt
const variables = {
    variable1: "multiply two numbers"
};

// Define the tests to run against the LLM's response
const tests = [
    {
        type: "AIResponseTest",
        llmType: {
            provider: "openAI",
            model: "gpt-3.5-turbo"
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
            model: "gpt-3.5-turbo"
        },
    }
];

// The main function where the action happens
const main = async () => {
    // Configure the LLMs with API keys
    const llmFactory = configureLLMs({openAI: {apiKey: process.env.OPENAI_API_KEY}});

    // Execute the LLM with the specified prompt and tests
    const responses = await executeLLM(llmFactory, {provider: "openAI", model: "gpt-3.5-turbo"}, prompt, 5, variables);

    // Loop through each response and test it
    for (let i = 0; i < responses.length; i++) {
        console.log('Response ' + i);
        console.log(responses[i]);
        const results = await testLLMResponse(llmFactory, responses[i], tests);
        console.log(JSON.stringify(results, null, 2));
    }
};

main();
