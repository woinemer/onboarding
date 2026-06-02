# Woinemer Academy Frontend

Static GitHub Pages frontend for the employee-facing Woinemer Academy.

The admin UI and all data operations stay in Google Apps Script. This repo intentionally contains only the public user frontend and no GAS secrets such as Sheet IDs, admin tokens, or PINs.

## Configure Backend

1. Add the JSONP API bridge from the local GAS project to `code.gs`.
2. Deploy the Apps Script project as a web app.
3. Copy the deployment `/exec` URL into `config.js`:

```js
window.WOINEMER_ACADEMY_API = 'https://script.google.com/macros/s/.../exec';
```

For quick testing, the URL can also be passed once via:

```text
https://woinemer.github.io/onboarding/?api=https%3A%2F%2Fscript.google.com%2Fmacros%2Fs%2F...%2Fexec
```

The frontend stores that URL in `localStorage` for the current browser.

## GitHub Pages

Enable Pages for this repository using:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

The live URL will be:

```text
https://woinemer.github.io/onboarding/
```
