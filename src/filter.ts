/// <reference path="types.ts" />

namespace Filter {
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

    class PropFilter extends Filter {
        constructor(private prop: string, private f: (value: any) => boolean) {
            super((card) => {
                let val = (card as any)[this.prop];
                if (val == null) {
                    return false;
                }
                return this.f(val);
            });
        }

        toString() {
            return "PropFilter on " + this.prop + ": " + this.f.toString();
        }
    }

    class IncludesFilter extends Filter {
        constructor(includes: string) {
            super((card) => {
                const cardstring = card.toSearchString().toLowerCase();
                return cardstring.includes(includes);
            });
        }
    }

    class PropIncludesFilter extends Filter {
        constructor(private prop: string, private includes: string) {
            super((card) => {
                let val = (card as any)[this.prop];
                if (val == null) {
                    return false;
                }
                const propstring = propToString(val).toLowerCase();
                return propstring.includes(this.includes);
            });
        }

        toString() {
            return "PropIncludesFilter on " + this.prop + " should include " + this.includes;
        }
    }

    function getPropertyFilterString(search: string, name: string): [string | null, string, number | null] {
        let idx = search.indexOf(name + ":");
        if (idx >= 0) {
            let start = idx + name.length + 1;
            let end;
            let rest_off;
            if (search[start] == '"') {
                end = search.indexOf('"', start) + 1;
                rest_off = 1;
            } else {
                end = search.indexOf(' ', start);
                rest_off = 1;
            }
            if (end == -1) {
                end = search.length;
            }
            return [search.substring(start, end), search.substring(0, idx) + search.substring(end + rest_off, search.length), idx];
        }
        return [null, search, null];
    }

    function propToString(prop: any) {
        if (prop == LandAny) {
            return "Any (" + prop.toString() + ")";
        }
        return prop.toString();
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
            let filterString = filter as string;

            if (filterString.startsWith("<=")) {
                filters.push(new PropFilter(property, (val) => val <= filterString.substring(2)));
            } else if (filterString.startsWith(">=")) {
                filters.push(new PropFilter(property, (val) => val >= filterString.substring(2)));
            } else if (filterString.startsWith("<")) {
                filters.push(new PropFilter(property, (val) => val < filterString.substring(2)));
            } else if (filterString.startsWith(">")) {
                filters.push(new PropFilter(property, (val) => val > filterString.substring(2)));
            } else {
                filters.push(new PropIncludesFilter(property, filterString));
            }

        }
        return [filters, search];
    }

    function getAllFilters(searchstring: string): Filter[] {
        let filters: Filter[] = [];
        // property filters
        const dummy = new (Card as any)();
        for (const prop in dummy) {
            if (dummy.hasOwnProperty(prop)) {
                if (typeof(dummy[prop]) == "function") {
                    continue;
                }
                let fs;
                [fs, searchstring] = getPropertyFilters(searchstring, prop);
                filters = filters.concat(fs);
            }
        }

        // word groups
        let groups = searchgroups(searchstring);
        for (const group of groups) {
            filters.push(new IncludesFilter(group));
        }
        return filters;
    }

    export function filterAll(cards: Card[], searchstring: string): Card[] {
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
            let end = search.indexOf('"', start + 1);
            if (end == -1) {
                end = search.length;
            }
            res.push(search.substring(start + 1, end));
            search = search.substring(0, start) + search.substring(end + 1);
        }
        res = res.concat(search.split(" "));
        return res;
    }
}
