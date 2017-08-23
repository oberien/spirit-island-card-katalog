/// <reference path="db.ts" />
/// <reference path="types.ts" />
/// <reference path="filter.ts" />

const LandAny = Types.LandAny;
type Card = Types.Card;
const Card = Types.Card;

const CARDS = DB.CARDS;
const filterAll = Filter.filterAll;

document.addEventListener("DOMContentLoaded", () => {
    const body = <HTMLBodyElement> document.getElementsByTagName("body")[0];
    const search = <HTMLInputElement> document.getElementById("search");
    const sort = <HTMLSelectElement> document.getElementById("sort");
    const order = <HTMLDivElement> document.getElementById("arrow");

    body.onresize = () => CARDS.forEach(c => c.onresize());
    body.onkeypress = e => {
        if (e.key === 's' && !(e.target instanceof HTMLInputElement)) {
            search.focus();
        }
    };
    search.oninput = _ => update();
    sort.onchange = _ => update();
    order.onclick = _ => {
        order.classList.toggle("rotated");
        update();
    };

    update();

});

function update() {
    const search = <HTMLInputElement> document.getElementById("search");
    const result = <HTMLParagraphElement> document.getElementById("result");
    const numResults = <HTMLDivElement> document.getElementById("num-results");
    const sort = <HTMLSelectElement> document.getElementById("sort");
    const order = <HTMLDivElement> document.getElementById("arrow");

    // clear old content
    while (result.firstChild) {
        result.removeChild(result.firstChild);
    }

    let searchstring = search.value.toLowerCase();
    let sortby = sort.value.toLowerCase();
    let ascending = !order.classList.contains("rotated");
    let cards = CARDS;

    cards = filterAll(cards, searchstring);

    numResults.innerText = "Results: " + cards.length;

    cards = cards.sort((a, b) => {
        let propa = (a as any)[sortby];
        let propb = (b as any)[sortby];
        let st = ascending ? -1 : 1;
        let gt = ascending ? 1 : -1;
        return propa === propb ? 0 : (propa < propb ? st : gt);
    });

    for (const card of cards) {
        let flex = <HTMLDivElement> document.createElement("div");
        flex.classList.add("flex-50", "xs-flex-33", "sm-flex-25", "md-flex-20", "l-flex-15", "xl-flex-12", "xxl-flex-10");
        flex.appendChild(card.toCard());
        result.appendChild(flex);
    }

    // add a few extra to make sure that the trailing line is full as well
    for (let i = 0; i < 10; i++) {
        let flex = <HTMLDivElement> document.createElement("div");
        flex.classList.add("flex-50", "xs-flex-33", "sm-flex-25", "md-flex-20", "l-flex-15", "xl-flex-12", "xxl-flex-10");
        flex.style.height = "0px";
        result.appendChild(flex);
    }
}
