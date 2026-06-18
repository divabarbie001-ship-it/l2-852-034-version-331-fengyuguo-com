import { H as Hls } from "./hls.js";

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupNavigation() {
  const toggle = qs("[data-nav-toggle]");
  const nav = qs("[data-site-nav]");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function setupHero() {
  const root = qs("[data-hero]");
  if (!root) return;
  const slides = qsa("[data-hero-slide]", root);
  const dots = qsa("[data-hero-dot]", root);
  const prev = qs("[data-hero-prev]", root);
  const next = qs("[data-hero-next]", root);
  if (!slides.length) return;
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
  };

  const restart = () => {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5800);
  };

  prev?.addEventListener("click", () => {
    show(index - 1);
    restart();
  });

  next?.addEventListener("click", () => {
    show(index + 1);
    restart();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      show(Number(dot.dataset.heroDot || 0));
      restart();
    });
  });

  show(0);
  restart();
}

function setupFiltering() {
  const input = qs("[data-search-input]");
  const cards = qsa("[data-card]");
  if (!input || !cards.length) return;
  const empty = qs("[data-empty-state]");
  const clear = qs("[data-clear-search]");
  const chips = qsa("[data-filter-value]");
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("q") || "";
  let chipValue = "";

  const normalize = (value) => String(value || "").trim().toLowerCase();

  const apply = () => {
    const keyword = normalize(input.value);
    const typeValue = normalize(chipValue);
    let visible = 0;
    cards.forEach((card) => {
      const haystack = normalize(card.dataset.search);
      const matchKeyword = !keyword || haystack.includes(keyword);
      const matchType = !typeValue || haystack.includes(typeValue);
      const show = matchKeyword && matchType;
      card.style.display = show ? "" : "none";
      if (show) visible += 1;
    });
    if (empty) empty.classList.toggle("show", visible === 0);
  };

  if (initial) input.value = initial;
  input.addEventListener("input", apply);
  clear?.addEventListener("click", () => {
    input.value = "";
    chipValue = "";
    chips.forEach((chip) => chip.classList.toggle("active", !chip.dataset.filterValue));
    apply();
  });
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chipValue = chip.dataset.filterValue || "";
      chips.forEach((item) => item.classList.toggle("active", item === chip));
      apply();
    });
  });
  apply();
}

const activePlayers = new WeakMap();

function setupPlayers() {
  qsa("[data-player]").forEach((panel) => {
    const video = qs("[data-video]", panel);
    const button = qs("[data-play-button]", panel);
    const status = qs("[data-player-status]", panel);
    if (!video || !button) return;

    const setStatus = (message) => {
      if (status) status.textContent = message || "";
    };

    const playNative = async (stream) => {
      if (!video.src) video.src = stream;
      video.controls = true;
      panel.classList.add("is-playing");
      await video.play();
      setStatus("");
    };

    const playWithHls = (stream) => {
      return new Promise((resolve, reject) => {
        let hls = activePlayers.get(video);
        if (!hls) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          activePlayers.set(video, hls);
          hls.attachMedia(video);
          hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            hls.loadSource(stream);
          });
          hls.on(Hls.Events.MANIFEST_PARSED, async () => {
            try {
              video.controls = true;
              panel.classList.add("is-playing");
              await video.play();
              setStatus("");
              resolve();
            } catch (error) {
              reject(error);
            }
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data?.fatal) {
              reject(new Error(data.type || "playback"));
            }
          });
        } else {
          video.controls = true;
          panel.classList.add("is-playing");
          video.play().then(resolve).catch(reject);
        }
      });
    };

    const start = async () => {
      const stream = video.dataset.stream;
      if (!stream) {
        setStatus("暂时无法播放，请稍后重试");
        return;
      }
      setStatus("正在加载高清播放");
      try {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          await playNative(stream);
        } else if (Hls && Hls.isSupported()) {
          await playWithHls(stream);
        } else {
          setStatus("当前设备暂不支持在线播放");
        }
      } catch (error) {
        panel.classList.remove("is-playing");
        setStatus("暂时无法播放，请稍后重试");
      }
    };

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      start();
    });

    panel.addEventListener("click", (event) => {
      if (event.target.closest("button") || event.target === video) return;
      if (video.paused) start();
    });
  });
}

setupNavigation();
setupHero();
setupFiltering();
setupPlayers();
