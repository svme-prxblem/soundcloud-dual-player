<div align="center">

**English** · [Русский](README.ru.md)

# 211U — Dual SoundCloud Player

**[Open the player →](https://svme-prxblem.github.io/soundcloud-dual-player/)**

Two SoundCloud tracks. One sound. Paste two links and play them together.

</div>

A static site with no build step and no server: it runs entirely in the browser on top of the official SoundCloud Widget API.

## How to use

1. Copy a regular track link, e.g. `https://soundcloud.com/artist/track-name`.
2. Paste it into the track A field and press **Load**. Do the same for track B.
3. When both players are ready, press **Play both**.
4. The shared slider seeks both tracks at once; each track has its own volume.
5. **Share link** copies a page address that contains both tracks. Send it to a friend and the tracks load for them automatically.

## Features

- Accepts regular HTTPS links from soundcloud.com — no embed code needed.
- Shared **Play both**, **Pause** and **From start** controls.
- Shared position slider. Its scale matches the longer track. If the position is past the end of the shorter track, that track stops at its end and resumes when you seek back during playback.
- Independent volume for each track.
- Track title and artwork are pulled from SoundCloud after loading.
- Shareable link with the tracks in the address (`?a=…&b=…`): opening it loads the tracks automatically.
- Interface in English and Russian. The language follows the browser and can be switched with **EN / RU** in the top bar; the choice is remembered.
- Installable as an app (PWA).

## Limitations

- A track must be public and allow embedding.
- Short links (`on.soundcloud.com`), private tracks and regional restrictions may not work.
- The Widget API does not guarantee a perfectly synchronised start: both `play()` calls are sent at once, but the audio may start with a small offset.
- Audio needs an internet connection; only the site shell is cached for offline use.

## Structure

- `index.html` — markup.
- `style.css` — styles.
- `app.js` — link validation, player creation and Widget API control.
- `i18n.js` — interface translations (English, Russian) and the language switcher.
- `assets/` — logos and artwork (WebP).
- `fonts/` — Montserrat (Latin + Cyrillic), self-hosted so the offline cache works.
- `icons/` — tab icon and app icons.
- `manifest.webmanifest`, `sw.js` — PWA: install support and shell cache.

## Adding a language

Add a new dictionary next to `en` and `ru` in `i18n.js` with the same keys, then add a button with `data-lang="<code>"` to the `.lang-switch` block in `index.html`. Any missing key falls back to English.

## Publishing

The site is published with GitHub Pages straight from the `main` branch (folder `/`). Every `git push` to `main` updates the site in about a minute.

After changing files, bump `CACHE_NAME` in `sw.js` (e.g. `dual-player-shell-v6` → `v7`); otherwise visitors who opened the site before may keep the old version from cache.

All paths are relative, so the site works both in a subfolder (`/soundcloud-dual-player/`) and on a custom domain.

## Running locally

Any local server will do, for example:

```
python -m http.server 8000
```

then open http://localhost:8000. Opening `index.html` directly also works, but without app install and the offline cache.
