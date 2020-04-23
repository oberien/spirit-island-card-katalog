/// <reference path="lexer.ts" />

namespace Parser {
    // Syntax
    //                filters : '!'? (prop_filter | text) [('AND' | ' ' | ',' | 'OR' | '|') filters]
    //            prop_filter : word ':' prop_filter_value_list
    // prop_filter_value_list : '!'? (num_filter | text) [(',' | '|') prop_filter_value_list] // no spaces anywhere
    //             num_filter : ('<' | '<=' | '=' | '>=' | '>')? number
    //                   text : word | dqstring
    //                   word : [a-zA-Z0-9<=>]*
    //               dqstring : '"' [^"]* '"'
    //                 number : [0-9]*

    export type Filter = And | Or | Not | Text | PropFilter;

    export interface And {
        kind: "and";
        a: Filter;
        b: Filter;
    }

    export interface Or {
        kind: "or";
        a: Filter;
        b: Filter;
    }

    export interface Not {
        kind: "not";
        filter: Filter;
    }

    export interface Text {
        kind: "text";
        text: string;
    }

    export interface PropFilter {
        kind: "propfilter";
        property: string;
        filter: Text | NumFilter;
    }

    export interface NumFilter {
        kind: "numfilter";
        typ: NumFilterType;
        number: number;
    }

    export enum NumFilterType {
        LessThan,
        LessEquals,
        Equals,
        GreaterEquals,
        GreaterThan
    }

    interface PropAnd {
        kind: "propand";
        a: NumFilter | Text | PropAnd | PropOr | PropNot;
        b: NumFilter | Text | PropAnd | PropOr | PropNot;
    }
    interface PropOr {
        kind: "propor";
        a: NumFilter | Text | PropAnd | PropOr | PropNot;
        b: NumFilter | Text | PropAnd | PropOr | PropNot;
    }
    interface PropNot {
        kind: "propnot";
        filter: NumFilter | Text | PropAnd | PropOr | PropNot;
    }

    type ParseResult<T> = { index: number, result: T } | null;

    export function parseFilters(s: string): Filter | null {
        return parseFiltersInternal(0, s);
    }

    function parseFiltersInternal(index: number, s: string): Filter | null {
        const wsRes = parseWhitespace(index, s);
        if (wsRes == null) { throw new Error("this can't happen, we already did an eof-check?!"); }

        const filterRes = parseFilter(index, s);
        if (filterRes == null) { return null; }
        let filter;
        ({ index, result: filter } = filterRes);

        // check for further
    }

    function parseFilter(index: number, s: string): ParseResult<Filter> {
        const res = parsePropertyFilter(index, s);
        if (res != null) {
            return res;
        }

        const res2 = parseText(index, s);
        if (res2 == null) { return null; }
        let { index: newIndex, result: text } = res2;
        return { index: newIndex, result: { kind: "text", text } }
    }

    function parsePropertyFilter(index: number, s: string): ParseResult<PropFilter | Not | And | Or> {
        const res = applyParseFunction(index, s,
            parseWord,
            parseWhitespace,
            checkChar.bind(null, ":"),
            parseWhitespace,
            parsePropertyFilterValueList,
        );
        if (res == null) {
            return null;
        }

        const { index: newIndex, result: [property, /*ws*/, /*:*/, /*ws*/, valueFilterList, foo] } = res;
        index = newIndex;
        console.log("foo", foo);

        function convertPropertyFilter(property: string, filter: NumFilter | Text | PropAnd | PropOr | PropNot): PropFilter | Not | And | Or {
            switch (filter.kind) {
                case "numfilter":
                    return { kind: "propfilter", property, filter };
                case "text":
                    return { kind: "propfilter", property, filter };
                case "propand":
                    return { kind: "and", a: convertPropertyFilter(property, filter.a), b: convertPropertyFilter(property, filter.b) };
                case "propor":
                    return { kind: "or", a: convertPropertyFilter(property, filter.a), b: convertPropertyFilter(property, filter.b) };
                case "propnot":
                    return { kind: "not", filter: convertPropertyFilter(property, filter.filter) };
            }
        }

        return { index, result: convertPropertyFilter(property, valueFilterList) };
    }

    function parsePropertyFilterValueList(index: number, s: string): ParseResult<NumFilter | Text | PropAnd | PropOr | PropNot> {
        if (eof(index, s)) {
            return null;
        }

        const valueRes = parsePropertyFilterValue(index, s);
        if (valueRes == null) { return null; }
        let filter: NumFilter | Text | PropAnd | PropOr | PropNot;
        ({ index, result: filter } = valueRes);

        // check for further values in the value_list
        const commaRes = checkOptionalChar(",", index, s);
        const pipeRes = checkOptionalChar("|", index, s);
        if (commaRes == null || pipeRes == null) {
            return { index, result: filter };
        }
        const { index: commaIndex, result: comma } = commaRes;
        const { index: pipeIndex, result: pipe } = pipeRes;

        if (comma) {
            const propValueRes = parsePropertyFilterValueList(commaIndex, s);
            if (propValueRes == null) {
                return { index, result: filter };
            }
            const { index: newIndex, result: filter2 } = propValueRes;
            return { index: newIndex, result: { kind: "propand", a: filter, b: filter2 } };
        }

        if (pipe) {
            const propValueRes = parsePropertyFilterValueList(pipeIndex, s);
            if (propValueRes == null) {
                return { index, result: filter };
            }
            const { index: newIndex, result: filter2 } = propValueRes;
            return { index: newIndex, result: { kind: "propor", a: filter, b: filter2 } };
        }
        return { index, result: filter };
    }

    function parsePropertyFilterValue(index: number, s: string): ParseResult<NumFilter | Text | PropNot> {
        const notRes = parseOptionalNot(index, s);
        if (notRes == null) { return null; }
        let not;
        ({ index, result: not } = notRes);

        let filter: NumFilter | Text | PropNot;

        const numberFilterRes = parseNumberFilter(index, s);
        if (numberFilterRes != null) {
            ({index, result: filter } = numberFilterRes);
        } else {
            const textRes = parseText(index, s);
            if (textRes == null) {
                return null;
            }
            let text;
            ({ index, result: text } = textRes);
            filter = { kind: "text", text };
        }

        if (not) {
            filter = { kind: "propnot", filter };
        }
        return { index, result: filter };
    }

    /// Parses the number filter, returning the new index into the string and parsed NumFilter, or null if
    /// no NumFilter could be parsed.
    function parseNumberFilter(index: number, s: string): ParseResult<NumFilter> {
        const res = parseText(index, s);
        if (res == null) {
            return null;
        }
        const { index: newIndex, result: text } = res;

        let typ: NumFilterType;
        let consumed: number;
        if (text.startsWith("<")) {
            typ = NumFilterType.LessThan;
            consumed = 1;
        } else if (text.startsWith("<=")) {
            typ = NumFilterType.LessEquals;
            consumed = 2;
        } else if (text.startsWith("=")) {
            typ = NumFilterType.Equals;
            consumed = 1;
        } else if (text.startsWith(">=")) {
            typ = NumFilterType.GreaterEquals;
            consumed = 2;
        } else if (text.startsWith(">")) {
            typ = NumFilterType.GreaterThan;
            consumed = 1;
        } else {
            typ = NumFilterType.Equals;
            consumed = 0;
        }

        let number = parseNumber(consumed, text);
        if (number == null) {
            return null;
        }
        let { result: num } = number;
        return { index: newIndex, result: { kind: "numfilter", typ, number: num } };
    }

    /// Return the new index in the string and the content of the string.
    function parseText(index: number, s: string): ParseResult<string> {
        const dqstring = parseDoubleQuotedString(index, s);
        if (dqstring != null) {
            return dqstring;
        }
        return parseWord(index, s);
    }

    /// Return the new index in the string and the parsed word.
    function parseWord(index: number, s: string): ParseResult<string> {
        return matchRegex(index, s, /[a-zA-Z0-9<=>]/);
    }

    /// Returns the new index in the string and the content of the dqstring.
    /// Returns null if the index is out of bounds or the string doesn't start with the double-quote character.
    function parseDoubleQuotedString(index: number, s: string): ParseResult<string> {
        if (eof(index, s)) { return null; }
        if (s[index] != '"') {
            return null;
        }
        index += 1;
        let result = "";
        while (index < s.length && s[index] != '"') {
            const char = parsePossiblyEscapedChar(index, s);
            if (char == null) {
                return null;
            }
            const { index: newIndex, result: chr } = char;
            index = newIndex;
            result += chr;
        }
        index += 1;
        return { index, result: result };
    }

    /// Returns the new index in the string and the parsed character.
    /// Returns null if the index is out of bounds of s.
    function parsePossiblyEscapedChar(index: number, s: string): ParseResult<string> {
        if (eof(index, s)) {
            return null;
        }
        if (s[index] == "\\") {
            if (eof(index + 1, s)) {
                return null;
            }
            return { index: index + 2, result: s[index + 1] };
        } else {
            return { index: index + 1, result: s[index] };
        }
    }

    function parseOptionalNot(index: number, s: string): ParseResult<boolean> {
        const notRes = checkOptionalChar('!', index, s);
        if (notRes == null) { return null; }
        let not;
        ({ index, result: not } = notRes);
        if (not) {
            const wsRes = parseWhitespace(index, s);
            if (wsRes == null) { return null; }
            index = wsRes.index;
        }
        return { index, result: not };
    }

    /// Checks that the given character is at the given index of the string.
    /// Returns the new index if it was found, and null otherwise.
    function checkChar(char: string, index: number, s: string): ParseResult<void> {
        if (eof(index, s)) {
            return null;
        }
        if (s[index] != char) {
            return null;
        }
        return { index: index + char.length, result: undefined };
    }

    /// Tests if the given character is at the given index of the string.
    /// Returns the new index and a boolean indicating if it was there, or null if eof is reached.
    function checkOptionalChar(char: string, index: number, s: string): ParseResult<boolean> {
        if (eof(index, s)) {
            return null;
        }
        if (s[index] == char) {
            return { index: index + char.length, result: true };
        } else {
            return { index, result: false };
        }
    }

    /// Returns the new index in the string and the parsed number, or null if there is no number.
    /// Returns null if the index is out of bounds of s.
    function parseNumber(index: number, s: string): ParseResult<number> {
        const res = matchRegex(index, s, /\d/);
        if (res == null) {
            return null;
        }
        const { index: newIndex, result: word } = res;
        if (word.length == 0) {
            return null;
        }
        const number = parseInt(word);
        return { index: newIndex, result: number };
    }

    /// Returns the new index in the string and the number of whitespace consumed.
    /// Returns null if the index is out of bounds of s.
    function parseWhitespace(index: number, s: string): ParseResult<number> {
        const res = matchRegex(index, s, /\s/);
        if (res == null) {
            return null;
        }
        const { index: newIndex, result: ws } = res;
        return { index: newIndex, result: ws.length };
    }


    /// Match the regex at the given index of the string as often as possible.
    /// This corresponds to matching `(regex)*`.
    /// Returns the new index in the string and the matched string.
    /// Returns null if the index is out of bounds of s.
    function matchRegex(index: number, s: string, regex: RegExp): ParseResult<string> {
        if (eof(index, s)) {
            return null;
        }
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

    /// Returns if end of the string is reached.
    function eof(index: number, s: string): boolean {
        return index >= s.length;

    }

    type ParseFunction<T> = (index: number, s: string) => ParseResult<T>;

    // // @ts-ignore
    // function applyParseFunction<T1>(index: number, s: string, func1: ParseFunction<T1>): ParseResult<[T1]> {
    //     return <ParseResult<[T1]>>applyParseFunctionsInternal(index, s, func1);
    // }
    // // @ts-ignore
    // function applyParseFunction<T1, T2>(index: number, s: string, func1: ParseFunction<T1>, func2: ParseFunction<T2>): ParseResult<[T1, T2]> {
    //     return <ParseResult<[T1, T2]>>applyParseFunctionsInternal(index, s, func1, func2);
    // }
    // // @ts-ignore
    // function applyParseFunction<T1, T2, T3>(index: number, s: string, func1: ParseFunction<T1>, func2: ParseFunction<T2>, func3: ParseFunction<T3>): ParseResult<[T1, T2, T3]> {
    //     return <ParseResult<[T1, T2, T3]>>applyParseFunctionsInternal(index, s, func1, func2, func3);
    // }
    // // @ts-ignore
    // function applyParseFunction<T1, T2, T3, T4>(index: number, s: string, func1: ParseFunction<T1>, func2: ParseFunction<T2>, func3: ParseFunction<T3>, func4: ParseFunction<T4>): ParseResult<[T1, T2, T3, T4]> {
    //     return <ParseResult<[T1, T2, T3, T4]>>applyParseFunctionsInternal(index, s, func1, func2, func3, func4);
    // }
    // // @ts-ignore
    // function applyParseFunction<T1, T2, T3, T4, T5>(index: number, s: string, func1: ParseFunction<T1>, func2: ParseFunction<T2>, func3: ParseFunction<T3>, func4: ParseFunction<T4>, func5: ParseFunction<T5>): ParseResult<[T1, T2, T3, T4, T5]> {
    //     return <ParseResult<[T1, T2, T3, T4, T5]>>applyParseFunctionsInternal(index, s, func1, func2, func3, func4, func5);
    // }
    // @ts-ignore
    function applyParseFunction<T1, T2 = never, T3 = never, T4 = never, T5 = never, T6 = never>(index: number, s: string, func1: ParseFunction<T1>, func2?: ParseFunction<T2>, func3?: ParseFunction<T3>, func4?: ParseFunction<T4>, func5?: ParseFunction<T5>, func6?: ParseFunction<T6>): ParseResult<[T1, T2, T3, T4, T5, T6]> {
        return <ParseResult<[T1, T2, T3, T4, T5, T6]>>applyParseFunctionsInternal(index, s, func1, func2, func3, func4, func5, func6);
    }

    function applyParseFunctionsInternal(index: number, s: string, ...funcs: (((index: number, s: string) => ParseResult<any>) | undefined)[]): ParseResult<any[]> {
        const returnValues = [];
        for (const func of funcs) {
            if (!func) {
                break;
            }
            const res = func(index, s);
            if (res == null) {
                return null;
            }
            let result;
            ({ index, result } = res);
            returnValues.push(result);
        }
        return { index, result: returnValues };
    }
}
