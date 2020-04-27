/// <reference path="types.ts">
/// <reference path="parser.ts">
/// <reference path="filter-old.ts">
/// <reference path="filter-compiled.ts">

namespace Filter {
    export enum FilterType {
        Old,
        Compiled,
    }

    export function filterAll(cards: Card[], searchstring: string, typ: FilterType) {
        searchstring = searchstring.replace(/&/g, "and");
        switch (typ) {
            case FilterType.Old: return Filter.Old.filterAll(cards, searchstring);
            case FilterType.Compiled:
                const ast = Parser.parseFilters(searchstring);
                if (ast == null) {
                    return cards;
                }
                const fn = Filter.Compiled.compile(ast);
                return fn(cards);
        }
    }
}
