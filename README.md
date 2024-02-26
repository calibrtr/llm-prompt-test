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
```

## Test Types
### AIResponseTest
This uses a second LLM call to verify the output of the first.  It allows for natural
language tests, but obviously it suffers from the same LLM prompt limitations that all 
LLM calls do.  

*Tip:* If you're having trouble making this test reliable, try using a better LLM. 
There's no need to use the same LLM as the original request.  In fact, it's often better
to use a more advanced LLM for these tests.

```javascript
{
    type: "AIResponseTest",
    llmType: {
        provider: "openAI",
        model: "gpt-3.5-turbo"
    },
    should: "javascript code to add two numbers"
}
```

### SizeResponseTest
This test checks the size of the response.  It can be used to ensure that the response
is within a certain size range, or that it's at least a certain size.  This is useful
for ensuring that the LLM is providing enough information, but not too much.

```javascript
{
    type: "SizeResponseTest",
    minChars: 10,
    maxChars: 10000,
    minWords: 3,
    maxWords: 1000
}
```

### FormatResponseTest
This test checks the format of the response.  It can be used to ensure that the response
is in a certain format, such as JSON, XML, or a specific programming language.

```javascript
{
    type: "FormatResponseTest",
    expectedFormat: "javascript",
}
```

### NSFWResponseTest
This test checks the response for NSFW content.  It can be used to ensure that the response
is safe for work, or to filter out responses that are not.

As with the AIResponseTest, this test uses a second LLM call to verify the output of the first.
It may not catch all NSFW content, but it can be a useful filter.

```javascript
{
    type: "NSFWResponseTest",
    llmType: {
        provider: "openAI",
        model: "gpt-3.5-turbo"
    },
}
```

## Contributing
Feel free to dive in! Open an issue or submit PRs.

We follow the [Contributor Covenant](http://contributor-covenant.org/version/1/3/0/) Code of Conduct.

## License

[MIT](LICENSE) © Calibrtr.com