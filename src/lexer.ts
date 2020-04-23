namespace Lexer {
    export type Token = Text | Integer | Comparison | Colon | Bang | Comma | Pipe | Whitespace | LeftParen | RightParen;
    export type Text = DqString | Word;
    export interface DqString {
        kind: "dqstring";
        text: string;
    }
    export interface Word {
        kind: "word";
        text: string;
    }
    export interface Integer {
        kind: "int";
        number: number;
    }
    export interface Comparison {
        kind: "comparison";
        typ: ComparisonType;
    }
    export enum ComparisonType {
        LessThan,
        LessEquals,
        Equals,
        GreaterEquals,
        GreaterThan,
    }
    export interface Colon {
        kind: "colon";
    }
    export interface Bang {
        kind: "bang";
    }
    export interface Whitespace {
        kind: "whitespace";
    }
    export interface Comma {
        kind: "comma";
    }
    export interface Pipe {
        kind: "pipe";
    }
    export interface LeftParen {
        kind: "leftparen";
    }
    export interface RightParen {
        kind: "rightparen";
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
            case s[index] == '!': return { index: index + 1, result: { kind: "bang" } };
            case s[index] == ':': return { index: index + 1, result: { kind: "colon" } };
            case s[index] == ',': return { index: index + 1, result: { kind: "comma" } };
            case s[index] == "|": return { index: index + 1, result: { kind: "pipe" } };
            case s[index] == "(": return { index: index + 1, result: { kind: "leftparen" } };
            case s[index] == ")": return { index: index + 1, result: { kind: "rightparen" } };
            case /\s/.test(s[index]): return lexWhitespace(index, s);
            case /\d/.test(s[index]): return lexInteger(index, s);
            case /[<=>]/.test(s[index]): return lexComparison(index, s);
            default: return lexWord(index, s);
        }
    }

    function lexDoubleQuotedString(index: number, s: string): LexResult<DqString> {
        if (s[index] != '"') {
            throw new Error("lexDoubleQuotedString called without leading double-quote character");
        }
        index += 1;
        const textStart = index;
        while (!eof(index, s) && s[index] != '"') {
            ({ index } = consumePossiblyEscapedChar(index, s));
        }
        const textEnd = index;
        index += 1;
        return { index, result: { kind: "dqstring", text: s.substring(textStart, textEnd) } };
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
        let word;
        ({ index, result: word } = matchRegex(index, s, /[^:,|]/));
        return { index, result: { kind: "word", text: word } };
    }

    /** Parses a number comparison operator (must consume at least one character) **/
    function lexComparison(index: number, s: string): LexResult<Comparison> {
        if (s[index] == '<') {
            if (!eof(index + 1, s) && s[index + 1] == '=') {
                return { index: index + 2, result: { kind: "comparison", typ: ComparisonType.LessEquals } };
            }
            return { index: index + 1, result: { kind: "comparison", typ: ComparisonType.LessThan } };
        } else if (s[index] == '=') {
            return { index: index + 1, result: { kind: "comparison", typ: ComparisonType.Equals } };
        } else if (s[index] == '>') {
            if (!eof(index + 1, s) && s[index + 1] == '=') {
                return { index: index + 2, result: { kind: "comparison", typ: ComparisonType.GreaterEquals } };
            }
            return { index: index + 1, result: { kind: "comparison", typ: ComparisonType.GreaterThan } };
        } else {
            throw new Error("lexComparison called without a comparison operator");
        }
    }

    /** Parses an integer number. Must consume at least one character. **/
    function lexInteger(index: number, s: string): LexResult<Integer> {
        const res = matchRegex(index, s, /\d/);
        const { index: newIndex, result: word } = res;
        const number = parseInt(word);
        return { index: newIndex, result: { kind: "int", number } };
    }

    /** Consumes as much whitespace as possible (must consume at least one) **/
    function lexWhitespace(index: number, s: string): LexResult<Whitespace> {
        const res = matchRegex(index, s, /\s/);
        let ws;
        ({ index, result: ws } = res);
        if (ws.length == 0) {
            throw new Error("lexWhitespace called without whitespace");
        }
        return { index, result: { kind: "whitespace" } };
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
