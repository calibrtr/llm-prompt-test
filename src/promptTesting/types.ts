import {LLMType} from "../aiAdapters/llmAdapter.js";

export type AIResponseTest = {
    type: "AIResponseTest";
    llmType: LLMType;
    should: string;
}

export type SizeResponseTest = {
    type: "SizeResponseTest";
    minChars?: number;
    maxChars?: number;
    minWords?: number;
    maxWords?: number;
}

export type RegexResponseTest = {
    type: "RegexResponseTest";
    regex: string;
}

export type NSFWResponseTest = {
    type: "NSFWResponseTest";
    llmType: LLMType;
}

export type HateSpeechResponseTest = {
    type: "HateSpeechResponseTest";
    llmType: LLMType;
}

export type ResponseFormat = "text" | "json" | "html" | "csv" | "javascript" | "typescript" | "python"

export type FormatResponseTest = {
    type: "FormatResponseTest";
    expectedFormat: ResponseFormat;
}


export type ResponseTest =
    | AIResponseTest
    | SizeResponseTest
    | RegexResponseTest
    | NSFWResponseTest
    | HateSpeechResponseTest
    | FormatResponseTest;

export type ResponseTestFailure =
    {
        pass: false;
        test: ResponseTest;
        message: string;
    }

export type ResponseTestsFailed = {
    pass: false;
    failures: ResponseTestFailure[];
}

export type ResponseTestPassed = {
    pass: true;
}

export type ResponseTestResult =
    | ResponseTestPassed
    | ResponseTestFailure;

export type ResponseTestsResult =
    | ResponseTestPassed
    | ResponseTestsFailed;

export type OnePromptTestResult = {
    prompt: string,
    response: string,
    results: ResponseTestsResult
}

export type ResponseTestStatistics = {
    test: ResponseTest;
    passed: number;
    failed: number;
    total: number;
}

export type PromptFeedback = {
    prompt: string;
    resultVariations: number;
    statistics : ResponseTestStatistics[];
    rawResults: OnePromptTestResult[];
}