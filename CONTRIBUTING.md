# Contributing

Thanks for your interest. Issues and pull requests are welcome, especially data corrections and newer figures.

## Getting set up

You only need a browser to work on the map: open `index.html`.

To run the tests, you also need Node 20 or later:

```bash
npm install
npx playwright install chromium
npm test
```

## Before you open a pull request

- Run `npm test`. CI runs the same tests.
- Check the map in light and dark, with a few data layers, and at phone width.
- If you change how the map looks, rebuild the images with `npm run build:assets` and commit them.
- Add a line to `CHANGELOG.md` under a new "Unreleased" heading.

## Data corrections

Please open an issue with the country, the layer, the value you expected and a link to the source (World Bank, UNDP, ITU, WHO or the Global Carbon Project). If you update a whole layer, update its year in the `MODES` table and in the README.

## Style

- Keep it one HTML file with no runtime dependencies.
- Anything from outside the page (imported files, messages) is treated as data and never inserted as HTML.
- Every control must work with a keyboard and have a visible focus ring.
