/// <reference path="db.ts" />
/// <reference path="types.ts" />

import CARDS = DB.CARDS;

const search = <HTMLInputElement> document.getElementById("search");
const result = <HTMLParagraphElement> document.getElementById("result");

function update() {
    let table = document.createElement("table");
    table.border = "1";
    let header = document.createElement("tr");
    let type = document.createElement("th");
    type.innerText = "Type";
    header.appendChild(type);
    let cost = document.createElement("th");
    cost.innerText = "Cost";
    header.appendChild(cost);
    let name = document.createElement("th");
    name.innerText = "Name";
    header.appendChild(name);
    let speed = document.createElement("th");
    speed.innerText = "Speed";
    header.appendChild(speed);
    let range = document.createElement("th");
    range.innerText = "Range";
    header.appendChild(range);
    let target = document.createElement("th");
    target.innerText = "Target";
    header.appendChild(target);
    let elements = document.createElement("th");
    elements.innerText = "Elements";
    header.appendChild(elements);
    let description = document.createElement("th");
    description.innerText = "Description";
    header.appendChild(description);
    table.appendChild(header);

    let searchstring = search.value.toLowerCase();
    let cards = CARDS;

    [cards, searchstring] = filter(cards, searchstring, "type");
    [cards, searchstring] = filter(cards, searchstring, "cost");
    [cards, searchstring] = filter(cards, searchstring, "name");
    [cards, searchstring] = filter(cards, searchstring, "speed");
    [cards, searchstring] = filter(cards, searchstring, "range");
    [cards, searchstring] = filter(cards, searchstring, "target");
    [cards, searchstring] = filter(cards, searchstring, "elements");
    [cards, searchstring] = filter(cards, searchstring, "description");

    cards.filter(e => {
        let contains = true;
        for (const word of searchstring.split(" ")) {
            contains = contains && e.toSearchString().toLowerCase().indexOf(word) >= 0;
        }
        return contains;
    }).forEach(e => table.appendChild(e.toTableRow()));

    // clear old content
    if (result.firstChild) {
        result.removeChild(result.firstChild);
    }
    result.appendChild(table);
}

search.oninput = _ => update();

function getFilter(search: string, name: string): [string | null, string] {
    let idx = search.indexOf(name + ":");
    if (idx >= 0) {
        let start = idx + name.length + 1;
        let end;
        let rest_off;
        if (search[start] == '"') {
            start += 1;
             end = search.indexOf('"', start);
             rest_off = 2;
        } else {
            end = search.indexOf(' ', start);
            rest_off = 1;
        }
        if (end == -1) {
            end = search.length;
        }
        return [search.substring(start, end), search.substring(0, idx) + search.substring(end + rest_off, search.length)];
    }
    return [null, search];
}

function propToString(prop: any) {
    if (prop == LandAny) {
        return "Any (" + prop.toString() + ")";
    }
    return prop.toString();
}

function filter(cards: Card[], searchstring: string, property: string): [Card[], string] {
    let filter: string | null = "";
    let search: string = searchstring;
    while (filter != null) {
        [filter, search] = getFilter(search, property);
        if (filter != null) {
            let filterString = filter as string;
            cards = cards.filter(c => {
                let prop = (c as any)[property];
                if (prop == null) {
                    return false;
                }
                if (filterString.indexOf("<") == 0) {
                    return prop < filterString.substring(1);
                }
                if (filterString.indexOf(">") == 0) {
                    return prop > filterString.substring(2);
                }
                return propToString((c as any)[property]).toLowerCase().indexOf(filter) >= 0;
            });
        }
    }
    return [cards, search];
}

update();
