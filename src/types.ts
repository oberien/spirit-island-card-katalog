namespace Types {
    export enum Speed {
        Fast = "Fast",
        Slow = "Slow",
    }

    export enum Land {
        Ocean = "Ocean",
        Jungle = "Jungle",
        Wetland = "Wetland",
        Mountain = "Mountain",
        Sand = "Sand",
        Coastal = "Coastal",
    }

    export const LandAny = [Land.Ocean, Land.Jungle, Land.Wetland, Land.Mountain, Land.Sand, Land.Coastal];

    export enum TargetSpirit {
        Any = "Any Spirit",
        Another = "Another Spirit",
    }

    export enum TargetProperty {
        Dahan = "Dahan",
        Invaders = "Invaders",
        Blight = "Blight",
        NoBlight = "No Blight",
        NoInvaders = "No Invaders",
    }

    export type Target = Land | Land[] | TargetSpirit | TargetProperty;

    export enum Source {
        Site = "Site",
        SacredSite = "SacredSite",
    }

    export class Ranges {
        constructor(public from: Source, public range: number | number[], public land?: (Land[] | undefined)) {
        }

        toString() {
            let res = this.from + " ";
            if (this.land) {
                res += "on" + this.land + ", ";
            }
            return res + this.range;
        }

        valueOf() {
            return this.range;
        }
    }

    export enum Elements {
        Sun = "Sun",
        Moon = "Moon",
        Fire = "Fire",
        Air = "Air",
        Water = "Water",
        Earth = "Earth",
        Plant = "Plant",
        Animal = "Animal",
    }

    export enum Spirit {
        ASpreadOfRampantGreen = "A Spread of Rampant Green",
        BringerOfDreamsAndNightmares = "Bringer of Dreams and Nightmares",
        LightngingsSwiftStrike = "Lightning's Swift Strike",
        OceansHungryGrasp = "Ocean's Hungry Grasp",
        RiverSurgesInSunlight = "River Surges in Sunlight",
        ShadowsFlickerLikeFlame = "Shadows Flicker Like Flame",
        Thunderspeaker = "Thunderspeaker",
        VitalStrengthOfTheEarth = "Vital Strength of the Earth",
    }

    export enum CardType {
        Minor = "Minor",
        Major = "Major",
    }

    export type PowerType = Spirit | CardType;

    export class Card {
        constructor(public type: PowerType, public name: string, public cost: number, public speed: Speed,
                    public range: Ranges | null, public target: Target, public elements: Elements[],
                    public description: string) {
        }

        toSearchString() {
            let s = this.type + " " + this.cost + " " + this.name + " " + this.speed;
            if (this.range != null) {
                s += " " + this.range.from + " " + this.range.range;
            }
            if (this.target == LandAny) {
                s += " Any";
            }
            s += " " + this.target + " " + this.elements + " " + this.description;
            return s;
        }

        toTableRow() {
            let row = document.createElement("tr");
            row.insertCell().innerText = this.type;
            row.insertCell().innerText = this.cost.toString();
            row.insertCell().innerText = this.name;
            row.insertCell().innerText = this.speed;
            let range = "";
            if (this.range != null) {
                range = this.range.from + " " + this.range.range;
            } else {
                range = "---";
            }
            row.insertCell().innerText = range;
            let target = "";
            if (this.target instanceof Array) {
                if (this.target == LandAny) {
                    target = "Any";
                } else {
                    target += this.target.join(", ");
                }
            } else {
                target += this.target;
            }
            row.insertCell().innerText = target;
            row.insertCell().innerText = this.elements.join(", ");
            row.insertCell().innerText = this.description;
            return row;
        }

        toImage() {
            let img = document.createElement("img");
            img.src = this.toImageName();
            return img;
        }

        toImageName() {
            return "imgs/" + this.name.toLowerCase().replace(/ /g, "_").replace(/[^a-z_]/g, "") + ".jpg";
        }
    }
}
