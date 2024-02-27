import {
    AIResponseTest,
    HateSpeechResponseTest,
    NSFWResponseTest,
    OnePromptTestResult,
    PromptFeedback,
    RegexResponseTest,
    ResponseTest,
    ResponseTestFailure,
    ResponseTestResult,
    ResponseTestsResult, ResponseTestStatistics,
    SizeResponseTest
} from "./types.js";

import {formatResponseTest} from "./formatTester.js";
import {LLMFactory} from "../aiAdapters/llmFactory.js";
import {LLMType} from "../aiAdapters/llmAdapter.js";

const aiResponseTest = async (llmFactory : LLMFactory, response: string, test: AIResponseTest): Promise<ResponseTestResult> => {
    const prompt =
        "Is this ai response correct?\n\n" +
        response +
        "\n\n it should " +
        test.should +
        "\n\n.  Reply in json format with {\"correct\": true} or {\"correct\": false, \"reason\": \"INSERT_REASON_HERE\"}";
    const responses = await llmFactory.executeLLM(test.llmType, prompt, 1, true);
    const responseJson = JSON.parse(responses[0]);
    if (responseJson.correct) {
        return {pass: true};
    }
    return {pass: false, test, message: responseJson.reason};
}

const sizeResponseTest = async (llmFactory : LLMFactory, response: string, test: SizeResponseTest): Promise<ResponseTestResult> => {
    const words = response.split(" ");
    const chars = response.split("").length;
    if (test.minWords !== undefined && words.length < test.minWords) {
        return {pass: false, test, message: "Response has too few words"};
    }
    if (test.maxWords !== undefined && words.length > test.maxWords) {
        return {pass: false, test, message: "Response has too many words"};
    }
    if (test.minChars !== undefined && chars < test.minChars) {
        return {pass: false, test, message: "Response has too few characters"};
    }
    if (test.maxChars !== undefined && chars > test.maxChars) {
        return {pass: false, test, message: "Response has too many characters"};
    }
    return {pass: true};
}

const regexResponseTest = async (llmFactory : LLMFactory, response: string, test: RegexResponseTest): Promise<ResponseTestResult> => {
    if (response.match(new RegExp(test.regex))) {
        return {pass: true};
    }
    return {pass: false, test, message: "Response does not match regex"};
}

const nsfwResponseTest = async (llmFactory : LLMFactory, response: string, test: NSFWResponseTest): Promise<ResponseTestResult> => {
    const prompt =
        `Please analyze the following text for NSFW content. 
         Determine if the text contains any material that is not safe for work or public settings, 
         such as explicit sexual content, excessive profanity, graphic violence, or other adult themes.
         Text: ${response}
            Respond in JSON format with { "nsfw": false } or { "nsfw": true, "reason": "INSERT_REASON_HERE" }`;
    const responses = await llmFactory.executeLLM(test.llmType, prompt, 1, true);
    const responseJson = JSON.parse(responses[0]);
    if (responseJson.nsfw) {
        return {pass: false, test, message: responseJson.reason};
    }
    return {pass: true};
}


const testers: { [responseType: string]: (llmFactory: LLMFactory, response: string, test: any) => Promise<ResponseTestResult> } = {
    AIResponseTest: aiResponseTest,
    SizeResponseTest: sizeResponseTest,
    RegexResponseTest: regexResponseTest,
    NSFWResponseTest: nsfwResponseTest,
    HateSpeechResponseTest: async (llmFactory: LLMFactory, response: string, test: HateSpeechResponseTest): Promise<ResponseTestResult> => {
        return {pass: false, test, message: "Not implemented"};
    },
    FormatResponseTest: formatResponseTest,
}

const executeOneTest = async (llmFactory: LLMFactory, response: string, test: ResponseTest): Promise<ResponseTestResult> => {
    const tester = testers[test.type];
    if(tester === undefined) {
        return {pass: false, test, message: "Not implemented"};
    }
    return await tester(llmFactory, response, test);
}


export const testLLMResponse = async (llmFactory: LLMFactory, response: string, tests: ResponseTest[]): Promise<ResponseTestsResult> => {
    let failures: ResponseTestFailure[] = [];
    let results = await
        Promise.all(tests.map(async (test) => {
            const result = await executeOneTest(llmFactory, response, test);
            return {test, result};
        }));
    for (const {test, result} of results) {
        if (!result.pass) {
            failures.push(result);
        }
    }
    if (failures.length === 0) {
        return {pass: true};
    } else {
        return {pass: false, failures};
    }
}


const resolveVariables = (prompt: string, variables: { [key: string]: string }): string => {
    let resolvedPrompt = prompt;
    for (const key of Object.keys(variables)) {
        resolvedPrompt = resolvedPrompt.replace(new RegExp(`\\{${key}\\}`, "g"), variables[key]);
    }
    return resolvedPrompt;
}


export const executeLLM = async (llmFactory: LLMFactory,
                                 llmType: LLMType,
                                 prompt: string,
                                 resultVariations: number,
                                 variables: { [key: string]: string }): Promise<string[]> => {
    const resolvedPrompt = resolveVariables(prompt, variables);
    return await llmFactory.executeLLM(llmType, resolvedPrompt, resultVariations, false);
}

export const generatePromptFeedback = async (llmFactory: LLMFactory,
                                             llmType: LLMType,
                                             prompt: string,
                                             resultVariations: number,
                                             variables: { [key: string]: string },
                                             tests: ResponseTest[]): Promise<PromptFeedback> => {
    const responses = await executeLLM(llmFactory, llmType, prompt, resultVariations, variables);
    const results: OnePromptTestResult[] = await Promise.all(responses.map(async (response) => {
        const oneResult = await testLLMResponse(llmFactory, response, tests);
        return {
            prompt,
            response,
            results: oneResult
        };
    }));

    const statistics : ResponseTestStatistics[] = tests.map((test) => {
        const passed = results.filter((result) => {
            if(result.results.pass){
                return true;
            }
            else {
                const thisTestFailed = result.results.failures.some((failure) => failure.test === test);
                return !thisTestFailed;
            }
        }).length;
        const failed = results.length - passed;
        return {
            test,
            passed,
            failed,
            total: results.length
        }
    });


    return {
        prompt,
        resultVariations,
        rawResults: results,
        statistics
    }
}

export const generateImprovedPromptCandidates = async (llmFactory: LLMFactory,
                                                       llmType: LLMType,
                                                       prompt: string,
                                                       promptCandidates: number,
                                                       variables: { [key: string]: string },
                                                       tests: ResponseTest[]) : Promise<string[]> => {
    const variablesString =
        Object.keys(variables).length === 0 ? ""
            : 'The prompt includes the following variables: ' + Object.keys(variables).map((v) => `{${v}}`).join(", ") + ". " +
            "These variables should be present in the alternative prompts. ";

    const testJson = JSON.stringify(tests);

    const searchPrompt = `Create ${promptCandidates} refined prompt candidates that are highly likely to \\
        consistently generate relevant and coherent responses from ChatGPT. The original prompt is "${prompt}".  \\
        ${variablesString}
        
        The following acceptance tests were defined by the prompt auth required to pass for the prompt candidates: ${testJson}
        
        respond in this JSON format { promptCandidates : string[]}`;

    const responses = await llmFactory.executeLLM(llmType, searchPrompt, 1, true);
    const responseJson : any = JSON.parse(responses[0]);
    return responseJson.promptCandidates;
}


