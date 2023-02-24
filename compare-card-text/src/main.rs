use std::cell::RefCell;
use std::rc::Rc;
use std::collections::BTreeMap;

use walkdir::WalkDir;
use deno_core::{JsRuntime, json_op_sync, serde_json::Value};
use regex::Regex;
use unicode_segmentation::UnicodeSegmentation;

fn main() {
    let mut cards_js = get_cards();
    assert!(!cards_js.is_empty());
    let card_texts = get_card_texts();
    assert!(!card_texts.is_empty());

    let mut not_found = 0;
    let mut not_matched = 0;
    for (name, content) in card_texts {
        let card_js: &str = &match cards_js.remove(&name) {
            Some(card) => card,
            None => {
                println!("\x1B[31mNOT FOUND: {}\x1B[0m", name);
                print("PDF-DUMP", &content);
                not_found += 1;
                continue;
            }
        };
        let js_map = build_occurences(card_js);
        let pdf_map = build_occurences(&content);
        for (word, count) in pdf_map {
            let js_count = js_map.get(word).copied();
            if Some(count) > js_count {
                println!("CARD DOESN'T MATCH: {} (word {:?} pdf {} vs js {:?})", name, word, count, js_count);
                print_error("PDF-DUMP", &content, word);
                print_error("JS", &card_js, word);
                not_matched += 1;
                break;
            }
        }
    }

    // let not_matched_js = cards_js.len();
    // for (name, card_js) in cards_js {
    //     println!("NOT CONSUMED: {}", name);
    //     print("JS", &card_js);
    // }

    println!("not found: {}", not_found);
    println!("not matched: {}", not_matched);
    // println!("not consumed js: {}", not_matched_js);
}

fn build_occurences(s: &str) -> BTreeMap<&str, usize> {
    let mut map = BTreeMap::new();
    for word in s.split_word_bounds() {
        if word.chars().all(char::is_whitespace) {
            continue;
        }
        *map.entry(word).or_default() += 1;
    }
    map
}

fn print(typ: &str, content: &str) {
    println!("    {}:", typ);
    for line in content.lines() {
        println!("        {}", line);
    }
}
fn print_error(typ: &str, content: &str, error_word: &str) {
    println!("    {}:", typ);
    for line in content.lines() {
        print!("        ");
        for word in line.split_word_bounds() {
            if word == error_word {
                print!("\x1B[31m{}\x1B[0m", word);
            } else {
                print!("{}", word);
            }
        }
        println!();
        // while let Some(idx) = line.find(error_word) {
        //     print!("\x1B[31m{}\x1B[0m", error_word);
        //     print!("{}", &line[..idx]);
        //     line = &line[idx + error_word.len()..];
        // }
        // println!("{}", line);
    }
}

/// Fetch CARDS from cards.js by executing the JS in deno
fn get_cards() -> BTreeMap<String, String> {
    let mut runtime = JsRuntime::new(Default::default());
    let cardsjs = std::fs::read_to_string("../cards.js").unwrap();
    // stub document
    runtime.execute("<init>", r#"
        document = {
            addEventListener: () => {},
        };
        navigator = { userAgent: "" };
    "#).unwrap();
    // execute cards.js
    runtime.execute("../cards.js", &cardsjs).unwrap();

    // create function to set outer rust-cards from within JS
    let cards = Rc::new(RefCell::new(BTreeMap::new()));
    let cards2 = Rc::clone(&cards);
    runtime.register_op("op_set_cards", json_op_sync(move |_state, json, _zero_copy| {
        *cards2.borrow_mut() = serde_json::from_value(json).unwrap();
        Ok(Value::Null)
    }));
    runtime.execute("<extract-cards>", r#"
        const map = {};
        for (card of CARDS) {
            const name = card.getImagePath().slice(card.getImageFolder().length);
            map[name] = card.getSearchString().toLowerCase();
            // map[name] = card.getBacksideText().toLowerCase();
        }
        Deno.core.ops();
        Deno.core.jsonOpSync("op_set_cards", map);
    "#).unwrap();

    // extract BTreeMap from Rc<RefCell<_>>
    drop(runtime);
    Rc::try_unwrap(cards).unwrap().into_inner()
}

fn get_card_texts() -> BTreeMap<String, String> {
    let walkdir = WalkDir::new("../imgsprep/resources").into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        // .filter(|e| e.path().extension().map(|ext| ext == "txt").unwrap_or(false))
        .filter(|e| {
            for file in ["cards-minor.txt", "cards-major.txt", "cards-unique.txt", "cards-event.txt", "cards-fear.txt", "cards-blight.txt"] {
                if e.path().to_str().unwrap().contains(file) {
                    // horizon cards apart from uniques are slightly reworded basegame cards
                    // ignore them here as we only use the basegame images
                    if e.path().to_str().unwrap().contains("horizon") && file != "cards-unique.txt" {
                        return false
                    }
                    return true;
                }
            }
            false
        });

    let non_letter = Regex::new("[^a-z_]").unwrap();

    let mut card_texts = BTreeMap::new();
    for entry in walkdir {
        let content = std::fs::read_to_string(entry.path()).unwrap();
        for card in content.split('\u{c}') {
            let false_positives = [
                "STAGE I", "STAGES I + II", "STAGES II + III", "STAGE III",
                "HEALTHY ISLAND", "HEALTHY LAND", "BLIGHTED ISLAND", "BLIGHTED LAND",
                "STILL-HEALTHY ISLAND", "(FOR NOW)",
            ];
            let mut description = card;
            while false_positives.iter().any(|fp| description.trim().starts_with(fp)) {
                description = description.split_once("\n").unwrap().1.trim();
            }
            // names can span over multiple lines
            // js names are snake case
            let name = description.split("\n\n").next().unwrap().replace("\n", " ")
                .to_lowercase()
                .replace(char::is_whitespace, "_");
            let name = non_letter.replace(&name, "");
            let name = name.into_owned();

            let mut description = description
                // punctuation is sometimes dumped just plainly wrong (a '.' is added where there
                // isn't one, or a '.' is dumped instead of a ','
                .replace(&['.', ','][..], "")
                .replace('’', "'")
                .replace("”", "\"")
                .replace("“", "\"")
                .replace("–", "-")
                .replace("…", "...")
                ;
            for fp in &false_positives {
                description = description.replace(fp, "");
            }
            let description = description.to_lowercase();
            card_texts.insert(name, description);
        }
    }
    card_texts
}
