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
        Inland = "Inland",
    }

    export const LandAny = [Land.Ocean, Land.Jungle, Land.Wetland, Land.Mountain, Land.Sand, Land.Coastal];

    export enum TargetSpirit {
        Any = "Any Spirit",
        Another = "Another Spirit",
    }

    export enum TargetProperty {
        Dahan = "Dahan",
        Invaders = "Invaders",
        City = "City",
        Blight = "Blight",
        NoBlight = "No Blight",
        NoInvaders = "No Invaders",
    }

    export type TargetType = Land | TargetSpirit | TargetProperty;

    export type Target = TargetType | TargetType[];

    export enum Source {
        Presence = "Presence",
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
            if (Array.isArray(this.range)) {
                res += this.range.join(" & ");
            } else {
                res += this.range;
            }
            return res;
        }

        valueOf() {
            if (Array.isArray(this.range)) {
                return Math.max.apply(null, this.range);
            }
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

    export enum Unique {
        ASpreadOfRampantGreen = "Unique: A Spread of Rampant Green",
        BringerOfDreamsAndNightmares = "Unique: Bringer of Dreams and Nightmares",
        LightngingsSwiftStrike = "Unique: Lightning's Swift Strike",
        OceansHungryGrasp = "Unique: Ocean's Hungry Grasp",
        RiverSurgesInSunlight = "Unique: River Surges in Sunlight",
        ShadowsFlickerLikeFlame = "Unique: Shadows Flicker Like Flame",
        Thunderspeaker = "Unique: Thunderspeaker",
        VitalStrengthOfTheEarth = "Unique: Vital Strength of the Earth",
        SharpFangsBehindTheLeaves = "Unique: Sharp Fangs behind the Leaves",
        KeeperOfTheForbiddenWilds = "Unique: Keeper of the Forbidden Wilds",
        SerpentSlumberingBeneathTheIsland = "Unique: Serpent Slumbering Beneath the Island",
        HeartOfTheWildfire = "Unique: Heart of the Wildfire",
    }

    export enum PowerDeckType {
        BasegameMinor = "Basegame Minor",
        BasegameMajor = "Basegame Major",
        ExpansionMinor = "Expansion Minor",
        ExpansionMajor = "Expansion Major",
    }

    export type PowerType = Unique | PowerDeckType;

    export enum FearType {
        BasegameFear = "Basegame Fear",
        ExpansionFear = "Expansion Fear",
    }

    export type CardType = PowerType | FearType;

    function toColor(type: string) {
        switch (type) {
            case PowerDeckType.BasegameMinor:
            case PowerDeckType.ExpansionMinor:
                return "rgba(50, 50, 50, 0.3)";
            case PowerDeckType.BasegameMajor:
            case PowerDeckType.ExpansionMajor:
                return "rgba(255, 255, 0, 0.25)";
            case Unique.ASpreadOfRampantGreen:
            case Unique.BringerOfDreamsAndNightmares:
            case Unique.LightngingsSwiftStrike:
            case Unique.OceansHungryGrasp:
            case Unique.RiverSurgesInSunlight:
            case Unique.ShadowsFlickerLikeFlame:
            case Unique.Thunderspeaker:
            case Unique.VitalStrengthOfTheEarth:
            case Unique.SharpFangsBehindTheLeaves:
            case Unique.KeeperOfTheForbiddenWilds:
            case Unique.HeartOfTheWildfire:
            case Unique.SerpentSlumberingBeneathTheIsland:
                return "rgba(0, 128, 0, 0.25)";
            default:
                throw new Error();
        }
    }

    export abstract class Card {
        private fontSize: number | null;
        private p: HTMLSpanElement | null;
        private container: HTMLDivElement | null;

        constructor(public type: CardType, public name: string | string[]) {
            this.fontSize = null;
            this.p = null;
            this.container = null;
        }

        abstract getSearchString(): string;
        abstract getImagePath(): string;
        abstract getBacksideText(): string;
        abstract getFrontOverlay(): Node | null;

        public getCard() {
            let container = document.createElement("div");
            this.container = container;
            container.classList.add("flip-container");
            let flipper = document.createElement("div");
            flipper.classList.add("flipper");

            let front = document.createElement("div");
            front.classList.add("front");
            // image with webp by default and jpg as fallback
            let picture = document.createElement("picture");
            let webp = document.createElement("source");
            webp.srcset = this.getImagePath() + ".webp";
            webp.type = "image/webp";
            picture.appendChild(webp);
            let jpg = document.createElement("source");
            jpg.srcset = this.getImagePath() + ".jpg";
            jpg.type = "image/jpg";
            picture.appendChild(jpg);
            let fallback = document.createElement("img");
            fallback.src = this.getImagePath() + ".jpg";
            picture.appendChild(fallback);
            front.appendChild(picture);

            if (this.getFrontOverlay() != null) {
                front.appendChild(<Node> this.getFrontOverlay());
            }

            let back = document.createElement("div");
            back.classList.add("back");
            let backdiv = document.createElement("div");
            backdiv.style.paddingLeft = "10px";
            backdiv.style.paddingRight = "10px";
            let p = document.createElement("span");
            this.p = p;
            p.innerHTML = this.getBacksideText();
            backdiv.appendChild(p);
            back.appendChild(backdiv);

            flipper.appendChild(back);
            flipper.appendChild(front);
            container.appendChild(flipper);

            let x: number, y: number;
            container.onmousedown = (e) => {
                x = e.x;
                y = e.y;
            };
            container.onmouseup = (e) => {
                if (e.target instanceof HTMLAnchorElement) {
                    // link was clicked - ignore
                    return;
                }
                if (Math.abs(x - e.x) > 5 || Math.abs(y - e.y) > 5) {
                    // it was a drag (e.g. to select and copy something) - ignore
                    return;
                }
                if (!container.classList.contains("flipped")) {
                    if (this.fontSize == null) {
                        this.scaleFontSize();
                    } else {
                        p.style.fontSize = this.fontSize + "px";
                    }
                }
                container.classList.toggle("flipped");
            };

            return container;
        }

        // scale font of cardbacks to fit size
        private scaleFontSize() {
            let p = <HTMLSpanElement> this.p;
            this.fontSize = 16;
            p.style.fontSize = this.fontSize + "px";
            let back = (p.parentElement as any).parentElement as any;
            while (p.offsetHeight > back.offsetHeight) {
                this.fontSize -= 0.5;
                p.style.fontSize = this.fontSize + "px";
            }
        }

        onresize() {
            this.fontSize = null;
            if (this.p != null && this.container != null && this.container.classList.contains("flipped")) {
                this.scaleFontSize();
            }
        }
    }

    export class PowerCard extends Card {
        constructor(public type: PowerType, public name: string, public cost: number, public speed: Speed,
                    public range: Ranges | null, public target: Target, public elements: Elements[],
                    public artist: string, public description: string) {
            super(type, name);
        }

        getSearchString() {
            let s = this.type + " " + this.cost + " " + this.name + " " + this.speed;
            if (this.range != null) {
                s += " " + this.range.from + " " + this.range.range;
                if (this.range.land != null) {
                    s += " " + this.range.land;
                }
            }
            if (this.target == LandAny) {
                s += " Any";
            } else {
                s += " " + this.target;
            }
            s += " " + this.elements + " " + this.artist + " " + this.description;
            return s;
        }

        getFrontOverlay() {
            let overlay = <HTMLDivElement> document.createElement("div");
            overlay.style.position = "absolute";
            overlay.style.backgroundColor = toColor(this.type);
            overlay.style.width = "67%";
            overlay.style.height = "10%";
            overlay.style.left = "27%";
            overlay.style.top = "4%";
            overlay.style.zIndex = "1";
            overlay.style.borderRadius = "0 13px 0 0";
            return overlay;
        }

        getBacksideText() {
            let text = "";
            text += "<b>Type</b>: " + this.type + "<br/>";
            text += "<b>Name</b>: " + this.name + "<br/>";
            text += "<b>Cost</b>: " + this.cost + "<br/>";
            text += "<b>Speed</b>: " + this.speed + "<br/>";
            text += "<b>Range</b>: " + this.range + "<br/>";
            let target = "";
            if (Array.isArray(this.target)) {
                if (this.target == LandAny) {
                    target = "Any"
                } else {
                    target = (this.target as TargetType[]).join(", ");
                }
            } else {
                target = this.target;
            }
            text += "<b>Target</b>: " + target + "<br/>";
            text += "<b>Elements</b>: " + this.elements.join(", ") + "<br/>";
            text += "<b>Description</b>: " + this.description + "<br/>";
            text += "<b>Artist</b>: " + this.artist + "<br/>";
            const tag = this.type.startsWith("Unique") ? this.name + " (" + this.type.substring(8) + ")" : this.name;
            text += "<a href=\"https://querki.net/u/darker/spirit-island-faq/#!"
                + encodeURIComponent(tag) + "\" target='_blank'>FAQ</a><br/>";
            return text;
        }

        getImagePath() {
            return "imgs/cards/" + this.name.toLowerCase().replace(/ /g, "_").replace(/[^a-z_]/g, "");
        }
    }
}

