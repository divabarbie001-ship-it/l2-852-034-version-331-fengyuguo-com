(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      menuButton.textContent = menu.classList.contains('is-open') ? '×' : '☰';
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(active + 1);
      }, 5600);
    }
  }

  function applyFilter(input) {
    const list = document.querySelector('[data-card-list]');
    const empty = document.querySelector('[data-empty-state]');

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('[data-card]'));
    const value = (input.value || '').trim().toLowerCase();
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = ((card.dataset.title || '') + ' ' + (card.dataset.tags || '')).toLowerCase();
      const match = value === '' || haystack.indexOf(value) !== -1;
      card.classList.toggle('is-hidden', !match);
      if (match) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  const localFilter = document.querySelector('[data-local-filter]');

  if (localFilter) {
    const input = localFilter.querySelector('[data-filter-input]');

    if (input) {
      localFilter.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilter(input);
      });
      input.addEventListener('input', function () {
        applyFilter(input);
      });
    }
  }

  const searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    const input = searchPage.querySelector('[data-filter-input]');
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (input) {
      input.value = query;
      applyFilter(input);
      input.addEventListener('input', function () {
        applyFilter(input);
      });
    }
  }
})();
