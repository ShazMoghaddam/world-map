# Changelog

All notable changes to this project are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [semantic versioning](https://semver.org/).

## [1.1.0] - 2026-11-27

Every data layer works again, the map is usable on phones, and the repo has the full set of files.

### Fixed
- **Every data layer turned the map black.** The colour fade could only read hex colours like `#1a9850`, but it fed its own `rgb(...)` colours back in, so the maths returned NaN and browsers painted every country black. It now reads both. This affected all six layers, shared links with `?layer=`, imported data and the embed API's `choropleth` command.
- **The map was a thin strip on phones** (about 190 px tall, with unreadable labels). It now gets a taller frame that you pan around, and dragging, pinching and wheel zoom use the browser's own screen-to-map maths, so they stay accurate at any shape.
- **The country panel covered the map on phones.** It now sits below the map and scrolls into view when you pick a country.
- **Legend ticks were spaced evenly**, even on logarithmic scales, so they pointed at the wrong colours. Each tick now sits at its true value.
- **The phone legend squeezed its colour bar** to almost nothing. It now stacks: title and value on top, then a full-width bar.
- **A selected country lost its data colour** and turned plain blue. With a layer on, it now keeps its colour and gets a strong outline.
- **Any page could control the map** through `postMessage`. Commands are now only accepted from the page that embeds it.
- The demo link pointed to the homepage.

### Added
- Live demo on GitHub Pages, sharing tags with a preview image, and a theme colour for mobile browsers.
- Smoke tests in a headless browser: five screen widths, every data layer, shared links, the phone panel, legend positions, the message API and data import. They run in CI on every push and pull request.
- README banner, GitHub social preview and screenshots, built from the live map by `assets/build.mjs`.
- `CHANGELOG.md`, `SECURITY.md`, `CONTRIBUTING.md` and Dependabot.

### Changed
- `world-map.html` is now `index.html`, so GitHub Pages serves it at a clean address.
- README rewritten, including how to control an embedded map with messages (the right way across different sites).
- Licence line now matches the standard format.

## [1.0.0] - 2026-05-27

First release: 172 countries, six data layers, region and group filters, CSV and JSON import, shareable URLs, an embed code generator and API, keyboard controls, and light, dark and automatic themes. The licence was later switched to the standard MIT text (26 October 2026).
