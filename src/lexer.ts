namespace Lexer {
    export type Token = Text | Op | Colon | Bang | Whitespace;

    export type Text = DqString | Word;

    export interface DqString {
        kind: "dqstring";
        text: string;
    }

    export interface Word {
        kind: "word";
        text: string;
    }

    export interface Number {
        kind: "number";
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

    export interface Op {
        kind: "op";
        op: OpKind;
    }

    export enum OpKind {
        And,
        Or,
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

    interface LexResult<T> {
        index: number;
        result: T;
    }


    export function lex(s: string): Token[] {
        const tokens: Token[] = [];
        const index = 0;

        while (index < s.lenght) {
            switch (s[index]) {
                case '"':
                    let text;
                    ({ index, result: text } = lexDoubleQuotedString(index, s));
                    tokens.push({ kind: "dqstring", text });
                    break;
                    case
            }
        }

        return tokens;
    }

    function lexToken(index: number, s: string): LexResult<Token> {
        
    }

    function lexDoubleQuotedString(index: number, s: string): LexResult<string> {
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
        return { index, result: s.substring(textStart, textEnd) };
    }
,
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

    function eof(index: number, s: string): boolean {
        return index >= s.length;
    }
}
