(() => {
  const { t } = window.I18N;
  const status = document.querySelector("#status");
  const playButton = document.querySelector("#playBoth");
  const pauseButton = document.querySelector("#pauseBoth");
  const resetButton = document.querySelector("#resetBoth");
  const volumeInputs = [
    document.querySelector("#volumeA"),
    document.querySelector("#volumeB")
  ];
  const volumeOutputs = [
    document.querySelector("#volumeAValue"),
    document.querySelector("#volumeBValue")
  ];

  const seekInput = document.querySelector("#seekBoth");
  const seekCurrent = document.querySelector("#seekCurrent");
  const seekTotal = document.querySelector("#seekTotal");
  const shareButton = document.querySelector("#shareLink");

  const tracks = [
    { id: "A", input: document.querySelector("#urlA"), form: document.querySelector("#formA"),
      frame: document.querySelector("#frameA"), message: document.querySelector("#messageA"),
      state: document.querySelector("#stateA"), time: document.querySelector("#timeA"),
      art: document.querySelector("#artA"), title: document.querySelector("#titleA"),
      soundTitle: "", url: "", stateKey: "state.none", playingState: false, msg: null,
      widget: null, ready: false, playing: false, generation: 0,
      duration: 0, position: 0, pendingSeek: null },
    { id: "B", input: document.querySelector("#urlB"), form: document.querySelector("#formB"),
      frame: document.querySelector("#frameB"), message: document.querySelector("#messageB"),
      state: document.querySelector("#stateB"), time: document.querySelector("#timeB"),
      art: document.querySelector("#artB"), title: document.querySelector("#titleB"),
      soundTitle: "", url: "", stateKey: "state.none", playingState: false, msg: null,
      widget: null, ready: false, playing: false, generation: 0,
      duration: 0, position: 0, pendingSeek: null }
  ];

  // Shared seek state. Position is absolute time (ms) on the longer track's timeline,
  // so the relative alignment between A and B is preserved when seeking.
  let groupPlaying = false;
  let seeking = false;
  let sharedPosition = 0;

  function setFill(input, percent) {
    input.style.setProperty("--fill", `${Math.max(0, Math.min(100, percent))}%`);
  }

  function formatTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = String(total % 60).padStart(2, "0");
    return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
  }

  function maxDuration() {
    return Math.max(0, ...tracks.map(track => (track.ready ? track.duration : 0)));
  }

  function renderSeek() {
    const max = maxDuration();
    if (Number(seekInput.max) !== max) seekInput.max = String(max);
    seekTotal.textContent = formatTime(max);
    if (!seeking) seekInput.value = String(Math.min(sharedPosition, max));
    const shown = seeking ? Number(seekInput.value) : sharedPosition;
    seekCurrent.value = formatTime(shown);
    seekCurrent.textContent = formatTime(shown);
    seekInput.setAttribute("aria-valuetext", t("seek.valuetext", { cur: formatTime(shown), max: formatTime(max) }));
    setFill(seekInput, max ? (shown / max) * 100 : 0);
    tracks.forEach(track => {
      const known = track.ready && track.duration > 0;
      track.time.textContent = `${formatTime(known ? track.position : 0)} / ${formatTime(known ? track.duration : 0)}`;
    });
  }

  function syncSharedPosition() {
    // The longest still-active track drives the shared position.
    sharedPosition = Math.max(0, ...tracks.filter(track => track.ready).map(track => track.position));
    renderSeek();
  }

  function seekBoth(ms) {
    sharedPosition = ms;
    tracks.forEach(track => {
      if (!track.widget || !track.ready) return;
      if (track.duration && ms >= track.duration) {
        // Past the end of the shorter track: park it at its end.
        track.widget.pause();
        track.widget.seekTo(track.duration);
        track.position = track.duration;
        track.pendingSeek = null;
        updateState(track, "state.finished");
        return;
      }
      track.position = ms;
      track.widget.seekTo(ms);
      // SoundCloud may ignore seekTo before the first playback; re-apply on PLAY.
      track.pendingSeek = track.playing ? null : ms;
      if (groupPlaying && !track.playing) track.widget.play();
    });
    renderSeek();
  }

  function refreshDuration(track, generation) {
    track.widget.getDuration(duration => {
      if (generation !== track.generation) return;
      if (duration > 0 && duration !== track.duration) {
        track.duration = duration;
        renderSeek();
        updateControls();
      }
    });
  }

  // Status, per-track messages and states are stored as translation keys so the
  // current text can be re-rendered when the interface language changes.
  let statusEntry = { key: "status.empty", params: undefined, kind: "" };

  function setStatus(key, kind = "", params) {
    statusEntry = { key, params, kind };
    status.textContent = t(key, params);
    status.className = `status ${kind}`.trim();
  }

  function setMessage(track, key, kind = "") {
    track.msg = { key, kind };
    track.message.textContent = t(key);
    track.message.className = `form-message ${kind}`.trim();
  }

  function updateState(track, key, playing = false) {
    track.stateKey = key;
    track.playingState = playing;
    track.state.textContent = t(key);
    track.state.classList.toggle("playing", playing);
  }

  function renderTitle(track) {
    track.title.textContent = track.soundTitle || t(`title.${track.id}`);
  }

  function rerenderLanguage() {
    setStatus(statusEntry.key, statusEntry.kind, statusEntry.params);
    tracks.forEach(track => {
      updateState(track, track.stateKey, track.playingState);
      if (track.msg) setMessage(track, track.msg.key, track.msg.kind);
      renderTitle(track);
      const empty = track.frame.querySelector(".empty-player");
      if (empty) empty.setAttribute("aria-label", t("empty.label", { id: track.id }));
      const iframe = track.frame.querySelector("iframe");
      if (iframe) iframe.title = t("iframe.title", { id: track.id });
    });
    renderSeek();
  }

  function bothReady() {
    return tracks.every(track => track.ready && track.widget);
  }

  function updateControls() {
    const readyCount = tracks.filter(track => track.ready && track.widget).length;
    const enabled = readyCount === 2;
    playButton.disabled = !enabled;
    pauseButton.disabled = !enabled;
    resetButton.disabled = !enabled;
    seekInput.disabled = !enabled || maxDuration() === 0;
    shareButton.disabled = !tracks.some(track => track.ready && track.url);
    volumeInputs.forEach((input, index) => {
      input.disabled = !tracks[index].ready;
    });

    if (enabled) setStatus("status.ready", "ready");
    else if (readyCount === 1) setStatus("status.one");
    else setStatus("status.empty");
  }

  // Throws an Error whose message is a translation key.
  function normaliseTrackUrl(raw) {
    const value = raw.trim();
    if (!value) throw new Error("err.empty");
    let url;
    try { url = new URL(value); } catch { throw new Error("err.invalid"); }
    if (url.protocol !== "https:") throw new Error("err.https");
    const host = url.hostname.toLowerCase();
    if (!(host === "soundcloud.com" || host.endsWith(".soundcloud.com"))) {
      throw new Error("err.domain");
    }
    if (url.pathname === "/" || url.pathname.split("/").filter(Boolean).length < 2) {
      throw new Error("err.notTrack");
    }
    // Remove query/hash tracking parameters while preserving the actual track path.
    url.search = "";
    url.hash = "";
    return url.href.replace(/\/$/, "");
  }

  function buildWidgetUrl(trackUrl) {
    const params = new URLSearchParams({
      url: trackUrl,
      auto_play: "false",
      single_active: "false",
      show_comments: "false",
      show_artwork: "false",
      show_teaser: "false",
      hide_related: "true",
      color: "#ff1f33",
      visual: "false"
    });
    return `https://w.soundcloud.com/player/?${params.toString()}`;
  }

  function showEmpty(track) {
    track.frame.replaceChildren();
    const empty = document.createElement("div");
    empty.className = "empty-player";
    empty.setAttribute("aria-label", t("empty.label", { id: track.id }));
    empty.setAttribute("role", "img");
    empty.append(buildWaveform(track.id === "A" ? 7 : 19));
    track.frame.append(empty);
    setArtwork(track, "");
    track.soundTitle = "";
    renderTitle(track);
  }

  // Decorative placeholder waveform (deterministic per track, no real audio data).
  function buildWaveform(seed) {
    const ns = "http://www.w3.org/2000/svg";
    const bars = 150;
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "empty-wave");
    svg.setAttribute("viewBox", `0 0 ${bars * 3} 44`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    let path = "";
    for (let i = 0; i < bars; i += 1) {
      const t = i / bars;
      // Loud body with a couple of swells, tapering into a quiet tail.
      const swell = 0.7 + 0.3 * Math.sin(t * Math.PI * 3 + seed);
      const tail = t > 0.72 ? Math.max(0.06, 1 - (t - 0.72) / 0.28) : 1;
      const attack = Math.min(1, t * 14);
      const r = Math.abs(Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453) % 1;
      const h = Math.max(1.2, 42 * swell * tail * attack * (0.35 + 0.65 * r));
      path += `M${i * 3 + 1} ${22 - h / 2}v${h}`;
    }
    const p = document.createElementNS(ns, "path");
    p.setAttribute("d", path);
    p.setAttribute("stroke", "currentColor");
    p.setAttribute("stroke-width", "1.4");
    svg.append(p);
    return svg;
  }

  function setArtwork(track, url) {
    track.art.style.backgroundImage = url ? `url("${url}")` : "";
    track.art.classList.toggle("has-art", Boolean(url));
  }

  function applySoundInfo(track, generation) {
    track.widget.getCurrentSound(sound => {
      if (generation !== track.generation || !sound) return;
      if (sound.title) { track.soundTitle = sound.title; renderTitle(track); }
      const art = sound.artwork_url || (sound.user && sound.user.avatar_url) || "";
      if (/^https:\/\//.test(art)) setArtwork(track, art.replace("-large.", "-t200x200."));
    });
  }

  function unloadTrack(track) {
    track.generation += 1;
    track.widget = null;
    track.ready = false;
    track.playing = false;
    track.url = "";
    resetTrackTiming(track);
    track.input.value = "";
    showEmpty(track);
    updateState(track, "state.none");
    setMessage(track, "msg.hint");
    updateControls();
    syncSharedPosition();
  }

  function resetTrackTiming(track) {
    track.duration = 0;
    track.position = 0;
    track.pendingSeek = null;
    if (!tracks.some(item => item.playing)) groupPlaying = false;
  }

  function loadTrack(track) {
    let trackUrl;
    try {
      trackUrl = normaliseTrackUrl(track.input.value);
    } catch (error) {
      setMessage(track, error.message, "error");
      setStatus("status.trackError", "error", { id: track.id });
      return;
    }

    const generation = ++track.generation;
    track.url = trackUrl;
    track.input.value = trackUrl;
    setArtwork(track, "");
    track.soundTitle = "";
    renderTitle(track);
    track.widget = null;
    track.ready = false;
    track.playing = false;
    resetTrackTiming(track);
    updateState(track, "state.loading");
    setMessage(track, "msg.creating");
    updateControls();
    syncSharedPosition();

    const iframe = document.createElement("iframe");
    iframe.title = t("iframe.title", { id: track.id });
    iframe.setAttribute("allow", "autoplay");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("frameborder", "0");
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.src = buildWidgetUrl(trackUrl);

    track.frame.replaceChildren(iframe);

    // Bind immediately after inserting the iframe so we don't miss a fast READY event.
    try {
      const widget = SC.Widget(iframe);
      track.widget = widget;

      widget.bind(SC.Widget.Events.READY, () => {
        if (generation !== track.generation) return;
        track.ready = true;
        updateState(track, "state.ready");
        setMessage(track, "msg.loaded", "success");
        widget.setVolume(Number(volumeInputs[track.id === "A" ? 0 : 1].value));
        refreshDuration(track, generation);
        applySoundInfo(track, generation);
        updateControls();
        renderSeek();
      });

      widget.bind(SC.Widget.Events.PLAY, () => {
        if (generation !== track.generation) return;
        track.playing = true;
        if (track.pendingSeek !== null) {
          widget.seekTo(track.pendingSeek);
          track.pendingSeek = null;
        }
        refreshDuration(track, generation);
        updateState(track, "state.playing", true);
        if (tracks.every(item => item.playing)) setStatus("status.bothPlaying", "ready");
      });

      widget.bind(SC.Widget.Events.PLAY_PROGRESS, data => {
        if (generation !== track.generation || !data) return;
        track.position = data.currentPosition;
        syncSharedPosition();
      });

      widget.bind(SC.Widget.Events.PAUSE, () => {
        if (generation !== track.generation) return;
        track.playing = false;
        if (track.position >= track.duration && track.duration) return; // parked at end by seek
        updateState(track, "state.paused");
        setStatus("status.paused");
      });

      widget.bind(SC.Widget.Events.FINISH, () => {
        if (generation !== track.generation) return;
        track.playing = false;
        track.position = track.duration;
        updateState(track, "state.finished");
        setStatus("status.finished", "", { id: track.id });
        if (tracks.every(item => !item.playing)) groupPlaying = false;
        syncSharedPosition();
      });

      setMessage(track, "msg.waiting");
    } catch {
      if (generation !== track.generation) return;
      setMessage(track, "msg.widgetFail", "error");
    }

    // If the embed is blocked or the URL is unavailable, the READY event may never arrive.
    window.setTimeout(() => {
      if (generation !== track.generation || track.ready) return;
      setMessage(track, "msg.timeout", "error");
      updateState(track, "state.noResponse");
      updateControls();
    }, 18000);
  }

  tracks.forEach(track => {
    track.form.addEventListener("submit", event => {
      event.preventDefault();
      loadTrack(track);
    });
  });

  document.querySelectorAll("[data-clear]").forEach(button => {
    button.addEventListener("click", () => {
      const track = tracks[Number(button.dataset.clear)];
      unloadTrack(track);
    });
  });

  playButton.addEventListener("click", () => {
    if (!bothReady()) return;
    // If the shared position is past the end of both tracks, start over.
    if (sharedPosition >= maxDuration() && maxDuration() > 0) seekBoth(0);
    groupPlaying = true;
    // Send both play commands from the same user gesture, without awaiting either one.
    // A shorter track whose end is already behind the shared position stays parked.
    tracks.forEach(track => {
      if (track.duration && sharedPosition >= track.duration) return;
      track.widget.play();
    });
    setStatus("status.playSent");
  });

  pauseButton.addEventListener("click", () => {
    groupPlaying = false;
    tracks.forEach(track => { if (track.widget && track.ready) track.widget.pause(); });
    setStatus("status.pauseSent");
  });

  resetButton.addEventListener("click", () => {
    groupPlaying = false;
    tracks.forEach(track => {
      if (track.widget && track.ready) {
        track.widget.pause();
        track.widget.seekTo(0);
        track.playing = false;
        track.position = 0;
        track.pendingSeek = 0;
        updateState(track, "state.restart");
      }
    });
    syncSharedPosition();
    setStatus("status.resetSent");
  });

  // Shared seek slider: preview time while dragging, seek both tracks on release.
  seekInput.addEventListener("input", () => {
    seeking = true;
    renderSeek();
  });
  seekInput.addEventListener("change", () => {
    seeking = false;
    if (!bothReady()) return;
    const target = Number(seekInput.value);
    seekBoth(target);
    setStatus("status.seeked", "", { time: formatTime(target) });
  });
  // Pointer released outside the slider without a value change.
  ["pointerup", "pointercancel", "blur"].forEach(type => {
    seekInput.addEventListener(type, () => {
      if (seeking && Number(seekInput.value) === sharedPosition) { seeking = false; renderSeek(); }
    });
  });

  volumeInputs.forEach((input, index) => {
    const track = tracks[index];
    const update = () => {
      const value = Number(input.value);
      volumeOutputs[index].value = `${value}%`;
      volumeOutputs[index].textContent = `${value}%`;
      setFill(input, value);
      if (track.widget && track.ready) track.widget.setVolume(value);
    };
    input.addEventListener("input", update);
    update();
  });

  // Share link: encodes both track URLs into the page address (?a=…&b=…).
  shareButton.addEventListener("click", async () => {
    const link = new URL(location.href);
    link.search = "";
    link.hash = "";
    tracks.forEach(track => { if (track.ready && track.url) link.searchParams.set(track.id.toLowerCase(), track.url); });
    try {
      await navigator.clipboard.writeText(link.href);
      setStatus("status.copied", "ready");
    } catch {
      window.prompt(t("prompt.copy"), link.href);
    }
  });

  tracks.forEach(track => {
    setMessage(track, "msg.hint");
    updateState(track, "state.none");
  });
  tracks.forEach(showEmpty);
  window.I18N.onChange(rerenderLanguage);
  // The PWA block below reports install events through the same status line.
  document.addEventListener("dualplayer:status", event => {
    setStatus(event.detail.key, event.detail.kind || "");
  });
  updateControls();
  renderSeek();

  // Auto-load tracks passed in the address bar by a shared link.
  const params = new URLSearchParams(location.search);
  tracks.forEach(track => {
    const shared = params.get(track.id.toLowerCase());
    if (!shared) return;
    track.input.value = shared;
    loadTrack(track);
  });
})();


// PWA: install prompt and offline shell caching.
(() => {
  let deferredInstallPrompt = null;
  const installButton = document.querySelector("#installApp");

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    if (installButton) installButton.hidden = false;
  });

  if (installButton) {
    installButton.addEventListener("click", async () => {
      if (!deferredInstallPrompt) {
        document.dispatchEvent(new CustomEvent("dualplayer:status", { detail: { key: "status.installHint" } }));
        return;
      }
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      installButton.hidden = true;
    });
  }

  window.addEventListener("appinstalled", () => {
    if (installButton) installButton.hidden = true;
    document.dispatchEvent(new CustomEvent("dualplayer:status", { detail: { key: "status.installed", kind: "ready" } }));
  });

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        // App remains usable even if service worker registration is unavailable.
      });
    });
  }
})();
