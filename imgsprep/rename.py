#!/usr/bin/env python3

import glob, os, shutil
from fuzzywuzzy import process

# generated in the browser console with:
# console.log("[" + CARDS.filter((c) => c instanceof Types.PowerCard).map((c) => '"' + c.getImagePath().substring(12) + '"').join(", ") + "]")
powers =["shatter_homesteads", "raging_storm", "lightnings_boon", "harbingers_of_the_lightning", "flash_floods", "wash_away", "boon_of_vigor", "rivers_bounty", "concealing_shadows", "favors_called_due", "mantle_of_dread", "crops_wither_and_fade", "guard_the_healing_land", "a_year_of_perfect_stillness", "rituals_of_destruction", "draw_of_the_fruitful_earth", "manifestation_of_power_and_glory", "words_of_warning", "sudden_ambush", "voice_of_thunder", "call_of_the_deeps", "grasping_tide", "swallow_the_landdwellers", "tidal_boon", "predatory_nightmares", "dread_apparitions", "call_on_midnights_dream", "dreams_of_the_dahan", "overgrow_in_a_night", "gift_of_proliferation", "fields_choked_with_growth", "stem_the_flow_of_fresh_water", "savage_mawbeasts", "voracious_growth", "rouse_the_trees_and_stones", "encompassing_ward", "song_of_sanctity", "uncanny_melting", "shadows_of_the_burning_forest", "steam_vents", "veil_the_nights_hunt", "elemental_boon", "devouring_ants", "dark_and_tangled_woods", "sap_the_strength_of_multitudes", "drift_down_into_slumber", "land_of_haunts_and_embers", "natures_resilience", "visions_of_fiery_doom", "pull_beneath_the_hungry_earth", "call_of_the_dahan_ways", "call_to_bloodshed", "call_to_isolation", "call_to_migrate", "call_to_tend", "quicken_the_earths_struggles", "delusions_of_danger", "drought", "gift_of_constancy", "enticing_splendor", "entrancing_apparitions", "gift_of_living_energy", "gift_of_power", "gnawing_rootbiters", "lure_of_the_unknown", "purifying_flame", "rain_of_blood", "reaching_grasp", "accelerated_rot", "cleansing_floods", "pillar_of_living_flame", "poisoned_land", "terrifying_nightmares", "the_trees_and_stones_speak_of_war", "entwined_power", "paralyzing_fright", "powerstorm", "talons_of_lightning", "the_jungle_hungers", "the_land_thrashes_in_furious_pain", "tsunami", "vigor_of_the_breaking_dawn", "vengeance_of_the_dead", "wrap_in_wings_of_sunlight", "blazing_renewal", "winds_of_rust_and_atrophy", "indomitable_claim", "mists_of_oblivion", "infinite_vitality", "dissolve_the_bonds_of_kinship", "strangling_firevine", "bloodwrack_plague", "cast_down_into_the_briny_deep", "death_falls_gently_from_open_blossoms", "fire_and_flood", "grant_hatred_a_ravenous_form", "insatiable_hunger_of_the_swarm", "instruments_of_their_own_ruin", "flow_like_water_reach_like_air", "pentup_calamity", "pyroclastic_flow", "savage_transformation", "sea_monsters", "tigers_hunting", "unrelenting_growth", "volcanic_eruption", "sweep_into_the_sea", "manifest_incarnation", "smothering_infestation", "twisted_flowers_murmur_ultimatums", "unlock_the_gates_of_deepest_power", "inflame_the_fires_of_life", "fire_in_the_sky", "fleshrot_fever", "golds_allure", "guardian_serpents", "here_there_be_monsters", "infested_aquifers", "poisoned_dew", "portents_of_disaster", "prowling_panthers", "renewing_rain", "rites_of_the_lands_rejection", "pact_of_the_joined_hunt", "razorsharp_undergrowth", "growth_through_sacrifice", "scour_the_land", "sky_stretches_to_shore", "swarming_wasps", "absorb_corruption", "animated_wrackroot", "promises_of_protection", "call_to_ferocity", "call_to_trade", "confounding_mists", "cycles_of_time_and_tide", "disorienting_landscape", "elusive_ambushes", "tormenting_rotflies", "twilight_fog_brings_madness", "teeming_rivers", "spur_on_with_words_of_fire", "prey_on_the_builders", "teeth_gleam_from_darkness", "too_near_the_jungle", "terrifying_chase", "towering_wrath", "regrow_from_roots", "boon_of_growing_power", "sacrosanct_wilderness", "flashfires", "asphyxiating_smoke", "flames_fury", "threatening_flames", "gift_of_the_primordial_deeps", "gift_of_flowing_power", "absorb_essence", "elemental_aegis", "forests_of_living_obsidian", "infestation_of_venomous_spiders", "dream_of_the_untouched_land", "angry_bears", "focus_the_lands_anguish", "vanish_softly_away_forgotten_by_all", "unleash_a_torrent_of_the_selfs_own_essence", "bargains_of_power_and_protection", "transform_to_a_murderous_darkness", "settle_into_huntinggrounds", "walls_of_rock_and_thorn", "voice_of_command", "irresistible_call", "the_wounded_wild_turns_on_its_assailants", "draw_towards_a_consuming_void", "stormswath", "spill_bitterness_into_the_earth", "utter_a_curse_of_dread_and_bone", "sleep_and_never_waken", "weave_together_the_fabric_of_place", "trees_radiate_celestial_brilliance", "thickets_erupt_with_every_touch_of_breeze", "melt_earth_into_quicksand", "hazards_spread_across_the_island", "bats_scout_for_raids_by_darkness", "birds_cry_warning", "blood_draws_predators", "carapaced_land", "call_to_guard", "desiccating_winds", "dry_wood_explodes_in_smoldering_splinters", "gift_of_natures_connection", "entrap_the_forces_of_corruption", "domesticated_animals_go_berserk", "dire_metamorphosis", "skies_herald_the_season_of_return", "gift_of_twinned_days", "haunted_by_primal_memories", "like_calls_to_like", "unquenchable_flames", "mesmerized_tranquility", "territorial_strife", "renewing_boon", "scream_disease_into_the_wind", "sear_anger_into_the_wild_lands", "set_them_on_an_evertwisting_trail", "strong_and_constant_currents", "sucking_ooze", "sunsets_fire_flows_across_the_land", "terror_turns_to_madness", "the_shore_seethes_with_hatred", "thriving_chokefungus", "treacherous_waterways", "flow_downriver_blow_downwind", "weep_for_what_is_lost", "favor_of_the_sun_and_starlit_dark", "unexpected_tigers", "impersonate_authority", "incite_the_mob", "overenthusiastic_arson", "rain_of_ash", "lava_flows", "exaltation_of_molten_stone", "pyroclastic_bombardment", "dissolving_vapors", "the_fog_closes_in", "unnerving_pall", "flowing_and_silent_forms_dart_by", "fiery_vengeance", "plaguebearers", "fetid_breath_spreads_infection", "strike_low_with_sudden_fevers", "absolute_stasis", "pour_time_sideways", "the_past_returns_again", "blur_the_arc_of_years", "boon_of_ancient_memories", "elemental_teachings", "share_secrets_of_survival", "study_the_invaders_fears", "boon_of_reimagining", "gather_the_scattered_light_of_stars", "shape_the_self_anew", "peace_of_the_nighttime_sky", "scarred_and_stony_land", "plows_shatter_on_rocky_ground", "jagged_shards_push_from_the_earth", "stubborn_solidity", "perils_of_the_deepest_island", "softly_beckon_ever_inward", "gift_of_the_untamed_wild", "swallowed_by_the_wilderness", "pursue_with_scratches_pecks_and_stings", "a_dreadful_tide_of_scurrying_flesh", "boon_of_swarming_bedevilment", "guide_the_way_on_feathered_wings", "evermultiplying_swarm", "foundations_sink_into_mud", "gift_of_abundance", "unbearable_deluge", "dark_skies_loose_a_stinging_rain", "travelers_boon", "offer_passage_between_worlds", "aid_from_the_spiritspeakers", "paths_tied_by_nature", "ways_of_shore_and_heartland", "a_circuitous_and_wending_journey", "ferocious_rampage", "gift_of_furious_might", "herd_towards_the_lurking_maw", "mark_territory_with_scars_and_teeth", "boon_of_watchful_guarding", "eerie_noises_and_moving_trees", "mysterious_abductions", "whispered_guidance_through_the_night", "exaltation_of_tangled_growth", "foul_vapors_and_fetid_muck", "intractable_thickets_and_thorns", "open_shifting_waterways", "call_on_herders_for_aid", "gift_of_searing_heat", "stinging_sandstorm", "sweltering_exhaustion", "gift_of_the_sunlit_air", "gift_of_windsped_steps", "scatter_to_the_winds", "tempest_of_leaves_and_branches", "bargain_of_coursing_paths", "bombard_with_boulders_and_stinging_seeds", "exaltation_of_the_incandescent_sky", "flocking_redtalons", "fragments_of_yesteryear", "inspire_the_release_of_stolen_lands", "plague_ships_sail_to_distant_ports", "ravaged_undergrowth_slithers_back_to_life", "rumbling_earthquakes", "solidify_echoes_of_majesty_past", "transformative_sacrifice", "unearth_a_beast_of_wrathful_stone", "roiling_bog_and_snagging_thorn", "emerge_from_the_dread_night_wind", "reach_from_the_infinite_darkness", "swallowed_by_the_endless_dark", "terror_of_the_hunted", "inspire_a_winding_dance", "exaltation_of_echoed_steps", "gift_of_seismic_energy", "radiating_tremors", "resounding_footfalls_sow_dismay", "rumblings_portend_a_greater_quake", "blazing_intimidation", "exaltation_of_grasping_roots", "surging_lahar", "terrifying_rampage", "call_to_vigilance", "coordinated_raid", "favors_of_story_and_season", "surrounded_by_the_dahan", "blinding_glare", "focus_the_suns_rays", "unbearable_gaze", "wither_bodies_scar_stones", "blooming_of_teh_rocks_and_trees", "boon_of_resilient_power", "entwine_the_fates_of_all", "radiant_and_hallowed_grove", "exhale_confusion_and_delirium", "frightful_keening", "turmoils_touch", "twist_perceptions", "blood_water_and_bloodlust", "boon_of_corrupted_blood", "draw_to_the_waters_edge", "wrack_with_pain_and_grief"]
# generated with:
# console.log("[" + CARDS.filter((c) => c instanceof Types.FearCard).map((c) => '"' + c.getImagePath().substring(11) + '"').join(", ") + "]")
fears = ["fear_of_the_unseen", "scapegoats", "emigration_accelerates", "dahan_on_their_guard", "tall_tales_of_savagery", "retreat", "dahan_raid", "dahan_enheartened", "avoid_the_dahan", "seek_safety", "wary_of_the_interior", "belief_takes_root", "isolation", "overseas_trade_seem_safer", "trade_suffers", "demoralized", "plan_for_departure", "tread_carefully", "dahan_attack", "explorers_are_reluctant", "immigration_slows", "flee_the_pestilent_land", "quarantine", "too_many_monsters", "panicked_by_wild_beasts", "depart_the_dangerous_land", "unrest", "panic", "discord", "dahan_threaten", "sense_of_dread", "flee_from_dangerous_lands", "dahan_reclaim_fishing_grounds", "beset_by_many_troubles", "nerves_fray", "theological_strife", "angry_mobs", "mimic_the_dahan", "depopulation", "communities_in_disarray", "spreading_timidity", "civil_unrest", "dahan_gain_the_edge", "daunted_by_the_dahan", "distracted_by_local_troubles", "restlessness", "seek_company", "struggles_over_farmland", "supply_chains_abandoned", "unsettled"]
# generated with:
# console.log("[" + CARDS.filter((c) => c instanceof Types.EventCard).map((c) => '"' + c.getImagePath().substring(12) + '"').join(", ") + "]")
events = ["years_of_little_rain", "farmers_seek_the_dahan_for_aid", "new_species_spread", "war_touches_the_islands_shores", "sacred_sites_under_threat", "outpaced", "missionaries_arrive", "a_strange_madness_among_the_beasts", "seeking_the_interior", "wave_of_reconnaissance", "interesting_discoveries", "strange_tales_attract_explorers", "cultural_assimilation", "investigation_of_dangers", "distant_exploration", "rising_interest_in_the_island", "putting_down_roots", "search_for_new_lands", "invaders_surge_inland", "tightknit_communities", "wellprepared_explorers", "population_rises", "urban_development", "heavy_farming", "promising_farmland", "slave_rebellion", "lesser_spirits_imperiled", "remnants_of_a_spirits_heart", "numinous_crisis", "hardworking_settlers", "dahan_trade_with_the_invaders", "lifes_balance_tilts", "harvest_bounty_harvest_dust", "invested_aristocracy", "mapmakers_chart_the_wild", "no_bravery_without_numbers", "smaller_ports_spring_up", "the_frontier_calls", "seek_new_farmland", "gradual_corruption", "fortuneseekers", "provincial_seat", "cities_rise", "thriving_trade", "wounded_lands_attract_explorers", "coastal_towns_multiply", "civic_engagement", "sprawl_contained_by_the_wilds", "the_struggles_of_growth", "eager_explorers", "bureaucrats_adjust_funding", "resourceful_populace", "relentless_optimism", "pull_together_in_adversity", "temporary_truce", "overconfidence", "ethereal_conjunction", "faroff_wars_touch_the_island", "visions_out_of_time", "accumulated_devastation", "focused_farming", "influx_of_settlers", "search_for_unclaimed_land", "an_ominous_dawn", "terror_spikes_upwards"]
# generated with:
# console.log("[" + CARDS.filter((c) => c instanceof Types.BlightCard).map((c) => '"' + c.getImagePath().substring(13) + '"').join(", ") + "]")
blights = ["downward_spiral", "memory_fades_to_dust", "back_against_the_wall", "promising_farmlands", "disintegrating_ecosystem", "aid_from_lesser_spirits", "tipping_point", "erosion_of_will", "a_pall_upon_the_land", "unnatural_proliferation", "all_things_weaken", "thriving_communities", "power_corrodes_the_spirit", "untended_land_crumbles", "invaders_find_the_land_to_their_liking", "strong_earth_shatters_slowly", "attenuated_essence", "blight_corrodes_the_spirit", "burn_brightest_before_the_end", "intensifying_exploitation", "shattered_fragments_of_power", "slow_dissolution_of_will", "the_border_of_live_and_death", "thriving_crops"]

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
# Sea Monsters from B&C was replaced with a new version in JE
content = [line for line in content if not ("branch-claw" in line[0] and "sea_monsters" in line[1])]
# Draw Towards a Consuming Void from JE was replaced with a new version in NI
content = [line for line in content if not ("jagged-earth" in line[0] and "draw_towards_a_consuming_void" in line[1])]
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

somethingleft = False
if len(powers) > 0:
    somethingleft = True
    print("\033[31mPOWERS NOT EMPTY:\033[0m ", powers)
if len(fears) > 0:
    somethingleft = True
    print("\033[31mFEARS NOT EMPTY\033[0m: ", fears)
if len(events) > 0:
    somethingleft = True
    print("\033[31mEVENTS NOT EMPTY\033[0m: ", events)
if len(blights) > 0:
    somethingleft = True
    print("\033[31mBLIGHTS NOT EMPTY\033[0m: ", blights)

if not somethingleft:
    print("\033[32mAll cards were matched - none is left over\033[0m")
