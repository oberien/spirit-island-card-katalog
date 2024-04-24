namespace Types {
    import TokenEvent = DB.TokenEvent;
    import DahanEvent = DB.DahanEvent;

    export function getCardProperties(): string[] {
        const dummyEventDesc = new EventDesc("", "");
        const dummyPower = new (PowerCard as any)();
        const dummyFear = new (FearCard as any)();
        const dummyChoiceEvent = new (ChoiceEventCard as any)();
        const dummyStageEvent = new (StageEventCard as any)(null, dummyEventDesc, dummyEventDesc, dummyEventDesc);
        const dummyTerrorLevelEvent = new (TerrorLevelEventCard as any)(null, dummyEventDesc, dummyEventDesc, dummyEventDesc);
        const dummyHealthyBlightedLandEvent = new (HealthyBlightedLandEventCard as any)(null, dummyEventDesc, dummyEventDesc);
        const dummyAdversaryEvent = new (AdversaryEvent as any)(null, null, null, dummyStageEvent);
        let props = Object.getOwnPropertyNames(dummyPower)
            .concat(Object.getOwnPropertyNames(dummyFear))
            .concat(Object.getOwnPropertyNames(dummyChoiceEvent))
            .concat(Object.getOwnPropertyNames(dummyStageEvent))
            .concat(Object.getOwnPropertyNames(dummyTerrorLevelEvent))
            .concat(Object.getOwnPropertyNames(dummyHealthyBlightedLandEvent))
            .concat(Object.getOwnPropertyNames(dummyAdversaryEvent))
            .filter((name) => name.toLowerCase() == name);
        props = [...new Set(props)];
        return props;
    }

    export enum Speed {
        Fast = "Fast",
        Slow = "Slow",
    }

    export enum Land {
        Ocean = "Ocean",
        Jungle = "Jungle",
        Wetland = "Wetland",
        Mountain = "Mountain",
        Sands = "Sands",
        Coastal = "Coastal",
        Inland = "Inland",
    }

    export const LandAny = [Land.Ocean, Land.Jungle, Land.Wetland, Land.Mountain, Land.Sands, Land.Coastal];

    export enum TargetSpirit {
        Any = "Any Spirit",
        Another = "Another Spirit",
        Yourself = "Yourself",
    }

    export enum TargetProperty {
        Dahan = "Dahan",
        TwoDahan = "2 Dahan",
        Invaders = "Invaders",
        Town = "Town",
        City = "City",
        Blight = "Blight",
        NoBlight = "No Blight",
        NoInvaders = "No Invaders",
        NoWetland = "No Wetland",
        Beasts = "Beasts",
        TwoBeasts = "2 Beasts",
        Inland = "Inland",
        Disease = "Disease",
        Strife = "Strfe",
        Incarna = "Incarna",
    }

    export type TargetType = Land | TargetSpirit | TargetProperty;

    export type Target = TargetType | TargetType[] | null;

    export enum Source {
        Presence = "Presence",
        SacredSite = "SacredSite",
    }

    export class Ranges {
        constructor(public from: Source, public range: number | number[], public land?: (Land[] | undefined), public landProperty?: (TargetProperty | undefined)) {
        }

        toString() {
            let res = this.from + "";
            if (this.land) {
                res += " on " + this.land;
            }
            if (this.landProperty) {
                res += " with " + this.landProperty;
            }
            res += ": ";
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

    export enum ProductSet {
        Basegame = "Basegame",
        BranchAndClaw = "Branch & Claw",
        JaggedEarth = "Jagged Earth",
        Promo = "Promo",
        Promo2 = "Promo2",
        HorizonsOfSpiritIsland = "Horizons of Spirit Island",
        NatureIncarnate = "Nature Incarnate",
    }

    export enum Unique {
        ASpreadOfRampantGreen = "Unique Power: A Spread of Rampant Green",
        BringerOfDreamsAndNightmares = "Unique Power: Bringer of Dreams and Nightmares",
        LightningsSwiftStrike = "Unique Power: Lightning's Swift Strike",
        OceansHungryGrasp = "Unique Power: Ocean's Hungry Grasp",
        RiverSurgesInSunlight = "Unique Power: River Surges in Sunlight",
        ShadowsFlickerLikeFlame = "Unique Power: Shadows Flicker Like Flame",
        Thunderspeaker = "Unique Power: Thunderspeaker",
        VitalStrengthOfTheEarth = "Unique Power: Vital Strength of the Earth",
        SharpFangsBehindTheLeaves = "Unique Power: Sharp Fangs behind the Leaves",
        KeeperOfTheForbiddenWilds = "Unique Power: Keeper of the Forbidden Wilds",
        SerpentSlumberingBeneathTheIsland = "Unique Power: Serpent Slumbering Beneath the Island",
        HeartOfTheWildfire = "Unique Power: Heart of the Wildfire",
        FinderOfPathsUnseen = "Unique Power: Finder of Paths Unseen",
        FracturedDaysSplitTheSky = "Unique Power: Fractured Days Split the Sky",
        GrinningTricksterStirsUpTrouble = "Unique Power: Grinning Trickster Stirs Up Trouble",
        LureOfTheDeepWilderness = "Unique Power: Lure of the Deep Wilderness",
        ManyMindsMoveAsOne = "Unique Power: Many Minds Move as One",
        ShiftingMemoryOfAges = "Unique Power: Shifting Memory of Ages",
        ShroudOfSilentMist = "Unique Power: Shroud of Silent Mist",
        StarlightSeeksItsForm = "Unique Power: Starlight Seeks its Form",
        StonesUnyieldingDefiance = "Unique Power: Stone's Unyielding Defiance",
        VengeanceAsABurningPlague = "Unique Power: Vengeance as a Burning Plague",
        VolcanoLoomingHigh = "Unique Power: Volcano Looming High",
        DownpourDrenchesTheWorld = "Unique Power: Downpour Drenches the World",
        // Horizons
        DevouringTeethLurkUnderfoot = "Unique Power: Devouring Teeth Lurk Underfoot",
        EyesWatchFromTheTrees = "Unique Power: Eyes Watch From the Trees",
        FathomlessMudOfTheSwamp = "Unique Power: Fathomless Mud of the Swamp",
        RisingHEatOfStoneAndSand = "Unique Power: Rising Heat of Stone and Sand",
        SunBrightWhirlwind = "Unique Power: Sun-Bright Whirlwind",
        // Nature Incarnate
        BreathOfDarknessDownYourSpine = "Unique Power: Breath of Darkness Down Your Spine",
        DancesUpEarthquakes = "Unique Power: Dances Up Earthquakes",
        EmberEyedBehemoth = "Unique Power: Ember-Eyed Behemoth",
        HearthVigil = "Unique Power: Hearth-Vigil",
        RelentlessGazeOfTheSun = "Unique Power: Relentless Gaze of the Sun",
        ToweringRootsOfTheJungle = "Unique Power: Towering Roots of the Jungle",
        WanderingVoiceKeensDelirium = "Unique Power: Wandering Voice Keens Delirium",
        WoundedWatersBleeding = "Unique Power: Wounded Waters Bleeding",
    }

    export enum PowerDeckType {
        Minor = "Minor Power",
        Major = "Major Power",
    }

    export type PowerType = Unique | PowerDeckType;

    export enum FearType {
        Fear = "Fear",
    }

    export enum EventType {
        ChoiceEvent = "Choice Event",
        StageEvent = "Stage Event",
        TerrorLevelEvent = "Terror Level Event",
        HealthyBlightedLandEvent = "Healthy Blighted Island Event",
        AdversaryEvent = "Adversary Event",
    }

    export enum BlightType {
        BlightedIsland = "Blighted Island",
        StillHealthyIsland = "Still-Healthy Island (for now)",
    }

    export type CardType = PowerType | FearType | EventType | EventType[] | BlightType;

    export enum Adversary {
        KingdomOfFrance = "Kingdom of France",
    }

    export enum Stage {
        Stage1,
        Stage2,
        Stage3,
    }

    export enum TerrorLevel {
        TerrorLevel1,
        TerrorLevel2,
        TerrorLevel3,
    }

    export enum HealthyBlightedLand {
        Healthy,
        Blighted,
    }

    function powerToColor(type: string) {
        switch (type) {
            case PowerDeckType.Minor:
                return "rgba(50, 50, 50, 0.3)";
            case PowerDeckType.Major:
                return "rgba(255, 255, 0, 0.25)";
            case Unique.ASpreadOfRampantGreen:
            case Unique.BringerOfDreamsAndNightmares:
            case Unique.LightningsSwiftStrike:
            case Unique.OceansHungryGrasp:
            case Unique.RiverSurgesInSunlight:
            case Unique.ShadowsFlickerLikeFlame:
            case Unique.Thunderspeaker:
            case Unique.VitalStrengthOfTheEarth:
            case Unique.SharpFangsBehindTheLeaves:
            case Unique.KeeperOfTheForbiddenWilds:
            case Unique.HeartOfTheWildfire:
            case Unique.SerpentSlumberingBeneathTheIsland:
            case Unique.FinderOfPathsUnseen:
            case Unique.FracturedDaysSplitTheSky:
            case Unique.GrinningTricksterStirsUpTrouble:
            case Unique.LureOfTheDeepWilderness:
            case Unique.ManyMindsMoveAsOne:
            case Unique.ShiftingMemoryOfAges:
            case Unique.ShroudOfSilentMist:
            case Unique.StarlightSeeksItsForm:
            case Unique.StonesUnyieldingDefiance:
            case Unique.VengeanceAsABurningPlague:
            case Unique.VolcanoLoomingHigh:
            case Unique.DownpourDrenchesTheWorld:
            case Unique.DevouringTeethLurkUnderfoot:
            case Unique.EyesWatchFromTheTrees:
            case Unique.FathomlessMudOfTheSwamp:
            case Unique.RisingHEatOfStoneAndSand:
            case Unique.SunBrightWhirlwind:
            case Unique.BreathOfDarknessDownYourSpine:
            case Unique.DancesUpEarthquakes:
            case Unique.EmberEyedBehemoth:
            case Unique.HearthVigil:
            case Unique.RelentlessGazeOfTheSun:
            case Unique.ToweringRootsOfTheJungle:
            case Unique.WanderingVoiceKeensDelirium:
            case Unique.WoundedWatersBleeding:
                return "rgba(0, 128, 0, 0.25)";
            default:
                throw new Error();
        }
    }

    export abstract class Card {
        // capital so they can not be searched with filters
        private FontSize: number | null = null;
        private P: HTMLSpanElement | null = null;
        private Container: HTMLDivElement | null = null;
        private Flex: HTMLDivElement | null = null;

        constructor(public set: ProductSet, public type: CardType, public name: string | string[]) {}

        getSearchString(): string {
            return Object.keys(this)
                .filter((name) => name.toLowerCase() === name)
                .map((name) => (this as any)[name])
                .filter((prop) => prop !== null)
                .map((prop) => prop.toString().toLowerCase().replace("&", "and"))
                .join(" ")
                .toLowerCase();
        }
        abstract getImageFolder(): string;
        abstract getBacksideText(): string;
        abstract getFrontOverlay(): Node | null;

        public getCardFlexElement() {
            if (this.Flex != null) {
                return this.Flex;
            }

            let flex = <HTMLDivElement> document.createElement("div");
            this.Flex = flex;
            flex.classList.add("flex-50", "xs-flex-33", "sm-flex-25", "md-flex-20", "l-flex-15", "xl-flex-12", "xxl-flex-10");
            let container = document.createElement("div");
            this.Container = container;
            container.classList.add("flip-container");
            let flipper = document.createElement("div");
            flipper.classList.add("flipper");

            let front = document.createElement("div");
            front.classList.add("front");
            front.style.cursor = "pointer";
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
            back.style.cursor = "pointer";
            let backdiv = document.createElement("div");
            backdiv.style.paddingLeft = "10px";
            backdiv.style.paddingRight = "10px";
            let p = document.createElement("span");
            this.P = p;
            p.style.cursor = "auto";
            p.innerHTML = this.getBacksideText();
            backdiv.appendChild(p);
            back.appendChild(backdiv);

            flipper.appendChild(back);
            flipper.appendChild(front);
            container.appendChild(flipper);
            flex.appendChild(container);

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
                    if (this.FontSize == null) {
                        this.scaleFontSize();
                    } else {
                        p.style.fontSize = this.FontSize + "px";
                    }
                }
                container.classList.toggle("flipped");
            };

            return flex;
        }

        private getImagePath() {
            let name;
            if (Array.isArray(this.name)) {
                name = this.name[0];
            } else {
                name = this.name;
            }
            return this.getImageFolder() + name
                .toLowerCase()
                .replace(/ /g, "_")
                .replace(/[^a-z_]/g, "");
        }

        // scale font of cardbacks to fit size
        private scaleFontSize() {
            let p = <HTMLSpanElement> this.P;
            this.FontSize = 16;
            p.style.fontSize = this.FontSize + "px";
            let back = (p.parentElement as any).parentElement as any;
            while (p.offsetHeight > back.offsetHeight) {
                this.FontSize -= 0.5;
                p.style.fontSize = this.FontSize + "px";
            }
        }

        onresize() {
            this.FontSize = null;
            if (this.P != null && this.Container != null && this.Container.classList.contains("flipped")) {
                this.scaleFontSize();
            }
        }
    }

    export class PowerCard extends Card {
        constructor(set: ProductSet, type: PowerType, name: string, public cost: number, public speed: Speed,
                    public range: Ranges | null, public target: Target, public elements: Elements[],
                    public artist: string, public description: string) {
            super(set, type, name);
        }

        getSearchString(): string {
            let s = this.set.replace(/&/g, "and") + " " + this.type + " " + this.cost + " " + this.name + " " + this.speed;
            if (this.range != null) {
                s += " " + this.range.toString().replace(/&/g, "and");
            }
            if (this.target == LandAny) {
                s += " Any";
            } else {
                s += " " + this.target;
            }
            s += " " + this.elements + " " + this.description + " " + this.artist;
            return s.toLowerCase();
        }

        getFrontOverlay(): Node | null {
            let overlay = <HTMLDivElement> document.createElement("div");
            overlay.style.position = "absolute";
            overlay.style.backgroundColor = powerToColor(<PowerType>this.type);
            overlay.style.width = "67%";
            overlay.style.height = "10%";
            overlay.style.left = "27%";
            overlay.style.top = "4%";
            overlay.style.zIndex = "1";
            overlay.style.borderRadius = "0 13px 0 0";
            return overlay;
        }

        getBacksideText(): string {
            let text = "";
            text += "<b>Set</b>: " + this.set + "<br/>";
            text += "<b>Type</b>: " + this.type + "<br/>";
            text += "<b>Name</b>: " + this.name + "<br/>";
            text += "<b>Cost</b>: " + this.cost + "<br/>";
            text += "<b>Speed</b>: " + this.speed + "<br/>";
            if (this.range != null) {
                text += "<b>Range</b>: " + this.range.toString() + "<br/>";
            }
            let target = "";
            if (Array.isArray(this.target)) {
                if (this.target == LandAny) {
                    target = "Any"
                } else {
                    target = (this.target as TargetType[]).join(", ");
                }
            } else if (this.target == null) {
                target = "";
            } else {
                target = this.target;
            }
            text += "<b>Target</b>: " + target + "<br/>";
            text += "<b>Elements</b>: " + this.elements.join(", ") + "<br/>";
            text += "<b>Description</b>: " + this.description + "<br/>";
            text += "<b>Artist</b>: " + this.artist + "<br/>";
            let type = <PowerType>this.type;
            const tag = type.startsWith("Unique") ? <string>this.name + " (" + type.substring(14) + ")" : <string>this.name;
            text += "<a href=\"https://querki.net/u/darker/spirit-island-faq/#!"
                + encodeURIComponent(tag) + "\" target='_blank'>FAQ</a><br/>";
            return text;
        }

        getImageFolder(): string {
            return "imgs/powers/";
        }
    }

    export class FearCard extends Card {
        public description: string;

        constructor(set: ProductSet, type: FearType, public name: string, public level1: string, public level2: string, public level3: string) {
            super(set, type, name);
            // set description for searching
            this.description = level1 + " " + level2 + " " + level3;
        }

        getImageFolder(): string {
            return "imgs/fears/";
        }

        getBacksideText(): string {
            let text = "";
            text += "<b>Set</b>: " + this.set + "<br/>";
            text += "<b>Type</b>: " + this.type + "<br/>";
            text += "<b>Name</b>: " + this.name + "<br/>";
            text += "<b>Level 1</b>: " + this.level1 + "<br/>";
            text += "<b>Level 2</b>: " + this.level2 + "<br/>";
            text += "<b>Level 3</b>: " + this.level3 + "<br/>";
            text += "<a href=\"https://querki.net/u/darker/spirit-island-faq/#!"
                + encodeURIComponent(this.name) + "\" target='_blank'>FAQ</a><br/>";
            return text;
        }

        getFrontOverlay(): Node | null {
            return null;
        }
    }

    export abstract class EventCard extends Card {
        constructor(set: ProductSet, type: EventType | EventType[], name: string | string[],
                    public tokenevent: TokenEvent | null, public dahanevent: DahanEvent | null) {
            super(set, type, name);
        }

        getImageFolder(): string {
            return "imgs/events/";
        }

        getFrontOverlay(): Node | null {
            return null;
        }

    }

    export class ChoiceCost {
        constructor(public energy: number, public per: string | null, public aidedBy: Elements | null) {}

        toString(): string {
            let text = "";
            text += this.energy + " Energy";
            if (this.per !== null) {
                text += " per " + this.per + ".";
            } else {
                text += ".";
            }
            if (this.aidedBy !== null) {
                text += " Aided by " + this.aidedBy + ".";
            }
            return text;
        }
    }

    export class ChoiceDesc {
        constructor(public name: string, public cost: ChoiceCost | null, public actions: string[]) {}

        toString(): string {
            let text = "";
            text += this.name;
            if (this.cost != null) {
                text += "<br/>Cost: " + this.cost;
            }
            for (let action of this.actions) {
                text += "<br/>• " + action;
            }
            return text;
        }
    }

    export class ChoiceEventCard extends EventCard {
        constructor(set: Types.ProductSet, name: string, public description: string, public defaultactions: string[] | null,
                    public choices: Types.ChoiceDesc[], tokenevent: DB.TokenEvent | null, dahanevent: DB.DahanEvent | null) {
            super(set, EventType.ChoiceEvent, name, tokenevent, dahanevent);
        }

        getBacksideText(): string {
            let text = "";
            text += "<b>Set</b>: " + this.set + "<br/>";
            text += "<b>Type</b>: " + this.type + "<br/>";
            text += "<b>Name</b>: " + this.name + "<br/>";
            text += "<b>Description</b>: " + this.description + "<br/>";
            for (let action of this.defaultactions ?? []) {
                text += "• " + action + "<br/>";
            }
            for (let [i, choice] of this.choices.entries()) {
                text += "<b>Choice" + i + "</b>: " + choice + "<br/>";
            }
            if (this.tokenevent !== null) {
                text += "<b>Token Event</b>: " + this.tokenevent + "<br/>";
            }
            if (this.dahanevent !== null) {
                text += "<b>Dahan Event</b>: " + this.dahanevent + "<br/>";
            }
            text += "<a href=\"https://querki.net/u/darker/spirit-island-faq/#!"
                + encodeURIComponent(<string>this.name) + "\" target='_blank'>FAQ</a><br/>";
            return text;
        }
    }

    export class EventDesc {
        constructor(public name: string, public description: string) {}

        toString(): string {
            return this.name + ": " + this.description;
        }
    }

    export class StageEventCard extends EventCard {
        constructor(set: ProductSet, public level1: EventDesc, public level2: EventDesc, public level3: EventDesc,
                    tokenevent: TokenEvent | null, dahanevent: DahanEvent | null) {
            super(set, EventType.StageEvent, [...new Set([level1.name, level2.name, level3.name])], tokenevent, dahanevent);
        }

        getBacksideText(): string {
            let text = "";
            text += "<b>Set</b>: " + this.set + "<br/>";
            text += "<b>Type</b>: " + this.type + "<br/>";
            text += "<b>Name</b>: " + this.name + "<br/>";
            text += "<b>Level1</b>: " + this.level1 + "<br/>";
            text += "<b>Level2</b>: " + this.level2 + "<br/>";
            text += "<b>Level3</b>: " + this.level3 + "<br/>";
            if (this.tokenevent !== null) {
                text += "<b>Token Event</b>: " + this.tokenevent + "<br/>";
            }
            if (this.dahanevent !== null) {
                text += "<b>Dahan Event</b>: " + this.dahanevent + "<br/>";
            }
            for (const name of [...new Set([this.level1.name, this.level2.name, this.level3.name])]) {
                text += "<a href=\"https://querki.net/u/darker/spirit-island-faq/#!"
                    + encodeURIComponent(name) + "\" target='_blank'>FAQ: " + name + "</a><br/>";
            }
            return text;
        }
    }

    export class TerrorLevelEventCard extends EventCard {
        constructor(set: ProductSet, public level1: EventDesc, public level2: EventDesc, public level3: EventDesc,
                    tokenevent: TokenEvent | null, dahanevent: DahanEvent | null) {
            super(set, EventType.TerrorLevelEvent, [...new Set([level1.name, level2.name, level3.name])], tokenevent, dahanevent);
        }

        getBacksideText(): string {
            let text = "";
            text += "<b>Set</b>: " + this.set + "<br/>";
            text += "<b>Type</b>: " + this.type + "<br/>";
            text += "<b>Name</b>: " + this.name + "<br/>";
            text += "<b>Level1</b>: " + this.level1 + "<br/>";
            text += "<b>Level2</b>: " + this.level2 + "<br/>";
            text += "<b>Level3</b>: " + this.level3 + "<br/>";
            if (this.tokenevent !== null) {
                text += "<b>Token Event</b>: " + this.tokenevent + "<br/>";
            }
            if (this.dahanevent !== null) {
                text += "<b>Dahan Event</b>: " + this.dahanevent + "<br/>";
            }
            for (const name of [...new Set([this.level1.name, this.level2.name, this.level3.name])]) {
                text += "<a href=\"https://querki.net/u/darker/spirit-island-faq/#!"
                    + encodeURIComponent(name) + "\" target='_blank'>FAQ: " + name + "</a><br/>";
            }
            return text;
        }
    }

    export class HealthyBlightedLandEventCard extends EventCard {
        constructor(set: ProductSet, public healthy: EventDesc, public blighted: EventDesc,
                    tokenevent: TokenEvent | null, dahanevent: DahanEvent | null) {
            super(set, EventType.HealthyBlightedLandEvent, [healthy.name, blighted.name], tokenevent, dahanevent);
        }

        getBacksideText(): string {
            let text = "";
            text += "<b>Set</b>: " + this.set + "<br/>";
            text += "<b>Type</b>: " + this.type + "<br/>";
            text += "<b>Name</b>: " + this.name + "<br/>";
            text += "<b>Healthy</b>: " + this.healthy + "<br/>";
            text += "<b>Blighted</b>: " + this.blighted + "<br/>";
            if (this.tokenevent !== null) {
                text += "<b>Token Event</b>: " + this.tokenevent + "<br/>";
            }
            if (this.dahanevent !== null) {
                text += "<b>Dahan Event</b>: " + this.dahanevent + "<br/>";
            }
            for (const name of [this.healthy.name, this.blighted.name]) {
                text += "<a href=\"https://querki.net/u/darker/spirit-island-faq/#!"
                    + encodeURIComponent(name) + "\" target='_blank'>FAQ: " + name + "</a><br/>";
            }
            return text;
        }
    }

    export class AdversaryEvent extends EventCard {
        private Inner: EventCard;
        public adversary: Adversary;

        constructor(set: ProductSet, name: string, adversary: Adversary, event: EventCard) {
            let names = Array.isArray(event.name) ? [name].concat(event.name) : [name, event.name];
            super(set, [EventType.AdversaryEvent, <EventType>event.type], names, event.tokenevent, event.dahanevent);
            this.Inner = event;
            this.adversary = adversary;
            let self = (this as any);
            let old = Object.getOwnPropertyNames(new (EventCard as any)());
            let neu = Object.getOwnPropertyNames(event)
                .filter(prop => old.indexOf(prop) == -1);
            for (const prop of neu) {
                self[prop] = (event as any)[prop];
            }
        }

        getBacksideText(): string {
            let text = "";
            text += "<b>Set</b>: " + this.set + "<br/>";
            text += "<b>Type</b>: " + this.type + "<br/>";
            text += "<b>Name</b>: " + this.name + "<br/>";
            text += "(Adversary Event - include only if specified)<br/>";
            text += "Discard and redraw if not playing against " + this.adversary + "<br/>";
            text += this.Inner.getBacksideText();
            text += "<a href=\"https://querki.net/u/darker/spirit-island-faq/#!"
                + encodeURIComponent(this.name[0]) + "\" target='_blank'>FAQ: " + this.name[0] + "</a><br/>";
            return text;
        }

    }

    export class BlightCard extends Card {
        public description: string;

        constructor(set: ProductSet, type: BlightType, public name: string, public blightPerPlayer: number, public effect: string) {
            super(set, type, name);
            // set description for searching
            let condition;
            switch (type) {
                case BlightType.BlightedIsland:
                    condition = "If there is ever NO Blight here, players lose.";
                    break;
                case BlightType.StillHealthyIsland:
                    condition = "If there is ever NO Blight here, draw a new Blight Card. It comes into play already flipped.";
                    break;
            }
            this.description = effect + " " + blightPerPlayer + " Blight per player. Any Blight removed from the board returns here. " + condition;
        }

        getImageFolder(): string {
            return "imgs/blights/";
        }

        getBacksideText(): string {
            let text = "";
            text += "<b>Set</b>: " + this.set + "<br/>";
            text += "<b>Type</b>: " + this.type + "<br/>";
            text += "<b>Name</b>: " + this.name + "<br/>";
            text += "<b>Effect</b>: " + this.effect + "<br/>";
            text += "<b>Blight per player</b>: " + this.blightPerPlayer + "<br/>";
            text += "<a href=\"https://querki.net/u/darker/spirit-island-faq/#!"
                + encodeURIComponent(this.name) + "\" target='_blank'>FAQ</a><br/>";
            return text;
        }

        getFrontOverlay(): Node | null {
            return null;
        }
    }

}

