/// <reference path="lexer.ts" />
/// <reference path="types.ts" />

namespace Parser {
    // Syntax:
    //                 filters : filter ((' ' | ',' | '|') filter)*
    //                  filter : prop_filter | text | not_filter | paren_filter
    //            paren_filter : '(' filters ')'
    //              not_filter : '!' filter
    //             prop_filter : word ':' prop_filter_value_list
    //  prop_filter_value_list : prop_filter_value ((',' | '|') prop_filter_value)* // no spaces anywhere
    //       prop_filter_value : num_filter | text
    // prop_filter_paren_value : '(' prop_filter_value_list ')'
    //   prop_filter_not_value : '!' prop_filter_value
    //              num_filter : ('<' | '<=' | '=' | '>=' | '>')? number
    //                    text : word | dqstring
    //                    word : [a-zA-Z0-9<=>]*
    //                dqstring : // double quoted string possibly with escaped quotes
    //                  number : [0-9]*

    import Token = Lexer.Token;
    import ComparisonType = Lexer.ComparisonType;
    import comparisonTypeToString = Lexer.comparisonTypeToString;
    export type Filter = And | Or | Not | Text | Regex | PropFilter;

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

    export interface Regex {
        kind: "regex";
        regex: string;
    }

    export interface PropFilter {
        kind: "propfilter";
        property: string;
        filter: Text | Regex | NumFilter;
    }

    export interface NumFilter {
        kind: "numfilter";
        typ: ComparisonType;
        number: number;
    }

    interface PropAnd {
        kind: "propand";
        a: NumFilter | Text | Regex | PropAnd | PropOr | PropNot;
        b: NumFilter | Text | Regex | PropAnd | PropOr | PropNot;
    }
    interface PropOr {
        kind: "propor";
        a: NumFilter | Text | Regex | PropAnd | PropOr | PropNot;
        b: NumFilter | Text | Regex | PropAnd | PropOr | PropNot;
    }
    interface PropNot {
        kind: "propnot";
        filter: NumFilter | Text | Regex | PropAnd | PropOr | PropNot;
    }

    enum BinOpPrecedence {
        // lowest = least precedence
        Lowest = 0,
        Paren = 1,
        Or = 2,
        And = 3,
        Highest = 4,
    }

    type ParseResult<T> = { index: number, result: T } | null;

    export function toString(f: Filter): string {
        switch (f.kind) {
            case "text": return '"' + f.text + '"';
            case "regex": return "/" + f.regex + "/";
            case "not": return "!" + toString(f.filter);
            case "propfilter": return f.property + ":" + propFilterToString(f.filter);
            case "and": return "(" + toString(f.a) + " AND " + toString(f.b) + ")";
            case "or": return "(" + toString(f.a) + " OR " + toString(f.b) + ")";
            default: assertNever(f);
        }
    }

    function propFilterToString(f: Text | Regex | NumFilter): string {
        switch (f.kind) {
            case "text": return '"' + f.text + '"';
            case "regex": return "/" + f.regex + "/";
            case "numfilter": return comparisonTypeToString(f.typ) + f.number;
            default: assertNever(f);
        }
    }

    export function parseFilters(s: string): Filter | null {
        const tokens = Lexer.lex(s);

        const filterRes = parseFiltersWithPrecedence(BinOpPrecedence.Lowest, 0, tokens);
        if (filterRes == null) { return null; }
        const { result: filter } = filterRes;
        return filter;
    }

    function parseFiltersWithPrecedence(currentPrecedence: BinOpPrecedence, index: number, tokens: Token[]): ParseResult<Filter> {
        const wsResult = consumeWhitespace(index, tokens);
        if (wsResult == null) { return null; }
        ({ index } = wsResult);

        if (eof(index, tokens)) { return null; }

        const not = tokens[index].kind == "bang";
        if (not) {
            index++;
            if (eof(index, tokens)) { return null; }
        }

        let lhs: Filter;
        let token = tokens[index];
        switch (token.kind) {
            case "openparen":
                const filterRes = parseFiltersWithPrecedence(BinOpPrecedence.Paren, index + 1, tokens);
                if (filterRes == null) { return null; }
                ({ index, result: lhs } = filterRes);
                if (eof(index, tokens)) { return null; }
                if (tokens[index].kind != "closeparen") {
                    console.error("Unclosed parenthesis at " + token.span[0]);
                } else {
                    index++;
                }
                break;
            case "closeparen":
                // if we are somewhere within the parse tree, the closing paren could be handled by an upper recursion instance
                if (currentPrecedence == BinOpPrecedence.Lowest) {
                    console.error("Unmatched close parenthesis in filter list at " + token.span[0]);
                }
                return null;
            default:
                const filterResult = parseFilter(index, tokens);
                if (filterResult == null) { return null; }
                ({ index, result: lhs } = filterResult);
        }

        if (not) {
            lhs = { kind: "not", filter: lhs };
        }

        while (true) {
            let rhs: Filter;
            // test for following binops
            if (eof(index, tokens)) { return { index, result: lhs }; }
            const binOpToken = tokens[index];
            switch (binOpToken.kind) {
                case "whitespace":
                    const ws2Result = consumeWhitespace(index, tokens);
                    if (ws2Result == null) { throw new Error("this literally can't happen"); }
                    ({ index } = ws2Result);
                    const wsRhsResult = parseFiltersWithPrecedence(BinOpPrecedence.And, index, tokens);
                    if (wsRhsResult == null) {
                        // a different operator is following (or there is a syntax error), continue loop
                        continue;
                    }
                    // we actually got whitespace as an AND, check precedence level
                    if (currentPrecedence > BinOpPrecedence.And) {
                        return { index, result: lhs };
                    }
                    ({ index, result: rhs } = wsRhsResult);
                    lhs = { kind: "and", a: lhs, b: rhs};
                    continue;
                // binary operators
                case "comma":
                    if (currentPrecedence > BinOpPrecedence.And) {
                        return { index, result: lhs };
                    }
                    const andRhsResult = parseFiltersWithPrecedence(BinOpPrecedence.And, index + 1, tokens);
                    if (andRhsResult == null) {
                        // whitespace could follow, indicating the comma was for filter-and and not prop-filter-value-and
                        return { index, result: lhs };
                    }
                    ({ index, result: rhs } = andRhsResult);
                    lhs = { kind: "and", a: lhs, b: rhs };
                    continue;
                case "pipe":
                    if (currentPrecedence > BinOpPrecedence.Or) {
                        return { index, result: lhs };
                    }
                    const orRhsResult = parseFiltersWithPrecedence(BinOpPrecedence.Or, index + 1, tokens);
                    if (orRhsResult == null) {
                        return { index, result: lhs };
                    }
                    ({ index, result: rhs } = orRhsResult);
                    lhs = { kind: "or", a: lhs, b: rhs };
                    continue;
                case "closeparen":
                    // if we are somewhere within the parse tree, the closing paren could be handled by an upper recursion instance
                    if (currentPrecedence == BinOpPrecedence.Lowest) {
                        console.error("Unmatched close parenthesis in filter list at " + token.span[0]);
                    }
                    return { index, result: lhs };
                // invalid tokens
                case "openparen":
                case "int":
                case "comparison":
                case "word":
                case "dqstring":
                case "bang":
                case "colon":
                case "regex":
                    console.error("invalid token '" + binOpToken.kind + "' at " + binOpToken.span[0]);
                    return {index, result: lhs};
                default: assertNever(binOpToken);
            }
        }
    }

    function parseFilter(index: number, tokens: Token[]): ParseResult<Filter> {
        const wsRes = consumeWhitespace(index, tokens);
        if (wsRes == null) { return null; }

        const propRes = parsePropertyFilter(index, tokens);
        if (propRes != null) {
            return propRes;
        }

        const textResult = parseText(index, tokens);
        if (textResult != null) {
            let { index: newIndex, result: text } = textResult;
            return { index: newIndex, result: { kind: "text", text } };
        }

        const regexResult = parseRegex(index, tokens);
        if (regexResult == null) { return null; }
        let { index: newIndex, result: regex } = regexResult;
        return { index: newIndex, result: { kind: "regex", regex } };
    }

    function parsePropertyFilter(index: number, tokens: Token[]) {
        const res = applyParseFunction(index, tokens,
            parseWord,
            consumeWhitespace,
            checkTokenKind.bind(null, "colon"),
            consumeWhitespace,
            parsePropertyFilterValueList.bind(null, BinOpPrecedence.Lowest),
        );
        if (res == null) {
            return null;
        }

        const { index: newIndex, result: [property, /*ws*/, /*:*/, /*ws*/, valueFilterList] } = res;
        const cardProperties = Types.getCardProperties();
        if (cardProperties.indexOf(property) == -1) {
            console.error("Unknown card property '" + property + "'\n" + "Allowed properties are: " + cardProperties);
            // continue
        }
        index = newIndex;

        function convertPropertyFilter(property: string, filter: NumFilter | Text | Regex | PropAnd | PropOr | PropNot): PropFilter | Not | And | Or {
            switch (filter.kind) {
                case "numfilter":
                    return { kind: "propfilter", property, filter };
                case "text":
                    return { kind: "propfilter", property, filter };
                case "regex":
                    return { kind: "propfilter", property, filter };
                case "propand":
                    return { kind: "and", a: convertPropertyFilter(property, filter.a), b: convertPropertyFilter(property, filter.b) };
                case "propor":
                    return { kind: "or", a: convertPropertyFilter(property, filter.a), b: convertPropertyFilter(property, filter.b) };
                case "propnot":
                    return { kind: "not", filter: convertPropertyFilter(property, filter.filter) };
                default: assertNever(filter);
            }
        }

        return { index, result: convertPropertyFilter(property, valueFilterList) };
    }

    function parsePropertyFilterValueList(currentPrecedence: BinOpPrecedence, index: number, tokens: Token[]): ParseResult<NumFilter | Text | Regex | PropAnd | PropOr | PropNot> {
        let lhs: NumFilter | Text | Regex | PropAnd | PropOr | PropNot;
        if (eof(index, tokens)) { return null; }

        const not = tokens[index].kind == "bang";
        if (not) {
            index++;
            if (eof(index, tokens)) { return null; }
        }

        const token = tokens[index];
        switch (token.kind) {
            case "openparen":
                const filterRes = parsePropertyFilterValueList(BinOpPrecedence.Paren, index + 1, tokens);
                if (filterRes == null) {
                    return null;
                }
                ({ index, result: lhs } = filterRes);
                if (eof(index, tokens)) {
                    return null;
                }
                if (tokens[index].kind != "closeparen") {
                    console.error("Unclosed parenthesis at " + token.span[0]);
                } else {
                    index++;
                }
                break;
            case "closeparen":
                // if we are somewhere within the parse tree, the closing paren could be handled by an upper recursion instance
                if (currentPrecedence == BinOpPrecedence.Lowest) {
                    console.error("Unmatched close parenthesis in property value list at " + token.span[0]);
                }
                return null;
            default:
                const valueRes = parsePropertyFilterValue(index, tokens);
                if (valueRes == null) { return null; }
                ({ index, result: lhs } = valueRes);
        }

        if (not) {
            lhs = { kind: "propnot", filter: lhs };
        }

        // parse and merge while same precedence until higher precedence
        while (true) {
            // peek for operators with same or higher precedence
            if (eof(index, tokens)) {
                return { index, result: lhs };
            }

            let rhs: NumFilter | Text | Regex | PropAnd | PropOr | PropNot;
            let binOpToken = tokens[index];
            switch (binOpToken.kind) {
                // binary operators
                case "comma":
                    if (currentPrecedence > BinOpPrecedence.And) {
                        return { index, result: lhs };
                    }
                    const andRhsResult = parsePropertyFilterValueList(BinOpPrecedence.And, index + 1, tokens);
                    if (andRhsResult == null) {
                        // whitespace could follow, indicating the comma was for filter-and and not prop-filter-value-and
                        return { index, result: lhs };
                    }
                    ({ index, result: rhs } = andRhsResult);
                    lhs = { kind: "propand", a: lhs, b: rhs };
                    continue;
                case "pipe":
                    if (currentPrecedence > BinOpPrecedence.Or) {
                        return { index, result: lhs };
                    }
                    const orRhsResult = parsePropertyFilterValueList(BinOpPrecedence.Or, index + 1, tokens);
                    if (orRhsResult == null) {
                        return { index, result: lhs };
                    }
                    ({ index, result: rhs } = orRhsResult);
                    lhs = { kind: "propor", a: lhs, b: rhs };
                    continue;
                // end of value list
                case "whitespace":
                    return { index, result: lhs };
                case "closeparen":
                    // if we are somewhere within the parse tree, the closing paren could be handled by an upper recursion instance
                    if (currentPrecedence == BinOpPrecedence.Lowest) {
                        console.error("Unmatched close parenthesis in property value list at " + token.span[0]);
                    }
                    return { index, result: lhs };
                // invalid tokens
                case "openparen":
                case "int":
                case "comparison":
                case "word":
                case "dqstring":
                case "bang":
                case "colon":
                case "regex":
                    console.error("invalid token '" + binOpToken.kind + "' at " + binOpToken.span[0]);
                    return { index, result: lhs };
                default: assertNever(binOpToken);
            }
        }
    }

    function parsePropertyFilterValue(index: number, tokens: Token[]): ParseResult<NumFilter | Text | Regex | PropNot> {
        if (eof(index, tokens)) { return null; }
        const not = tokens[index].kind == "bang";
        if (not) {
            index++;
            if (eof(index, tokens)) { return null; }
        }

        let filter: NumFilter | Text | Regex | PropNot;

        const numberFilterRes = parseNumberFilter(index, tokens);
        if (numberFilterRes != null) {
            ({ index, result: filter } = numberFilterRes);
        } else {
            const textRes = parseText(index, tokens);
            if (textRes != null) {
                let text;
                ({ index, result: text } = textRes);
                filter = { kind: "text", text };
            } else {
                const regexRes = parseRegex(index, tokens);
                if (regexRes == null) { return null; }
                let regex;
                ({ index, result: regex } = regexRes);
                filter = { kind: "regex", regex };
            }
        }

        if (not) {
            filter = { kind: "propnot", filter };
        }
        return { index, result: filter };
    }

    /// Parses the number filter, returning the new index into the string and parsed NumFilter, or null if
    /// no NumFilter could be parsed.
    function parseNumberFilter(index: number, tokens: Token[]): ParseResult<NumFilter> {
        if (eof(index, tokens)) { return null; }

        const token = tokens[index];
        switch (token.kind) {
            case "int":
                return { index: index + 1, result: { kind: "numfilter", typ: ComparisonType.Equals, number: token.number} };
            case "comparison":
                if (eof(index + 1, tokens)) { return null; }
                const numberToken = tokens[index + 1];

                switch (numberToken.kind) {
                    case "int": return { index: index + 2, result: { kind: "numfilter", typ: token.typ, number: numberToken.number } };
                    default: return null;
                }
            default:
                return null;
        }
    }

    function parseText(index: number, tokens: Token[]): ParseResult<string> {
        if (eof(index, tokens)) { return null; }
        const text = tokens[index];
        switch (text.kind) {
            case "dqstring":
            case "word":
                return { index: index + 1, result: text.text };
            default:
                return null;
        }
    }

    function parseWord(index: number, tokens: Token[]): ParseResult<string> {
        if (eof(index, tokens)) { return null; }
        const token = tokens[index];
        switch (token.kind) {
            case "word": return { index: index + 1, result: token.text };
            default: return null;
        }
    }

    function parseRegex(index: number, tokens: Token[]): ParseResult<string> {
        if (eof(index, tokens)) { return null; }
        const token = tokens[index];
        switch (token.kind) {
            case "regex": return { index: index + 1, result: token.regex };
            default: return null;
        }
    }

    /// Checks that the given token is at the given index of the token-array.
    function checkTokenKind(expectedKind: string, index: number, tokens: Token[]): ParseResult<void> {
        if (eof(index, tokens)) { return null; }
        if (tokens[index].kind != expectedKind) {
            return null;
        }
        return { index: index + 1, result: undefined };
    }

    function consumeWhitespace(index: number, tokens: Token[]): ParseResult<boolean> {
        let hasWhitespace = false;
        while (!eof(index, tokens) && tokens[index].kind == "whitespace") {
            hasWhitespace = true;
            index++;
        }
        return { index, result: hasWhitespace };
    }

    /** Returns if the index is larger than the array length. **/
    function eof(index: number, arr: Token[]): boolean {
        return index >= arr.length;
    }

    type ParseFunction<T> = (index: number, tokens: Token[]) => ParseResult<T>;

    function applyParseFunction<T1, T2 = never, T3 = never, T4 = never, T5 = never, T6 = never>(index: number, tokens: Token[], func1: ParseFunction<T1>, func2?: ParseFunction<T2>, func3?: ParseFunction<T3>, func4?: ParseFunction<T4>, func5?: ParseFunction<T5>, func6?: ParseFunction<T6>): ParseResult<[T1, T2, T3, T4, T5, T6]> {
        return <ParseResult<[T1, T2, T3, T4, T5, T6]>>applyParseFunctionsInternal(index, tokens, func1, func2, func3, func4, func5, func6);
    }

    function applyParseFunctionsInternal(index: number, tokens: Token[], ...funcs: ((ParseFunction<any>) | undefined)[]): ParseResult<any[]> {
        const returnValues = [];
        for (const func of funcs) {
            if (!func) {
                break;
            }
            const res = func(index, tokens);
            if (res == null) {
                return null;
            }
            let result;
            ({ index, result } = res);
            returnValues.push(result);
        }
        return { index, result: returnValues };
    }

    function assertNever(x: never): never {
        throw new Error("Unexpected Object: " + x);
    }
}
