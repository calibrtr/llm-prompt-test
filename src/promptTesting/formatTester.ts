import {FormatResponseTest, ResponseTestResult} from "./types.js";
import {LLMFactory} from "../aiAdapters/llmFactory.js";

function isValidJavaScript(code: string): boolean {
    try {
        // The Function constructor is used here to parse the code.
        // Since we're not executing the code, no arguments are passed.
        new Function(code);
        return true; // No error means the syntax is valid
    } catch (e) {
        return false; // An error indicates invalid JavaScript syntax
    }
}

const testers: {[formatType: string] : (response: string) => string | undefined}  = {
    "text": (response: string) => response === undefined ? "Response is undefined" : undefined,
    "json": (response: string) => {
        try {
            JSON.parse(response);
        } catch(e) {
            return "Response is not valid JSON";
        }
        return undefined;
    },
    "html": (response: string) => {
        return "html check not implemented";
    },
    "csv": (response: string) => {
        return "csv check not implemented";
    },
    "javascript": (response: string) => {
        if(isValidJavaScript(response)) {
            return undefined;
        }
        return "Response is not valid JavaScript";
    },
    "typescript": (response: string) => {
        return "typescript check not implemented";
    },
    "python": (response: string) => {
        return "python check not implemented";
    },
}

export const formatResponseTest = async (llmFactory: LLMFactory, response: string, test: FormatResponseTest): Promise<ResponseTestResult> => {
    const tester = testers[test.expectedFormat];
    if(tester === undefined) {
        return {pass: false, test, message: "Not implemented"};
    }
    const message = tester(response);
    if(message === undefined) {
        return {pass: true};
    }
    return {pass: false, test, message};
}