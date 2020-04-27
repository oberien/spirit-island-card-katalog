/// <reference path="types.ts" />

namespace Filter.Old {
    class ExtensibleFunction extends Function {
        constructor(fn: (card: Card) => boolean) {
            super();
            return Object.setPrototypeOf(fn, new.target.prototype);
        }
    }

    class Filter extends ExtensibleFunction {
        private fnString: string;

        constructor(fn: (card: Card) => boolean) {
            let fnString = fn.toString();
            super(fn);
            this.fnString = fnString;
        }

        static all(...filters: Filter[]) {
            return new Filter((card) => filters.reduce((res, filter) => res && filter(card), true));
        }

        toString() {
            return "Filter: " + this.fnString;
        }
    }

    class NegationFilter extends Filter {
        constructor(filter: Filter) {
            super((card) => !filter(card));
        }
    }

    class PropFilter extends Filter {
        constructor(private property: string, private f: (value: any) => boolean) {
            super((card) => {
                let val = (card as any)[this.property];
                if (val == null) {
                    return false;
                }
                return this.f(val);
            });
        }

        toString() {
            return "PropFilter on " + this.property + ": " + this.f.toString();
        }
    }

    class IncludesFilter extends Filter {
        constructor(private includes: string) {
            super((card) => {
                const cardstring = card.getSearchString().toLowerCase();
                return cardstring.includes(includes);
            });
        }

        toString() {
            return "IncludesFilter should include '" + this.includes + "'";
        }
    }

    class PropIncludesFilter extends PropFilter {
        constructor(private prop: string, private includes: string) {
            super(prop, (val) => {
                const propstring = propToString(val).toLowerCase();
                return propstring.includes(this.includes);
            });
        }

        toString() {
            return "PropIncludesFilter on " + this.prop + " should include '" + this.includes + "'";
        }
    }

    class PropWholeWordFilter extends PropFilter {
        private regex: RegExp;

        constructor(private prop: string, private word: string) {
            super(prop, (val) => {
                const propstring = propToString(val).toLowerCase();
                return this.regex.test(propstring);
            });
            let escaped = regexEscape(this.word);
            let delim = "(^|$|[^a-zA-Z0-9_])";
            let regex = delim + escaped + delim;
            this.regex = new RegExp(regex);
        }

        toString() {
            return "PropWholeWordFilter on " + this.prop + " should include word group '" + this.word
                + "' by testing for " + this.regex;
        }
    }

    class WholeWordFilter extends Filter {
        private regex: RegExp;

        constructor(private word: string) {
            super((card) => {
                const cardstring = card.getSearchString().toLowerCase();
                return this.regex.test(cardstring);
            });
            let escaped = regexEscape(this.word);
            let delim = "(^|$|[^a-zA-Z0-9_])";
            let regex = delim + escaped + delim;
            this.regex = new RegExp(regex);
        }

        toString() {
            return "WholeWordFilter should include word group '" + this.word + "' by testing for " + this.regex;
        }
    }

    function regexEscape(str: string) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    function getPropertyFilterString(search: string, name: string): [string | null, string, number | null] {
        let idx = search.indexOf(name + ":");
        if (idx >= 0) {
            let start = idx + name.length + 1;
            let end;
            if (search[start] == '"' || (search[start] == "!" && search.length > start+1 && search[start+1] == '"')) {
                end = search.indexOf('"', search[start] == "!" ? start + 2 : start + 1);
                end = end == -1 ? search.length : end + 1;
            } else {
                end = search.indexOf(' ', start);
                end = end == -1 ? search.length : end;
            }
            return [search.substring(start, end), search.substring(0, idx) + search.substring(end + 1, search.length), idx];
        }
        return [null, search, null];
    }

    function propToString(prop: any) {
        if (prop == LandAny) {
            return "Any";
        }
        return prop.toString().replace(/&/g, "and");
    }

    function stringToPropertyFilter(filterString: string, property: string): Filter {
        if (filterString.startsWith("<=")) {
            return new PropFilter(property, (val) => val <= filterString.substring(2));
        } else if (filterString.startsWith(">=")) {
            return new PropFilter(property, (val) => val >= filterString.substring(2));
        } else if (filterString.startsWith("<")) {
            return new PropFilter(property, (val) => val < filterString.substring(1));
        } else if (filterString.startsWith(">")) {
            return new PropFilter(property, (val) => val > filterString.substring(1));
        } else if (filterString.startsWith("!")) {
            return new NegationFilter(stringToPropertyFilter(filterString.substring(1), property))
        } else if (filterString.startsWith('"')) {
            let end;
            if (filterString.endsWith('"') && filterString.length > 1) {
                end = filterString.length - 1;
            } else {
                end = filterString.length;
            }
            return new PropWholeWordFilter(property, filterString.substring(1, end));
        } else {
            return new PropIncludesFilter(property, filterString);
        }
    }

    function getPropertyFilters(searchstring: string, property: string): [Filter[], string] {
        let filter: string | null = "";
        let search: string = searchstring;
        let filters: Filter[] = [];
        while (filter != null) {
            [filter, search] = getPropertyFilterString(search, property);
            if (filter == null) {
                break;
            }
            filters.push(stringToPropertyFilter(filter as string, property));
        }
        return [filters, search];
    }

    function getAllFilters(searchstring: string): Filter[] {
        let filters: Filter[] = [];
        // property filters
        const props = Types.getCardProperties();
        for (const prop of props) {
            let fs;
            [fs, searchstring] = getPropertyFilters(searchstring, prop);
            filters = filters.concat(fs);
        }

        // word groups
        let groups = searchgroups(searchstring);
        for (const group of groups) {
            if (group.startsWith('"')) {
                let end;
                if (group.endsWith('"')) {
                    end = group.length - 1;
                } else {
                    end = group.length;
                }
                filters.push(new WholeWordFilter(group.substring(1, end)));
            } else {
                filters.push(new IncludesFilter(group));
            }
        }
        return filters;
    }

    export function filterAll(cards: Card[], searchstring: string): Card[] {
        searchstring = searchstring.replace(/&/g, "and");
        const filters = getAllFilters(searchstring);
        cards = cards.filter(c => Filter.all(...filters)(c));
        return cards;
    }

    function searchgroups(search: string): string[] {
        let res: string[] = [];
        if (search.length == 0) {
            return res;
        }
        while (search.indexOf('"') >= 0) {
            let start = search.indexOf('"');
            let end = search.indexOf('"', start + 1) + 1;
            if (end == 0) {
                end = search.length;
            }
            res.push(search.substring(start, end));
            search = search.substring(0, start) + search.substring(end);
        }
        res = res.concat(search.split(" "));
        return res;
    }
}
