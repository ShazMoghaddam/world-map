# World Map

An interactive world map built as a single HTML file — no dependencies, no server, no build step required. Explore country data across seven indicators, filter by region or political group, and import your own dataset via CSV or JSON. Fully keyboard accessible, mobile responsive, and embeddable anywhere.

**[Live Demo](https://shazmoghaddam.github.io/)** · **[LinkedIn](https://www.linkedin.com/in/shazmoghaddam/)**

---

## Features

- **172 countries** with detailed data for each
- **7 data layers** — Population Density, GDP per Capita, HDI, CO₂ per Capita, Life Expectancy, Internet Usage, and a Default view
- **Filter by region** — Africa, Asia, Europe, North America, South America, Oceania
- **Filter by group** — EU, G20, NATO, ASEAN, BRICS+, OPEC
- **Custom data import** — drag and drop a CSV or JSON file to render your own choropleth
- **Shareable URLs** — selected country and active layer are persisted in the URL (`?c=GBR&layer=hdi`)
- **Embeddable** — generate an iframe snippet from within the map
- **Keyboard accessible** — full keyboard navigation, ARIA labels, focus rings, `prefers-reduced-motion` support
- **Mobile responsive** — works on phones and tablets
- **Light / Dark / Auto** theme with smooth crossfade
- **Zero dependencies** — one `.html` file, runs entirely offline

---

## Getting Started

No installation required. Just open the file.

```bash
git clone https://github.com/shazmoghaddam/world-map.git
cd world-map
open world-map.html
```

Or [download the latest release](https://github.com/shazmoghaddam/world-map/releases) and open `world-map.html` in any modern browser.

---

## Data Layers

| Layer | Source | Year |
|---|---|---|
| Population Density | World Bank / UN | ~2022 |
| GDP per Capita | World Bank / IMF | ~2022 |
| Human Development Index | UNDP | 2022 |
| CO₂ per Capita | Global Carbon Project | ~2021 |
| Life Expectancy | WHO / World Bank | ~2022 |
| Internet Usage | ITU | ~2022 |

> Data is baked into the file as static estimates. It is not live or real-time.

---

## Custom Data Import

You can overlay your own data on the map by importing a CSV or JSON file.

**CSV format**
```csv
ISO3,Value
USA,0.92
GBR,0.87
DEU,0.95
```

**JSON format**
```json
{ "USA": 0.92, "GBR": 0.87, "DEU": 0.95 }
```

Drop the file anywhere on the map or use the **Import data** button in the footer. Values are automatically normalised and rendered as a choropleth. Countries are matched by [ISO 3166-1 alpha-3](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3) code.

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `← →` | Browse countries (when panel is open) |
| `← →` | Pan the map (when panel is closed) |
| `↑ ↓` | Pan the map |
| `+ / =` | Zoom in |
| `- / _` | Zoom out |
| `R` | Reset view and layer |
| `L` | Cycle through data layers |
| `Esc` | Close panel / clear search / clear filter |

---

## Embedding

Click the **Embed** button in the footer to generate an iframe snippet for your website:

```html
<iframe
  src="https://your-deployed-url/world-map.html?c=GBR&layer=hdi"
  width="100%"
  height="600"
  frameborder="0"
  style="border:none;border-radius:8px"
  title="World Map"
  loading="lazy"
></iframe>
```

---

## JavaScript API

When embedded in an iframe, the map exposes a `window.WorldMap` API for external control:

```js
const map = document.querySelector('iframe').contentWindow.WorldMap;

map.select('FRA');              // Select a country by ISO3 code
map.flyTo('JPN');               // Fly to a country
map.zoomToFit('BRA');           // Zoom to fit a country
map.setMode('co2');             // Set data layer
map.setFilter('EU27');          // Filter by group
map.clearFilter();              // Clear filter
map.reset();                    // Reset view
map.setTheme('dark');           // Set theme: 'light' | 'dark' | 'auto'

// Listen for country selection
map.onSelect(({ iso, name, data }) => {
  console.log(name, data.pop, data.gdp);
});
```

---

## Map Details

- **Projection** — Robinson (compromise projection, minimises overall distortion)
- **Geometry** — [Natural Earth 110m](https://www.naturalearthdata.com/) (public domain)
- **Disputed territories** — Western Sahara, Palestine, Taiwan, Cyprus, and Kosovo are shown with a dashed border and a visual notice

---

## Browser Support

Works in all modern browsers. Requires ES2020+ (Chrome 85+, Firefox 79+, Safari 14+, Edge 85+).

---

## License

MIT © 2026 [Shaz Moghaddam](https://shazmoghaddam.github.io/)
