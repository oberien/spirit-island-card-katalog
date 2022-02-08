/// <reference path="db.ts" />
/// <reference path="types.ts" />
/// <reference path="filter.ts" />

import FilterType = Filter.FilterType;

const LandAny = Types.LandAny;
type Card = Types.Card;
const Card = Types.Card;

const CARDS = DB.CARDS;
const EXTRA_CARDS: HTMLDivElement[] = [];

function getParameterByName(name: string) {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

document.addEventListener("DOMContentLoaded", () => {
    const body = <HTMLBodyElement> document.getElementsByTagName("body")[0];
    const search = <HTMLInputElement> document.getElementById("search");
    const sort = <HTMLSelectElement> document.getElementById("sort");
    const order = <HTMLDivElement> document.getElementById("arrow");

    for (let i = 0; i < 10; i++) {
        let flex = <HTMLDivElement> document.createElement("div");
        flex.classList.add("flex-50", "xs-flex-33", "sm-flex-25", "md-flex-20", "l-flex-15", "xl-flex-12", "xxl-flex-10");
        flex.style.height = "0px";
        EXTRA_CARDS.push(flex);
    }


    body.onresize = () => CARDS.forEach(c => c.onresize());
    body.onkeypress = e => {
        if (e.key === 's' && !(e.target instanceof HTMLInputElement)) {
            search.focus();
            e.preventDefault();
        }
    };
    let timeout: ReturnType<typeof setTimeout>;
    search.oninput = _ => {
        clearTimeout(timeout);
        timeout = setTimeout(() => update(), 300);
    };
    sort.onchange = _ => update();
    order.onclick = _ => {
        order.classList.toggle("rotated");
        update();
    };

    // get query parameter
    let query = getParameterByName("query");
    if (query) {
        search.value = query;
    }

    update();
});

function update() {
    const search = <HTMLInputElement> document.getElementById("search");
    const result = <HTMLParagraphElement> document.getElementById("result");
    const numResults = <HTMLDivElement> document.getElementById("num-results");
    const sort = <HTMLSelectElement> document.getElementById("sort");
    const order = <HTMLDivElement> document.getElementById("arrow");

    history.replaceState(null, "", "?query=" + encodeURIComponent(search.value));

    // clear old content
    while (result.firstChild) {
        result.removeChild(result.firstChild);
    }

    let searchstring = search.value.toLowerCase().replace(/&/g, "and");
    let sortby = sort.value.toLowerCase();
    let ascending = !order.classList.contains("rotated");
    let cards: Card[] = CARDS;

    cards = Filter.filterAll(cards, searchstring, FilterType.Compiled);

    numResults.innerText = "Results: " + cards.length;

    cards = cards.sort((a, b) => {
        let propa = (a as any)[sortby];
        let propb = (b as any)[sortby];
        if (propa === undefined) {
            return 1;
        }
        if (propb === undefined) {
            return -1;
        }
        let st = ascending ? -1 : 1;
        let gt = ascending ? 1 : -1;
        return propa === propb ? 0 : (propa < propb ? st : gt);
    });

    for (const card of cards) {
        result.appendChild(card.getCardFlexElement());
    }

    // add a few extra to make sure that the trailing line is full as well
    for (let flex of EXTRA_CARDS) {
        result.appendChild(flex);
    }
}
