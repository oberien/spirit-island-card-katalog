namespace Lexer {
    export type Text = DqString | Word;

    export interface DqString {
        kind: "dqstring";
        text: string;
    }

    export interface Word {
        kind: "word";
        text: string;
    }

    export interface Op {
        kind: "op";
        op: OpKind;
    }

    export enum OpKind {
        And,
        Or,
    }

    
}
