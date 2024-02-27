# LLM Prompt Test

Prompt creation is more of an art than a science.  LLM Prompt Test would like to help you put the engineering back into prompt engineering.

Let's say you want to create a simple app that helps people rewrite linked in posts.

You might start with a prompt like this:
```
Help me rewrite this linked in post: {post}
```

But you haven't specified exactly what you want the LLM to do, so if you run this through the LLM 10 times, you'll likely get
10 very different results.

This is where LLM Prompt Test comes in.  It encourages you to write the acceptance criteria first, and then use that
to test your prompt.  The acceptance criteria can use the power of LLMs to run the test, so you can write your acceptance 
criteria in natural language.

In our example above, the acceptance criteria might be:
```
The response should be atleast 100 words long and at most 300 words long

It should use simple english that's easy to understand

It should be polite and professional

It should be free of NSFW content

It should have have a catchy headline

It should have a call to action
```

LLM Prompt Test will then run your prompt through the LLM a number of times, and test that each of these acceptance
criteria are met.  It can even suggest a better prompt based on your acceptance criteria.

## Getting Started

### How to Install

You can add LLM Prompt Test to your project in two ways:

#### Option 1: Install via npm

```bash 
npm install llm-prompt-test
```

#### Option 2: Install from Source

```bash
git clone https://github.com/calibrtr/llm-prompt-test.git
```


## How to Use LLM Prompt Test Tools

Here's a quick guide to get you started with LLM Prompt Test. 
This example demonstrates how to test the output of our linkedin post rewriting app.

```javascript
// Step 1: Import the necessary functions from the LLM Prompt Test library
import {executeLLM, testLLMResponse, configureLLMs} from "llm-prompt-test";

// Define the prompt for the LLM
const prompt = "Help me rewrite this linked in post: {post}";

// Specify any variables used in the prompt
const variables = {
    post: "I've got a great idea for a new app.  It's going to be a game changer.  I just need a developer to help me build it.  I'm looking for someone who is passionate about coding and wants to make a difference.  If that's you, get in touch!"
};

// Define the tests to run against the LLM's response
const tests = [
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

    // Generate improved prompt candidates based on the acceptance criteria
    // using gpt-4-turbo-preview model as it can understand the acceptance criteria and suggest a better prompt
    // there's nothing stoping you using that better prompt on gpt-3.5-turbo later.
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
```

## Caching LLM Responses
Calling LLMs is expensive and time-consuming.  To avoid unnecessary calls, LLM Prompt Test can cache the responses from the LLMs.  This is especially useful when running tests multiple times, or in CI/CD pipelines.

Just replace `configureLLMs` with `configureCachingLLMs`
```javascript
const llmFactory = configureCachingLLMs({
    cacheRoot: "llm-cache",
    openAI: {apiKey: process.env.OPENAI_API_KEY!}});
```

## LLM Providers
LLM Prompt Test supports multiple LLM providers.  
You can specify the provider and model to use in the `llmType` object.  
The following providers are supported:
- OpenAI

Other providers will be added in the future.  For now, you can configure custom providers when you call `configureLLMs` or `configureCachingLLMs`.

```javascript
const llmFactory = configureLLMs({
    openAI: {apiKey: process.env.OPENAI_API_KEY},
    custom: {
        myLLM: {
            executeLLM: async (model: string, prompt: string, resultVariations: number, returnJson: boolean) => {
                // call custom LLM here
                // return an array of responses, one per resultVariation
                return [""];
            }
        }
    }
});

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
    should: "use simple english that's easy to understand"
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