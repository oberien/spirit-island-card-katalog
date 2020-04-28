namespace Lexer {
    export type Token = Text | Regex | Integer | Comparison | Colon | Bang | Comma | Pipe | Whitespace | OpenParen | CloseParen;
    export type Text = DqString | Word;
    export interface DqString {
        kind: "dqstring";
        span: [number, number];
        text: string;
    }
    export interface Word {
        kind: "word";
        span: [number, number];
        text: string;
    }
    export interface Regex {
        kind: "regex";
        span: [number, number];
        regex: string;
    }
    export interface Integer {
        kind: "int";
        span: [number, number];
        number: number;
    }
    export interface Comparison {
        kind: "comparison";
        span: [number, number];
        typ: ComparisonType;
    }
    export enum ComparisonType {
        LessThan,
        LessEquals,
        Equals,
        GreaterEquals,
        GreaterThan,
    }

    export function comparisonTypeToString(c: ComparisonType): string {
        switch (c) {
            case ComparisonType.LessThan: return "<";
            case ComparisonType.LessEquals: return "<=";
            case ComparisonType.Equals: return "==";
            case ComparisonType.GreaterEquals: return ">=";
            case ComparisonType.GreaterThan: return ">";
        }
    }

    export interface Colon {
        span: [number, number];
        kind: "colon";
    }
    export interface Bang {
        kind: "bang";
        span: [number, number];
    }
    export interface Whitespace {
        kind: "whitespace";
        span: [number, number];
    }
    export interface Comma {
        kind: "comma";
        span: [number, number];
    }
    export interface Pipe {
        kind: "pipe";
        span: [number, number];
    }
    export interface OpenParen {
        kind: "openparen";
        span: [number, number];
    }
    export interface CloseParen {
        kind: "closeparen";
        span: [number, number];
    }


    interface LexResult<T> {
        /** New Index **/
        index: number;
        result: T;
    }

    export function lex(s: string): Token[] {
        const tokens: Token[] = [];
        let index = 0;

        while (!eof(index, s)) {
            let token;
            ({ index, result: token } = lexToken(index, s));
            tokens.push(token);
        }

        return tokens;
    }

    function lexToken(index: number, s: string): LexResult<Token> {
        switch (true) {
            case s[index] == '"': return lexDoubleQuotedString(index, s);
            case s[index] == '!': return { index: index + 1, result: { kind: "bang", span: [index, index + 1] } };
            case s[index] == ':': return { index: index + 1, result: { kind: "colon", span: [index, index + 1] } };
            case s[index] == ',': return { index: index + 1, result: { kind: "comma", span: [index, index + 1] } };
            case s[index] == "|": return { index: index + 1, result: { kind: "pipe", span: [index, index + 1] } };
            case s[index] == "(": return { index: index + 1, result: { kind: "openparen", span: [index, index + 1] } };
            case s[index] == ")": return { index: index + 1, result: { kind: "closeparen", span: [index, index + 1] } };
            case s[index] == "/":
                const regex = lexRegex(index, s);
                if (regex == null) {
                    return lexWord(index, s);
                } else {
                    return regex
                }
            case /\s/.test(s[index]): return lexWhitespace(index, s);
            case /\d/.test(s[index]): return lexInteger(index, s);
            case /[<=>]/.test(s[index]): return lexComparison(index, s);
            default: return lexWord(index, s);
        }
    }

    function lexRegex(index: number, s: string): LexResult<Regex> | null {
        if (s[index] != "/") {
            throw new Error("lexRegExp called without leading slash character");
        }
        const start = index;
        index += 1;
        while (!eof(index, s) && s[index] != "/") {
            ({ index } = consumePossiblyEscapedChar(index, s));
        }
        // While dqstrings could not be closed yet, we should accept plain slashes as text
        if (s[index] != "/") { return null; }
        index++;
        return { index, result: { kind: "regex", span: [start, index], regex: s.substring(start + 1, index - 1) } }
    }

    function lexDoubleQuotedString(index: number, s: string): LexResult<DqString> {
        if (s[index] != '"') {
            throw new Error("lexDoubleQuotedString called without leading double-quote character");
        }
        const dqStringStart = index;
        index += 1;
        const textStart = index;
        while (!eof(index, s) && s[index] != '"') {
            ({ index } = consumePossiblyEscapedChar(index, s));
        }
        const textEnd = index;
        index += 1;
        const dqStringEnd = index;
        return { index, result: { kind: "dqstring", span: [dqStringStart, dqStringEnd], text: s.substring(textStart, textEnd) } };
    }

    function consumePossiblyEscapedChar(index: number, s: string): LexResult<void> {
        if (s[index] == "\\") {
            if (eof(index + 1, s)) {
                return { index: index + 1, result: undefined };
            }
            return { index: index + 2, result: undefined };
        } else {
            return { index: index + 1, result: undefined };
        }
    }

    function lexWord(index: number, s: string): LexResult<Word> {
        const startIndex = index;
        let word;
        ({ index, result: word } = matchRegex(index, s, /[^:,|()\s]/));
        return { index, result: { kind: "word", span: [startIndex, index], text: word } };
    }

    /** Parses a number comparison operator (must consume at least one character) **/
    function lexComparison(index: number, s: string): LexResult<Comparison> {
        if (s[index] == '<') {
            if (!eof(index + 1, s) && s[index + 1] == '=') {
                return { index: index + 2, result: { kind: "comparison", span: [index, index + 2], typ: ComparisonType.LessEquals } };
            }
            return { index: index + 1, result: { kind: "comparison", span: [index, index + 1], typ: ComparisonType.LessThan } };
        } else if (s[index] == '=') {
            return { index: index + 1, result: { kind: "comparison", span: [index, index + 1], typ: ComparisonType.Equals } };
        } else if (s[index] == '>') {
            if (!eof(index + 1, s) && s[index + 1] == '=') {
                return { index: index + 2, result: { kind: "comparison", span: [index, index + 2], typ: ComparisonType.GreaterEquals } };
            }
            return { index: index + 1, result: { kind: "comparison", span: [index, index + 1], typ: ComparisonType.GreaterThan } };
        } else {
            throw new Error("lexComparison called without a comparison operator");
        }
    }

    /** Parses an integer number. Must consume at least one character. **/
    function lexInteger(index: number, s: string): LexResult<Integer> {
        const startIndex = index;
        const res = matchRegex(index, s, /\d/);
        const { index: newIndex, result: word } = res;
        const number = parseInt(word);
        return { index: newIndex, result: { kind: "int", span: [startIndex, newIndex], number } };
    }

    /** Consumes as much whitespace as possible (must consume at least one) **/
    function lexWhitespace(index: number, s: string): LexResult<Whitespace> {
        const startIndex = index;
        const res = matchRegex(index, s, /\s/);
        let ws;
        ({ index, result: ws } = res);
        if (ws.length == 0) {
            throw new Error("lexWhitespace called without whitespace");
        }
        return { index, result: { kind: "whitespace", span: [startIndex, index] } };
    }

    /** Matches the given regex as often as possible from the given index in the string, returning the whole match. **/
    function matchRegex(index: number, s: string, regex: RegExp): LexResult<string> {
        let consumed = 0;
        while (regex.test(s[index])) {
            index += 1;
            consumed += 1;
            if (eof(index, s)) {
                break;
            }
        }
        return { index, result: s.substring(index - consumed, index) };
    }


    function eof(index: number, s: string): boolean {
        return index >= s.length;
    }
}
