# SICK - Spirit Island Card Katalog

This project provides a website containing (pretty much) all cards of the board game *Spirit Island*.
It is hosted on [https://sick.oberien.de](https://sick.oberien.de).

## Building

### Typescript

`typescript` needs to be installed:
```sh
npm install --global typescript
```

Use `tsc` to build and watch for changes:
```sh
tsc --pretty --watch --sourceMap
```
### Downloading The Resources

Install git-lfs https://git-lfs.github.com/

From the root of the repository run `git lfs fetch` and then `git lfs checkout`

### Open

After building everything and downloading the resources, open `index.html` in your browser, e.g.
```sh
firefox index.html
```

### Deploy

After building everything, the following files and folders can be copied to a static
website file hoster, e.g. with scp:
```sh
scp -r imgs res index.html cards.js search.xml <server>:<folder>
```

### Compare Card Texts with Card PDF-Dump

GtG can pdf-dump the card-pdfs, getting a not-perfect representation of the cards.
It doesn't contain any images, symbols or alt-names, so it not really useful for transcribing new cards.
However, it can be used to detect if card text changed.
Download the pdf2txt dump (can be provided by Dylan Thurston) and unpack it in `compare-card-text/card-texts`.
Then, having rust installed (e.g. via <https://rustup.rs/>), within `compare-card-text` run `cargo run`.

### Manually Building The Resources

If you just want to run SICK, you don't need to build the resources manually.
Current built ones are already included in the repository and accessible using git-lfs.

In the past there have been different ways to acquire the images.
* The first version was to manually scan cards in a 3×3 grid, extract and derotate them,
  and rename them.
* For the second version, dthurston provided PDFs with 600dpi images.
  Scripts were used to extract the images, shrink them to the appropriate sizes, use OCR to
  match the names against known values and rename them accordingly.
* With the third version, dthurston generates and provides the scaled-down webp images.
  These need to be converted to the fallback jpg images, OCRed and renamed.

#### Third Version - Scaled-Down Webps

#### Second Version - PDFs

This method was used until the release of Horizons.
It supports powers, fear cards and event cards of the
basegame, Branch & Claw, Jagged Earth and Feather & Flame (promo & promo2).

Install git-lfs <https://git-lfs.github.com/>.
From the root of the repository run `git lfs fetch`

Download the pdfs containing the images of all images from dropbox (provided by Dylan Thurston)
into the respective folders in `imgsprep/old-versions/pdfs`.
The pdfs should follow this structure within the `imgsprep/old-versions/pdfs` folder:
```
.
├── base
│   ├── cards-fear.pdf
│   ├── cards-major.pdf
│   ├── cards-minor.pdf
│   └── cards-spirit.pdf
├── branchclaw
│   ├── cards-event.pdf
│   ├── cards-fear.pdf
│   ├── cards-major.pdf
│   ├── cards-minor.pdf
│   └── cards-spirit.pdf
├── jagged-earth
│   ├── cards-event.pdf
│   ├── cards-fear.pdf
│   ├── cards-major.pdf
│   ├── cards-minor.pdf
│   └── cards-spirit.pdf
├── promo
│   └── cards-spirit.pdf
├── promo2
│   ├── cards-fear.pdf
│   └── cards-spirit.pdf
```

In the file `imgsprep/old-versions/pdfs/rename.py` execute the commands to generate the names of cards in SICK
from the browser console and replace the arrays in the python file with the results.
This array is used to match the rather bad OCRed names from the card images to the actual cards.

Within the `imgsprep/old-versions/pdfs` folder, run the following commands:

```bash
# delete all old image files, making sure the environment is clean
./clean
# extract the images from the pdfs
./extract
# convert images to webp/jpg and OCRs the names
./convert
# fixe names; make sure you have generated the name-arrays
./rename.py
cp events/* ../../../imgs/events
cp fears/* ../../../imgs/fears
cp powers/* ../../../imgs/powers
```

#### First Version - Manually Scaned Cards

* only works for basegame power cards - more cards hadn't been supported before switching to PDFs
* scan the cards to JPG in the order they came packaged in
    * you can scan multiple at the same time arranged in a grid
* place the JPGs in the `imgsprep/old-versions/scans` folder
* run `./extract-scans`
    * uses the `multicrop` script to detect the grid and extract the scans
    * also derotates them
* run `./convert-scans`
    * converts the extracted images to small `.jpg` files
* run `./rename-scans.py`
    * takes the converted files in order and renames them
    * assumes the images are in the packaged order

# License

Licensed under either of

 * Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
 * MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option with parts copyrighted by Greater Than Games, LLC.

All images and some text belongs to Greater Than Games, LLC.
Source code files with material by Greater Than Games, LLC are marked as such in the header comment.
