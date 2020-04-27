/// <reference path="types.ts">
/// <reference path="parser.ts">

namespace Filter.Compiled {
    import Filter = Parser.Filter;
    import Card = Types.Card;

    export function compile(ast: Filter): (cards: Card[]) => Card[] {
        const test = compileToString(ast);
        const fn = new Function("cards", "return cards.filter(card => " + test + ");");
        return <(cards: Card[]) => Card[]>fn;
    }

    function compileToString(f: Filter): string {
        switch (f.kind) {
            case "text": return "card.getSearchString().includes(\"" + escapeString(f.text) + "\")";
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
                }
                throw new Error("unreachable");
            case "not": return "!" + compileToString(f.filter);
            case "and": return "(" + compileToString(f.a) + " && " + compileToString(f.b) + ")";
            case "or": return "(" + compileToString(f.a) + " || " + compileToString(f.b) + ")";
        }
    }

    function escapeString(s: string): string {
        return s.replace(/"/g, "\\\"");
    }
}
