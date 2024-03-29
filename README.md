# LLM Prompt Test

Crafting prompts is as much an art as it is a science. LLM Prompt Test aims to add back some engineering to improve precision and effectiveness.

Let's say you're developing an application designed to assist users in rewriting LinkedIn posts. You might 
initially draft a prompt like this:

```
Help me rewrite this linked in post: {post}
```

However, this prompt lacks specificity regarding the desired outcome.  Run this 10 times against your favourite LLM and youll get 10 very different answers.

LLM Prompt Test encourages the definition of clear acceptance criteria 
before prompt testing. These acceptance tests can be written in natural language as we send them to LLMs for evaluation.

For instance, in the LinkedIn post rewrite scenario, acceptance criteria could include:

  - The response should be atleast 100 words long and at most 300 words long
  - It should use simple english that's easy to understand 
  - It should be polite and professional 
  - It should be free of NSFW content 
  - It should have have a catchy headline 
  - It should have a call to action

LLM Prompt Test uses these criteria to evaluate your prompt by requesting multiple variations from the LLM and then testing  
each specified requirement. Based on your acceptance tests, the tool can also suggest improved prompt candidates.

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
import {executeLLM, testLLMResponse, configureLLMs, generateImprovedPromptCandidates} from "llm-prompt-test";

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

## Prompt Stability
LLM Prompt Test can help you determine how stable your prompt is.  By running the same prompt multiple times, you can see how much the responses vary. 
This can help you determine if your prompt is too vague.

To do this you need to call calculatePromptStability.  This function will return a number between 0 and 1, 
where 0 means the responses are completely different every time you call an LLM, and 1 means the responses are semantically the same every time you call the VM.

In most circumstances, you want a prompt to generate similar responses every time you call the LLM, so higher scores are better.  If you're looking for high creativity, you might want a lower score. 
Which means that each response is quite different, even with the same prompt.

```javascript
const promptStability = await calculatePromptStability(llmFactory,
    {provider: "openAI", model: "gpt-4-turbo-preview"},
    {provider: 'openAI', model: 'text-embedding-3-small'},
    prompt,
    10,
    variables);
```

You can see a full example [here](./tree/main/src/examples/promptStability.ts)

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
