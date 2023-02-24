#!/usr/bin/env python3

import glob, os, shutil
from fuzzywuzzy import process

# generated in the browser console with:
# console.log("[" + CARDS.filter((c) => c instanceof Types.PowerCard).map((c) => '"' + c.getImagePath().substring(12) + '"').join(", ") + "]")
powers = ["harbingers_of_the_lightning", "boon_of_vigor", "rivers_bounty", "concealing_shadows", "voice_of_thunder", "call_of_the_deeps", "swallow_the_landdwellers", "call_on_midnights_dream", "dreams_of_the_dahan", "fields_choked_with_growth", "stem_the_flow_of_fresh_water", "savage_mawbeasts", "shadows_of_the_burning_forest", "sap_the_strength_of_multitudes", "drift_down_into_slumber", "land_of_haunts_and_embers", "call_to_isolation", "gift_of_constancy", "enticing_splendor", "gift_of_living_energy", "gift_of_power", "gnawing_rootbiters", "lure_of_the_unknown", "rain_of_blood", "reaching_grasp", "golds_allure", "here_there_be_monsters", "portents_of_disaster", "growth_through_sacrifice", "swarming_wasps", "animated_wrackroot", "promises_of_protection", "call_to_ferocity", "twilight_fog_brings_madness", "too_near_the_jungle", "flames_fury", "threatening_flames", "hazards_spread_across_the_island", "carapaced_land", "call_to_guard", "gift_of_natures_connection", "mesmerized_tranquility", "territorial_strife", "sear_anger_into_the_wild_lands", "strong_and_constant_currents", "sucking_ooze", "terror_turns_to_madness", "treacherous_waterways", "flow_downriver_blow_downwind", "weep_for_what_is_lost", "unexpected_tigers", "impersonate_authority", "flowing_and_silent_forms_dart_by", "fiery_vengeance", "the_past_returns_again", "elemental_teachings", "share_secrets_of_survival", "study_the_invaders_fears", "gather_the_scattered_light_of_stars", "shape_the_self_anew", "jagged_shards_push_from_the_earth", "gift_of_the_untamed_wild", "pursue_with_scratches_pecks_and_stings", "a_dreadful_tide_of_scurrying_flesh", "boon_of_swarming_bedevilment", "guide_the_way_on_feathered_wings", "unbearable_deluge", "travelers_boon", "paths_tied_by_nature", "a_circuitous_and_wending_journey", "gift_of_furious_might", "boon_of_watchful_guarding", "whispered_guidance_through_the_night", "exaltation_of_tangled_growth", "foul_vapors_and_fetid_muck", "gift_of_searing_heat", "gift_of_the_sunlit_air", "lightnings_boon", "wash_away", "favors_called_due", "mantle_of_dread", "crops_wither_and_fade", "draw_of_the_fruitful_earth", "words_of_warning", "grasping_tide", "tidal_boon", "gift_of_proliferation", "voracious_growth", "rouse_the_trees_and_stones", "encompassing_ward", "song_of_sanctity", "uncanny_melting", "steam_vents", "veil_the_nights_hunt", "elemental_boon", "devouring_ants", "dark_and_tangled_woods", "natures_resilience", "visions_of_fiery_doom", "pull_beneath_the_hungry_earth", "call_of_the_dahan_ways", "call_to_bloodshed", "call_to_migrate", "call_to_tend", "quicken_the_earths_struggles", "delusions_of_danger", "drought", "entrancing_apparitions", "purifying_flame", "inflame_the_fires_of_life", "fire_in_the_sky", "fleshrot_fever", "guardian_serpents", "infested_aquifers", "poisoned_dew", "prowling_panthers", "renewing_rain", "rites_of_the_lands_rejection", "pact_of_the_joined_hunt", "razorsharp_undergrowth", "scour_the_land", "sky_stretches_to_shore", "absorb_corruption", "call_to_trade", "confounding_mists", "cycles_of_time_and_tide", "disorienting_landscape", "elusive_ambushes", "tormenting_rotflies", "teeming_rivers", "spur_on_with_words_of_fire", "prey_on_the_builders", "teeth_gleam_from_darkness", "terrifying_chase", "regrow_from_roots", "boon_of_growing_power", "gift_of_the_primordial_deeps", "gift_of_flowing_power", "elemental_aegis", "bats_scout_for_raids_by_darkness", "birds_cry_warning", "blood_draws_predators", "desiccating_winds", "dry_wood_explodes_in_smoldering_splinters", "entrap_the_forces_of_corruption", "domesticated_animals_go_berserk", "dire_metamorphosis", "skies_herald_the_season_of_return", "gift_of_twinned_days", "haunted_by_primal_memories", "like_calls_to_like", "unquenchable_flames", "renewing_boon", "scream_disease_into_the_wind", "set_them_on_an_evertwisting_trail", "sunsets_fire_flows_across_the_land", "the_shore_seethes_with_hatred", "thriving_chokefungus", "favor_of_the_sun_and_starlit_dark", "incite_the_mob", "overenthusiastic_arson", "lava_flows", "exaltation_of_molten_stone", "the_fog_closes_in", "unnerving_pall", "plaguebearers", "absolute_stasis", "pour_time_sideways", "blur_the_arc_of_years", "boon_of_ancient_memories", "boon_of_reimagining", "peace_of_the_nighttime_sky", "stubborn_solidity", "perils_of_the_deepest_island", "swallowed_by_the_wilderness", "evermultiplying_swarm", "foundations_sink_into_mud", "gift_of_abundance", "dark_skies_loose_a_stinging_rain", "offer_passage_between_worlds", "ways_of_shore_and_heartland", "herd_towards_the_lurking_maw", "mysterious_abductions", "open_shifting_waterways", "call_on_herders_for_aid", "stinging_sandstorm", "gift_of_windsped_steps", "scatter_to_the_winds", "shatter_homesteads", "flash_floods", "sudden_ambush", "predatory_nightmares", "dread_apparitions", "overgrow_in_a_night", "the_trees_and_stones_speak_of_war", "entwined_power", "flow_like_water_reach_like_air", "savage_transformation", "tigers_hunting", "sacrosanct_wilderness", "flashfires", "asphyxiating_smoke", "absorb_essence", "unleash_a_torrent_of_the_selfs_own_essence", "bargains_of_power_and_protection", "rain_of_ash", "dissolving_vapors", "fetid_breath_spreads_infection", "strike_low_with_sudden_fevers", "scarred_and_stony_land", "plows_shatter_on_rocky_ground", "softly_beckon_ever_inward", "aid_from_the_spiritspeakers", "ferocious_rampage", "mark_territory_with_scars_and_teeth", "eerie_noises_and_moving_trees", "intractable_thickets_and_thorns", "sweltering_exhaustion", "tempest_of_leaves_and_branches", "raging_storm", "guard_the_healing_land", "a_year_of_perfect_stillness", "rituals_of_destruction", "manifestation_of_power_and_glory", "poisoned_land", "powerstorm", "the_jungle_hungers", "vigor_of_the_breaking_dawn", "vengeance_of_the_dead", "wrap_in_wings_of_sunlight", "winds_of_rust_and_atrophy", "infinite_vitality", "pentup_calamity", "pyroclastic_flow", "smothering_infestation", "towering_wrath", "angry_bears", "vanish_softly_away_forgotten_by_all", "settle_into_huntinggrounds", "voice_of_command", "stormswath", "sleep_and_never_waken", "trees_radiate_celestial_brilliance", "thickets_erupt_with_every_touch_of_breeze", "pyroclastic_bombardment", "accelerated_rot", "terrifying_nightmares", "paralyzing_fright", "the_land_thrashes_in_furious_pain", "indomitable_claim", "mists_of_oblivion", "dissolve_the_bonds_of_kinship", "strangling_firevine", "bloodwrack_plague", "death_falls_gently_from_open_blossoms", "grant_hatred_a_ravenous_form", "insatiable_hunger_of_the_swarm", "instruments_of_their_own_ruin", "unrelenting_growth", "sweep_into_the_sea", "unlock_the_gates_of_deepest_power", "forests_of_living_obsidian", "infestation_of_venomous_spiders", "walls_of_rock_and_thorn", "the_wounded_wild_turns_on_its_assailants", "utter_a_curse_of_dread_and_bone", "weave_together_the_fabric_of_place", "melt_earth_into_quicksand", "cleansing_floods", "pillar_of_living_flame", "blazing_renewal", "sea_monsters", "twisted_flowers_murmur_ultimatums", "focus_the_lands_anguish", "spill_bitterness_into_the_earth", "talons_of_lightning", "tsunami", "manifest_incarnation", "dream_of_the_untouched_land", "transform_to_a_murderous_darkness", "irresistible_call", "fire_and_flood", "volcanic_eruption", "draw_towards_a_consuming_void", "cast_down_into_the_briny_deep"]
# generated with:
# console.log("[" + CARDS.filter((c) => c instanceof Types.FearCard).map((c) => '"' + c.getImagePath().substring(11) + '"').join(", ") + "]")
fears = ["spreading_timidity", "communities_in_disarray", "depopulation", "mimic_the_dahan", "angry_mobs", "theological_strife", "nerves_fray", "beset_by_many_troubles", "dahan_reclaim_fishing_grounds", "flee_from_dangerous_lands", "sense_of_dread", "dahan_threaten", "discord", "panic", "unrest", "depart_the_dangerous_land", "panicked_by_wild_beasts", "too_many_monsters", "quarantine", "flee_the_pestilent_land", "immigration_slows", "explorers_are_reluctant", "dahan_attack", "tread_carefully", "plan_for_departure", "demoralized", "trade_suffers", "overseas_trade_seem_safer", "isolation", "belief_takes_root", "wary_of_the_interior", "seek_safety", "avoid_the_dahan", "dahan_enheartened", "dahan_raid", "retreat", "tall_tales_of_savagery", "dahan_on_their_guard", "emigration_accelerates", "scapegoats", "fear_of_the_unseen"]
# generated with:
# console.log("[" + CARDS.filter((c) => c instanceof Types.EventCard).map((c) => '"' + c.getImagePath().substring(12) + '"').join(", ") + "]")
events = ["overconfidence", "temporary_truce", "pull_together_in_adversity", "relentless_optimism", "resourceful_populace", "bureaucrats_adjust_funding", "eager_explorers", "the_struggles_of_growth", "sprawl_contained_by_the_wilds", "civic_engagement", "coastal_towns_multiply", "wounded_lands_attract_explorers", "thriving_trade", "cities_rise", "provincial_seat", "fortuneseekers", "gradual_corruption", "seek_new_farmland", "the_frontier_calls", "smaller_ports_spring_up", "no_bravery_without_numbers", "mapmakers_chart_the_wild", "invested_aristocracy", "harvest_bounty_harvest_dust", "lifes_balance_tilts", "dahan_trade_with_the_invaders", "hardworking_settlers", "numinous_crisis", "remnants_of_a_spirits_heart", "lesser_spirits_imperiled", "slave_rebellion", "promising_farmland", "heavy_farming", "urban_development", "population_rises", "wellprepared_explorers", "tightknit_communities", "invaders_surge_inland", "search_for_new_lands", "putting_down_roots", "rising_interest_in_the_island", "distant_exploration", "investigation_of_dangers", "cultural_assimilation", "strange_tales_attract_explorers", "interesting_discoveries", "wave_of_reconnaissance", "seeking_the_interior", "a_strange_madness_among_the_beasts", "missionaries_arrive", "outpaced", "sacred_sites_under_threat", "war_touches_the_islands_shores", "new_species_spread", "farmers_seek_the_dahan_for_aid", "years_of_little_rain"]
# generated with:
# console.log("[" + CARDS.filter((c) => c instanceof Types.BlightCard).map((c) => '"' + c.getImagePath().substring(13) + '"').join(", ") + "]")
blights = ["downward_spiral", "memory_fades_to_dust", "back_against_the_wall", "promising_farmlands", "disintegrating_ecosystem", "aid_from_lesser_spirits", "tipping_point", "erosion_of_will", "a_pall_upon_the_land", "unnatural_proliferation", "all_things_weaken", "thriving_communities", "power_corrodes_the_spirit", "untended_land_crumbles", "invaders_find_the_land_to_their_liking", "strong_earth_shatters_slowly"]

if not os.path.isdir("powers/"):
    os.mkdir("powers/")
if not os.path.isdir("fears/"):
    os.mkdir("fears/")
if not os.path.isdir("events/"):
    os.mkdir("events/")
if not os.path.isdir("blights/"):
    os.mkdir("blights/")

with open("ocr.txt") as f:
    content = f.readlines()

content = [line.split()[0:2] for line in content]

# process ocr'd data for edge-cases
# Sea Monsters exists once in its old for in B&C and once in its new form in JE
content = [line for line in content if not ("branch-claw" in line[0] and "sea_monsters" in line[1])]
# unnatural proliferation is OCR'd horribly
content = [line if not ("jagged-earth" in line[0] and "eemtural_frulifeehun_" in line[1]) else [line[0], "unnatural_proliferation"] for line in content ]

for card in content:
    if len(card) != 2:
        continue
    [file, ocr] = card
    if len(powers) > 0 and any(x in file for x in ["minor", "major", "unique"]):
        (power, powerrating) = process.extractOne(ocr, powers)
        if powerrating >= 69:
            powers.remove(power)
            shutil.copy(file + ".webp", "powers/" + power + ".webp")
            shutil.copy(file + ".jpg", "powers/" + power + ".jpg")
            print("MATCHED: {:45} {:45} ({})".format(ocr, power, powerrating))
        else:
            print("NOT MATCHED (power): {:40} {:>30}({})".format(ocr, power, powerrating))
    elif len(fears) > 0 and "fear" in file:
        (fear, fearrating) = process.extractOne(ocr, fears)
        if fearrating >= 69:
            fears.remove(fear)
            shutil.copy(file + ".webp", "fears/" + fear + ".webp")
            shutil.copy(file + ".jpg", "fears/" + fear + ".jpg")
            print("MATCHED: {:45} {:45} ({})".format(ocr, fear, fearrating))
        else:
            print("NOT MATCHED (fear): {:40} {:>30}({})".format(ocr, fear, fearrating))
    elif len(events) > 0 and "event" in file:
        (event, eventrating) = process.extractOne(ocr, events)
        if eventrating >= 69:
            events.remove(event)
            shutil.copy(file + ".webp", "events/" + event + ".webp")
            shutil.copy(file + ".jpg", "events/" + event + ".jpg")
            print("MATCHED: {:45} {:45} ({})".format(ocr, event, eventrating))
        else:
            print("NOT MATCHED (event): {:40} {:>30}({})".format(ocr, event, eventrating))
    elif len(blights) > 0 and "blight" in file:
        (blight, blightrating) = process.extractOne(ocr, blights)
        if blightrating >= 69:
            blights.remove(blight)
            shutil.copy(file + ".webp", "blights/" + blight + ".webp")
            shutil.copy(file + ".jpg", "blights/" + blight + ".jpg")
            print("MATCHED: {:45} {:45} ({})".format(ocr, blight, blightrating))
        else:
            print("NOT MATCHED (blight): {:40} {:>30}({})".format(ocr, blight, blightrating))
    else:

        print("NOT MATCHED (any): {:40}".format(ocr))
if len(powers) > 0:
    print("POWERS NOT EMPTY: ", powers)
if len(fears) > 0:
    print("FEARS NOT EMPTY: ", fears)
if len(events) > 0:
    print("EVENTS NOT EMPTY: ", events)
if len(blights) > 0:
    print("BLIGHTS NOT EMPTY: ", blights)

