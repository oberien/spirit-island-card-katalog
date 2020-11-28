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

### Resources

Download the pdfs containing the images of all images from dropbox (provided by Dylan Thurston)
into the respective folders in `imgsprep`.
The pdfs should follow this structure within the `imgsprep` folder:
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

In the file `imgsprep/rename.py` execute the commands to generate the names of cards in SICK
from the browser console and replace the arrays in the python file with the results.
This array is used to math the rather bad OCRed names from the card images to the actual cards.

Within the `imgsprep` folder, run the following commands:

```bash
./clean #deletes all old image files, making sure the environment is clean
./extract #extracts the images from the pdfs
./convert #converts images to webp/jpg and OCRs the names
./rename.py #fixes names; make sure you have generated the name-arrays
cp events/* ../imgs/events
cp fears/* ../imgs/fears
cp powers/* ../imgs/powers
```

### Open

After building everything and generating the resources, open `index.html` in your browser, e.g.
```sh
firefox index.html
```

### Deploy

After building everything, the following files and folders can be copied to a static
website file hoster, e.g. with scp:
```sh
scp -r imgs res index.html cards.js <server>:<folder>
```

# License

Licensed under either of

 * Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
 * MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option with parts copyrighted by Greater Than Games, LLC.

All images and some text belongs to Greater Than Games, LLC.
Source code files with material by Greater Than Games, LLC are marked as such in the header comment.
