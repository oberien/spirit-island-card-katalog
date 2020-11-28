#!/usr/bin/env python3

import glob, os, shutil
from fuzzywuzzy import process

# generated with:
# console.log("[" + CARDS.filter((c) => c instanceof Types.PowerCard).map((c) => '"' + c.getImagePath().substring(12) + '"').join(", ") + "]")
powers = ["harbingers_of_the_lightning", "boon_of_vigor", "rivers_bounty", "concealing_shadows", "voice_of_thunder", "call_of_the_deeps", "swallow_the_landdwellers", "call_on_midnights_dreams", "dreams_of_the_dahan", "fields_choked_with_growth", "stem_the_flow_of_fresh_water", "savage_mawbeasts", "shadows_of_the_burning_forest", "sap_the_strength_of_multitudes", "drift_down_into_slumber", "land_of_haunts_and_embers", "call_to_isolation", "gift_of_constancy", "enticing_splendor", "gift_of_living_energy", "gift_of_power", "gnawing_rootbiters", "lure_of_the_unknown", "rain_of_blood", "reaching_grasp", "golds_allure", "here_there_be_monsters", "portents_of_disaster", "growth_through_sacrifice", "swarming_wasps", "animated_wrackroot", "promises_of_protection", "call_to_ferocity", "twilight_fog_brings_madness", "too_near_the_jungle", "flames_fury", "threatening_flames", "lightnings_boon", "wash_away", "favors_called_due", "mantle_of_dread", "crops_wither_and_fade", "draw_of_the_fruitful_earth", "words_of_warning", "grasping_tide", "tidal_boon", "gift_of_proliferation", "voracious_growth", "rouse_the_trees_and_stones", "encompassing_ward", "song_of_sanctity", "uncanny_melting", "steam_vents", "veil_the_nights_hunt", "elemental_boon", "devouring_ants", "dark_and_tangled_woods", "natures_resilience", "visions_of_fiery_doom", "pull_beneath_the_hungry_earth", "call_of_the_dahan_ways", "call_to_bloodshed", "call_to_migrate", "call_to_tend", "quicken_the_earths_struggles", "delusions_of_danger", "drought", "entrancing_apparitions", "purifying_flame", "inflame_the_fires_of_life", "fire_in_the_sky", "fleshrot_fever", "guardian_serpents", "infested_aquifers", "poisoned_dew", "prowling_panthers", "renewing_rain", "rites_of_the_lands_rejection", "pact_of_the_joined_hunt", "razorsharp_undergrowth", "scour_the_land", "sky_stretches_to_shore", "absorb_corruption", "call_to_trade", "confounding_mists", "cycles_of_time_and_tide", "disorienting_landscape", "elusive_ambushes", "tormenting_rotflies", "teeming_rivers", "spur_on_with_words_of_fire", "prey_on_the_builders", "teeth_gleam_from_darkness", "terrifying_chase", "regrow_from_roots", "boon_of_growing_power", "gift_of_the_primordial_deeps", "gift_of_flowing_power", "elemental_aegis", "shatter_homesteads", "flash_floods", "sudden_ambush", "predatory_nightmares", "dread_apparitions", "overgrow_in_a_night", "the_trees_and_stones_speak_of_war", "entwined_power", "flow_like_water_reach_like_air", "savage_transformation", "tigers_hunting", "sacrosanct_wilderness", "flashfires", "asphyxiating_smoke", "absorb_essence", "raging_storm", "guard_the_healing_land", "a_year_of_perfect_stillness", "rituals_of_destruction", "manifestation_of_power_and_glory", "poisoned_land", "powerstorm", "the_jungle_hungers", "vigor_of_the_breaking_dawn", "vengeance_of_the_dead", "wrap_in_wings_of_sunlight", "winds_of_rust_and_atrophy", "infinite_vitality", "pentup_calamity", "pyroclastic_flow", "smothering_infestation", "towering_wrath", "accelerated_rot", "terrifying_nightmares", "paralyzing_fright", "the_land_thrashes_in_furious_pain", "indomitable_claim", "mists_of_oblivion", "dissolve_the_bonds_of_kinship", "strangling_firevine", "bloodwrack_plague", "death_falls_gently_from_open_blossoms", "grant_hatred_a_ravenous_form", "insatiable_hunger_of_the_swarm", "instruments_of_their_own_ruin", "unrelenting_growth", "sweep_into_the_sea", "unlock_the_gates_of_deepest_power", "cleansing_floods", "pillar_of_living_flame", "blazing_renewal", "sea_monsters", "twisted_flowers_murmur_ultimatums", "talons_of_lightning", "tsunami", "manifest_incarnation", "fire_and_flood", "volcanic_eruption", "cast_down_into_the_briny_deep"]
# generated with:
# console.log("[" + CARDS.filter((c) => c instanceof Types.FearCard).map((c) => '"' + c.getImagePath().substring(11) + '"').join(", ") + "]")
fears = ["dahan_threaten", "discord", "panic", "unrest", "depart_the_dangerous_land", "panicked_by_wild_beasts", "too_many_monsters", "quarantine", "flee_the_pestilent_land", "immigration_slows", "explorers_are_reluctant", "dahan_attack", "tread_carefully", "plan_for_departure", "demoralized", "trade_suffers", "overseas_trade_seems_safer", "isolation", "belief_takes_root", "wary_of_the_interior", "seek_safety", "avoid_the_dahan", "dahan_enheartened", "dahan_raid", "retreat", "tall_tales_of_savagery", "dahan_on_their_guard", "emigration_accelerates", "scapegoats", "fear_of_the_unseen"]

# generated with:
# console.log("[" + CARDS.filter((c) => c instanceof Types.EventCard).map((c) => '"' + c.getImagePath().substring(12) + '"').join(", ") + "]")
events = ["numinous_crisis", "hardworking_settlers", "dahan_trade_with_the_invaders", "lifes_balance_tilts", "lesser_spirits_imperiled", "remnants_of_a_spirits_heart", "slave_rebellion", "promising_farmland", "heavy_farming", "urban_development", "population_rises", "wellprepared_explorers", "tightknit_communities", "invaders_surge_inland", "search_for_new_lands", "putting_down_roots", "rising_interest_in_the_island", "distant_exploration", "investigation_of_dangers", "cultural_assimilation", "strange_tales_attract_explorers", "interesting_discoveries", "wave_of_reconnaissance", "seeking_the_interior", "a_strange_madness_among_the_beasts", "missionaries_arrive", "outpaced", "sacred_sites_under_threat", "war_touches_the_islands_shores", "new_species_spread", "farmers_seek_the_dahan_for_aid", "years_of_little_rain"]

if not os.path.isdir("powers/"):
    os.mkdir("powers/")
if not os.path.isdir("fears/"):
    os.mkdir("fears/")
if not os.path.isdir("events/"):
    os.mkdir("events/")

with open("ocr.txt") as f:
    content = f.readlines()

content = [line.split()[0:2] for line in content]
for card in content:
    if len(card) != 2:
        continue
    [file, ocr] = card
    if len(powers) == 0:
        (power, powerrating) = ("EMPTY", 0)
    else:
        (power, powerrating) = process.extractOne(ocr, powers)
    if len(fears) == 0:
        (fear, fearrating) = ("EMPTY", 0)
    else:
        (fear, fearrating) = process.extractOne(ocr, fears)
    if len(events) == 0:
        (event, eventrating) = ("EMPTY", 0)
    else:
        (event, eventrating) = process.extractOne(ocr, events)
    if powerrating > 70:
        powers.remove(power)
        shutil.copy(file + ".webp", "powers/" + power + ".webp")
        shutil.copy(file + ".jpg", "powers/" + power + ".jpg")
        print("MATCHED: {:40} {:30}".format(ocr, power))
    elif fearrating > 70:
        fears.remove(fear)
        shutil.copy(file + ".webp", "fears/" + fear + ".webp")
        shutil.copy(file + ".jpg", "fears/" + fear + ".jpg")
        print("MATCHED: {:40} {:30}".format(ocr, fear))
    elif eventrating > 70:
        events.remove(event)
        shutil.copy(file + ".webp", "events/" + event + ".webp")
        shutil.copy(file + ".jpg", "events/" + event + ".jpg")
        print("MATCHED: {:40} {:30}".format(ocr, event))
    else:
        print("NOT MATCHED: {:40} {:30} {:20} {:20} {:20}".format(ocr, power, fear, event, file))
if len(powers) > 0:
    print("POWERS NOT EMPTY: ", powers)
if len(fears) > 0:
    print("FEARS NOT EMPTY: ", fears)
if len(events) > 0:
    print("EVENTS NOT EMPTY: ", events)
