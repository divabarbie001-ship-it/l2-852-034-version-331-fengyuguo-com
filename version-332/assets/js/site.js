import { H as Hls } from './hls-vendor-dru42stk.js';

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileMenu() {
  const button = qs('[data-menu-toggle]');
  const nav = qs('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

function setupHeroCarousel() {
  const hero = qs('[data-hero]');

  if (!hero) {
    return;
  }

  const slides = qsa('[data-hero-slide]', hero);
  const dots = qsa('[data-hero-dot]', hero);
  const prev = qs('[data-hero-prev]', hero);
  const next = qs('[data-hero-next]', hero);
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  };

  const restart = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5600);
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      restart();
    });
  });

  prev?.addEventListener('click', () => {
    show(index - 1);
    restart();
  });

  next?.addEventListener('click', () => {
    show(index + 1);
    restart();
  });

  restart();
}

function normalize(value) {
  return String(value || '').toLowerCase().trim();
}

function setupFilters() {
  qsa('[data-filter-root]').forEach((root) => {
    const grid = root.parentElement?.querySelector('[data-filter-grid]') || qs('[data-filter-grid]');
    const cards = grid ? qsa('[data-movie-card]', grid) : [];
    const search = qs('[data-search-input]', root);
    const selects = qsa('[data-filter-field]', root);
    const empty = root.parentElement?.querySelector('[data-empty-state]');
    const count = root.parentElement?.querySelector('[data-result-count]');

    if (!grid || !cards.length) {
      return;
    }

    if (search && search.dataset.queryParam) {
      const params = new URLSearchParams(window.location.search);
      const queryValue = params.get(search.dataset.queryParam);
      if (queryValue) {
        search.value = queryValue;
      }
    }

    const apply = () => {
      const query = normalize(search?.value);
      const filters = selects.map((select) => ({
        field: select.dataset.filterField,
        value: normalize(select.value),
      }));

      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.category,
          card.textContent,
        ].join(' '));

        const matchesQuery = !query || haystack.includes(query);
        const matchesFilters = filters.every((filter) => {
          if (!filter.value) {
            return true;
          }
          return normalize(card.dataset[filter.field]).includes(filter.value);
        });

        const isVisible = matchesQuery && matchesFilters;
        card.hidden = !isVisible;
        visible += isVisible ? 1 : 0;
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }

      if (count) {
        count.textContent = `共 ${visible} 部影片`;
      }
    };

    search?.addEventListener('input', apply);
    selects.forEach((select) => select.addEventListener('change', apply));
    apply();
  });
}

function setupVideoPlayers() {
  qsa('[data-video-player]').forEach((shell) => {
    const video = qs('video', shell);
    const overlay = qs('.video-overlay', shell);
    const source = shell.dataset.source;
    let hls = null;

    if (!video || !overlay || !source) {
      return;
    }

    const start = async () => {
      overlay.classList.add('hidden');
      video.controls = true;

      try {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) {
            video.src = source;
          }
        } else if (Hls.isSupported()) {
          if (!hls) {
            hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });
            hls.loadSource(source);
            hls.attachMedia(video);
          }
        }

        await video.play();
      } catch (error) {
        overlay.classList.remove('hidden');
        overlay.querySelector('strong').textContent = '点击重试播放';
        console.warn('Video playback failed:', error);
      }
    };

    overlay.addEventListener('click', start);
    shell.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        start();
      }
    });
  });
}

setupMobileMenu();
setupHeroCarousel();
setupFilters();
setupVideoPlayers();
