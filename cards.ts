enum Speed {
    Fast = "Fast",
    Slow = "Slow",
}

enum Land {
    Ocean = "Ocean",
    Forest = "Forest",
    Wetland = "Wetland",
    Mountain = "Mountain",
    Sand = "Sand",
    Coastal = "Coastal",
}

const LandAny = [Land.Ocean, Land.Forest, Land.Wetland, Land.Mountain, Land.Sand];

enum TargetSpirit {
    Any = "Any Spirit",
    Another = "Another Spirit",
}

type Target = Land | Land[] | TargetSpirit;

enum Source {
    Site = "Site",
    SacredSite = "SacredSite",
}

class Ranges {
    from: Source;
    range: number | number[];

    constructor(from: Source, range: number | number[]) {
        this.from = from;
        this.range = range;
    }
}

enum Elements {
    Sun = "Sun",
    Moon = "Moon",
    Fire = "Fire",
    Air = "Air",
    Water = "Water",
    Earth = "Earth",
    Planet = "Planet",
    Animal = "Animal",
}

enum Spirit {
    A_SPREAD_OF_RAMPANT_GREEN = "A Spread of Rampant Green",
    BRINGER_OF_DREAMS_AND_NIGHTMARES = "Bringer of Dreams and Nightmares",
    LIGHTNINGS_SWIFT_STRIKE = "Lightning's Swift Strike",
    OCEANS_HUNGRY_GRASP = "Ocean's Hungry Grasp",
    RIVER_SURGES_IN_SUNLIGHT = "River Surges in Sunlight",
    SHADOWS_FLICKER_LIKE_FLAME = "Shadows Flicker Like Flame",
    THUNDERSPEAKER = "Thunderspeaker",
    VITAL_STRENGTH_OF_THE_EARTH = "Vital Strength of the Earth",
}

enum CardType {
    Minor = "Minor",
    Major = "Major",
}

type PowerType = Spirit | CardType;

class Card {
    type: PowerType;
    cost: number;
    name: string;
    speed: Speed;
    range: Ranges;
    target: Target;
    elements: Elements[];
    description: string;

    constructor(type: PowerType, name: string, cost: number, speed: Speed, range: Ranges, target: Target,
                elements: Elements[], description: string) {
        this.type = type;
        this.name = name;
        this.cost = cost;
        this.speed = speed;
        this.range = range;
        this.target = target;
        this.elements = elements;
        this.description = description;
    }

    toSearchString() {
        let s = this.type + " " + this.cost + " " + this.name + " " + this.speed + " ";
        if (this.range != null) {
            s += this.range.from + " " + this.range.range + " ";
        }
        if (this.target == LandAny) {
            s += "Any ";
        }
        s += this.target + " " + this.elements + " " + this.description;
        return s;
    }

    toTableRow() {
        let row = document.createElement("tr");
        let type = document.createElement("td");
        type.innerText = this.type;
        row.appendChild(type);
        let cost = document.createElement("td");
        cost.innerText = this.cost.toString();
        row.appendChild(cost);
        let name = document.createElement("td");
        name.innerText = this.name;
        row.appendChild(name);
        let speed = document.createElement("td");
        speed.innerText = this.speed;
        row.appendChild(speed);
        if (this.range != null) {
            let range = document.createElement("td");
            range.innerText = this.range.from + " " + this.range.range;
            row.appendChild(range);
        } else {
            row.appendChild(document.createElement("td"));
        }
        let target = document.createElement("td");
        if (this.target instanceof Array) {
            if (this.target == LandAny) {
                target.innerText = "Any";
            } else {
                target.innerText += this.target.join(", ");
            }
        } else {
            target.innerText += this.target;
        }
        row.appendChild(target);
        let elements = document.createElement("td");
        elements.innerText = this.elements.join(", ");
        row.appendChild(elements);
        let description = document.createElement("td");
        description.innerText = this.description;
        row.appendChild(description);
        return row;
    }
}

const search = <HTMLInputElement> document.getElementById("search");
const result = <HTMLParagraphElement> document.getElementById("result");
search.oninput = evt => {
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

    cards.filter(e => {
        let contains = true;
        for (const word of search.value.toLowerCase().split(" ")) {
            contains = contains && e.toSearchString().toLowerCase().indexOf(word) >= 0;
        }
        return contains;
    }).forEach(e => table.appendChild(e.toTableRow()));

    // clear old content
    if (result.firstChild) {
        result.removeChild(result.firstChild);
    }
    result.appendChild(table);
};

const cards = [
    new Card(Spirit.LIGHTNINGS_SWIFT_STRIKE, "Shatter Homesteads", 2, Speed.Slow, new Ranges(Source.SacredSite, 2), LandAny,
        [Elements.Fire, Elements.Air], "1 Fear. Destroy 1 Village."),
    new Card(Spirit.LIGHTNINGS_SWIFT_STRIKE, "Raging Storm", 3, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Fire, Elements.Air, Elements.Water], "1 Damage to each Invader."),
    new Card(Spirit.LIGHTNINGS_SWIFT_STRIKE, "Lighning's Boon", 1, Speed.Fast, null, TargetSpirit.Any,
        [Elements.Fire, Elements.Air], "Target Spirit may use up to 2 Slow Powers as if they were Fast Powers this turn"),
    new Card(Spirit.LIGHTNINGS_SWIFT_STRIKE, "Harbingers of the Lightning", 0, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Fire, Elements.Air], "Push up to 2 Dahan. 1 Fear if you pushed any Dahan into a land with Town / City"),
    new Card(Spirit.RIVER_SURGES_IN_SUNLIGHT, "Flash Floods", 2, Speed.Fast, new Ranges(Source.Site, 1), LandAny,
        [Elements.Sun, Elements.Water], "1 Damage. If target land is Coastal, +1 Damage."),
    new Card(Spirit.RIVER_SURGES_IN_SUNLIGHT, "Wash Away", 1, Speed.Slow, new Ranges(Source.Site, 1), LandAny,
        [Elements.Water, Elements.Earth], "Push up to 3 Explorers / Towns"),
    new Card(Spirit.RIVER_SURGES_IN_SUNLIGHT, "Boon of Vigor", 0, Speed.Fast, null, TargetSpirit.Any,
        [Elements.Sun, Elements.Water, Elements.Planet], "If you target yourself, gain 1 Energy. If you target another Spirit, they gain 1 Energy per Power Card they played this turn."),
    new Card(Spirit.RIVER_SURGES_IN_SUNLIGHT, "River's Bounty", 0, Speed.Slow, new Ranges(Source.Site, 0), LandAny,
        [Elements.Sun, Elements.Water, Elements.Animal], "Gather up to 2 Dahan. If there are now at least 2 Dahan, add 1 Dahan and gain 1 Energy."),
    new Card(Spirit.SHADOWS_FLICKER_LIKE_FLAME, "Concealing Shadows", 0, Speed.Fast, new Ranges(Source.Site, 0), LandAny,
        [Elements.Moon, Elements.Air], "1 Fear. Dahan take no damage from Ravaging Invaders this turn."),
    // new Card(Spirit.SHADOWS_FLICKER_LIKE_FLAME, )
    // new Card(Spirit.SHADOWS_FLICKER_LIKE_FLAME, )
    // new Card(Spirit.SHADOWS_FLICKER_LIKE_FLAME, )
];

search.oninput(null);

