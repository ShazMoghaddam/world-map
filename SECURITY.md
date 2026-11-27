# Security policy

## Reporting a problem

If you find a security issue, such as a way to make the map run code it shouldn't, a way for another site to control an embedded map, or an unsafe dependency, please report it privately through [GitHub's private vulnerability reporting](https://github.com/ShazMoghaddam/world-map/security/advisories/new) rather than opening a public issue.

You can expect a reply within a week.

## What's in scope

World Map is a single static HTML page. It has no server, no accounts, no cookies and no analytics, and it sends nothing anywhere.

- Files you import are read in your browser and never uploaded.
- When embedded, the map only accepts `postMessage` commands from the page that embeds it.
- It stores nothing in your browser: no cookies and no local storage.

The npm packages in `package.json` are only used to test the map and build the README images. None of them ship in the page itself.

## Supported versions

Only the latest version on `main` is supported.
