/// <reference path="types.ts">
/// <reference path="parser.ts">

namespace Filter.Compiled {
    import Filter = Parser.Filter;
    import Card = Types.Card;

    export function compile(ast: Filter): (cards: Card[]) => Card[] {
        const test = compileToString(ast);
        console.log(test);
        const fn = new Function("cards", "return cards.filter(card => " + test + ");");
        return <(cards: Card[]) => Card[]>fn;
    }

    function compileToString(f: Filter): string {
        switch (f.kind) {
            case "text": return "card.getSearchString().includes(\"" + escapeString(f.text) + "\")";
            case "regex": return "card.getSearchString().search(" + (f.regex == "" ? "new RegExp()" : "/" + f.regex + "/") + ") != -1";
            case "propfilter":
                switch (f.filter.kind) {
                    case "numfilter": return "((prop = card[\"" + escapeString(f.property) + "\"]) == null ? false : prop " + Lexer.comparisonTypeToString(f.filter.typ) + " " + f.filter.number + ")";
                    case "text":
                        return "(" +
                            "(prop = card[\"" + escapeString(f.property) + "\"]) == null ? false : (" +
                                "(prop = (prop == Types.LandAny ? 'Any' : prop.toString().replace(/&/g, 'and')).toLowerCase()).includes(" +
                                    "\"" + escapeString(f.filter.text) + "\"" +
                                ")" +
                            ")" +
                        ")";
                    case "regex":
                        return "(" +
                            "(prop = card[\"" + escapeString(f.property) + "\"]) == null ? false : (" +
                                "(prop = (prop == Types.LandAny ? 'Any' : prop.toString().replace(/&/g, 'and')).toLowerCase()).search(" +
                                    (f.filter.regex == "" ? "new RegExp()" : "/" + f.filter.regex + "/") +
                                ") != -1" +
                            ")" +
                        ")";
                    default: assertNever(f.filter);
                }
                throw new Error("unreachable");
            case "not": return "!" + compileToString(f.filter);
            case "and": return "(" + compileToString(f.a) + " && " + compileToString(f.b) + ")";
            case "or": return "(" + compileToString(f.a) + " || " + compileToString(f.b) + ")";
            default: assertNever(f);
        }
    }

    function escapeString(s: string): string {
        return s.replace(/"/g, "\\\"");
    }

    function assertNever(x: never): never {
        throw new Error("Unexpected Object: " + x);
    }
}
