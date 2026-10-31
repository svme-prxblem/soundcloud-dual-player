// Interface translations. English is the default; Russian is picked for Russian-language
// browsers or when chosen in the switcher. The choice is remembered in localStorage.
//
// Markup hooks:
//   data-i18n="key"                     → element.textContent
//   data-i18n-attr="aria-label:key;…"   → attributes
//   data-i18n-params='{"id":"A"}'       → {placeholders} for both of the above
(() => {
  const dict = {
    en: {
      "meta.description": "211U — Superposition Principle. Two SoundCloud tracks, one sound.",
      "lang.group": "Interface language",
      "nav.label": "Sections",
      "install": "Install app",
      "tagline.1": "Two tracks. One sound.",
      "tagline.2": "Play them together.",
      "deck.title": "Playback control",
      "share": "Share link",
      "play": "Play both",
      "pause": "Pause",
      "reset": "From start",
      "seek.label": "Shared position",
      "seek.valuetext": "{cur} of {max}",
      "volume": "Track {id} volume",
      "players.label": "SoundCloud tracks",
      "title.A": "First track",
      "title.B": "Second track",
      "url.label": "SoundCloud link for track {id}",
      "clear.label": "Clear track {id} link",
      "clear.title": "Clear",
      "load": "Load",
      "time.label": "Track {id} position",
      "empty.label": "Track {id} is not loaded yet",
      "iframe.title": "SoundCloud — track {id}",

      "state.none": "Not added",
      "state.loading": "Loading…",
      "state.ready": "Ready",
      "state.playing": "Playing",
      "state.paused": "Paused",
      "state.finished": "Finished",
      "state.restart": "From start",
      "state.noResponse": "No response",

      "msg.hint": "Paste a regular track link and press “Load”.",
      "msg.creating": "Creating the embedded player…",
      "msg.waiting": "Waiting for SoundCloud…",
      "msg.loaded": "Track loaded. Ready to play both.",
      "msg.widgetFail": "Couldn’t connect the Widget API. Reload the page and try again.",
      "msg.timeout": "The player isn’t responding. Check the link, that the track is available, and your connection.",

      "err.empty": "Paste a SoundCloud track link.",
      "err.invalid": "That doesn’t look like a valid link. Paste the full URL starting with https://",
      "err.https": "Only https:// links are supported, for security.",
      "err.domain": "The link must be from soundcloud.com.",
      "err.notTrack": "This looks like a home page link, not a specific track.",

      "status.empty": "Add track links",
      "status.one": "1 of 2 tracks loaded",
      "status.ready": "Both players ready",
      "status.bothPlaying": "Both tracks playing",
      "status.paused": "Playback paused",
      "status.finished": "Track {id} finished",
      "status.trackError": "Track {id} error",
      "status.playSent": "Play command sent…",
      "status.pauseSent": "Pause command sent…",
      "status.resetSent": "Reset command sent",
      "status.seeked": "Both tracks moved to {time}",
      "status.copied": "Track link copied",
      "status.installHint": "Use your browser menu: “Install app” or “Create shortcut”.",
      "status.installed": "Dual Player installed",
      "prompt.copy": "Copy the track link:"
    },
    ru: {
      "meta.description": "211U — Superposition Principle. Два трека SoundCloud, одно звучание.",
      "lang.group": "Язык интерфейса",
      "nav.label": "Разделы",
      "install": "Установить приложение",
      "tagline.1": "Два трека. Одно звучание.",
      "tagline.2": "Запусти их вместе.",
      "deck.title": "Управление воспроизведением",
      "share": "Ссылка на треки",
      "play": "Запустить оба",
      "pause": "Пауза",
      "reset": "С начала",
      "seek.label": "Общая позиция",
      "seek.valuetext": "{cur} из {max}",
      "volume": "Громкость трека {id}",
      "players.label": "SoundCloud треки",
      "title.A": "Первый трек",
      "title.B": "Второй трек",
      "url.label": "Ссылка SoundCloud для трека {id}",
      "clear.label": "Очистить ссылку трека {id}",
      "clear.title": "Очистить",
      "load": "Загрузить",
      "time.label": "Позиция трека {id}",
      "empty.label": "Трек {id} пока не загружен",
      "iframe.title": "SoundCloud — трек {id}",

      "state.none": "Не добавлен",
      "state.loading": "Загрузка…",
      "state.ready": "Готов",
      "state.playing": "Играет",
      "state.paused": "Пауза",
      "state.finished": "Завершён",
      "state.restart": "С начала",
      "state.noResponse": "Нет ответа",

      "msg.hint": "Вставь обычную ссылку на трек и нажми «Загрузить».",
      "msg.creating": "Создаём встроенный плеер…",
      "msg.waiting": "Ждём готовности SoundCloud…",
      "msg.loaded": "Трек загружен. Можно запускать оба.",
      "msg.widgetFail": "Не удалось подключить Widget API. Обнови страницу и попробуй ещё раз.",
      "msg.timeout": "Плеер долго не отвечает. Проверь ссылку, доступность трека и подключение к интернету.",

      "err.empty": "Вставь ссылку на трек SoundCloud.",
      "err.invalid": "Это не похоже на корректную ссылку. Вставь полный URL с https://",
      "err.https": "Для безопасности поддерживаются только ссылки https://",
      "err.domain": "Нужна ссылка с домена soundcloud.com.",
      "err.notTrack": "Похоже, это ссылка на главную страницу, а не на конкретный трек.",

      "status.empty": "Добавь ссылки на треки",
      "status.one": "Загружен 1 из 2 треков",
      "status.ready": "Оба плеера готовы",
      "status.bothPlaying": "Оба трека воспроизводятся",
      "status.paused": "Воспроизведение приостановлено",
      "status.finished": "Трек {id} завершился",
      "status.trackError": "Ошибка трека {id}",
      "status.playSent": "Отправлена команда запуска…",
      "status.pauseSent": "Отправлена команда паузы…",
      "status.resetSent": "Отправлена команда сброса",
      "status.seeked": "Оба трека перемотаны на {time}",
      "status.copied": "Ссылка на треки скопирована",
      "status.installHint": "В меню браузера выбери «Установить приложение» или «Создать ярлык».",
      "status.installed": "Dual Player установлен",
      "prompt.copy": "Скопируй ссылку на треки:"
    }
  };

  const STORAGE_KEY = "dual-player-lang";
  const listeners = [];

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }

  function detect() {
    const stored = readStored();
    if (stored && dict[stored]) return stored;
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    return langs.some(l => /^(ru|be|uk|kk)\b/i.test(l)) ? "ru" : "en";
  }

  let lang = detect();

  function t(key, params) {
    const template = (dict[lang] && dict[lang][key]) ?? dict.en[key] ?? key;
    return params ? template.replace(/\{(\w+)\}/g, (_, name) => (params[name] ?? "")) : template;
  }

  function paramsOf(el) {
    if (!el.dataset.i18nParams) return undefined;
    try { return JSON.parse(el.dataset.i18nParams); } catch { return undefined; }
  }

  function apply(root = document) {
    root.querySelectorAll("[data-i18n]").forEach(el => {
      el.textContent = t(el.dataset.i18n, paramsOf(el));
    });
    root.querySelectorAll("[data-i18n-attr]").forEach(el => {
      const params = paramsOf(el);
      el.dataset.i18nAttr.split(";").forEach(pair => {
        const [attr, key] = pair.split(":").map(s => s.trim());
        if (attr && key) el.setAttribute(attr, t(key, params));
      });
    });
    document.documentElement.lang = lang;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("meta.description"));
    document.querySelectorAll("[data-lang]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    });
  }

  function setLang(next) {
    if (!dict[next] || next === lang) return;
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* private mode: keep for this visit */ }
    apply();
    listeners.forEach(fn => fn(lang));
  }

  window.I18N = {
    t,
    apply,
    setLang,
    get lang() { return lang; },
    onChange(fn) { listeners.push(fn); }
  };

  apply();
  document.querySelectorAll("[data-lang]").forEach(button => {
    button.addEventListener("click", () => setLang(button.dataset.lang));
  });
})();
