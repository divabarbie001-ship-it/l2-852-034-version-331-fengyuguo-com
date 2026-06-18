(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = qs('[data-mobile-menu]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      document.body.classList.toggle('is-menu-open');
    });
  }

  function initSiteSearch() {
    qsa('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        var target = './search.html';
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function initHeroSlider() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('.hero-slide', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (slides.length > 1) {
      play();
    }
  }

  function initCardFilter() {
    var input = qs('[data-card-filter]');
    var cards = qsa('[data-search]');
    var buttons = qsa('[data-filter-value]');
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (query && input.hasAttribute('data-query-input')) {
      input.value = query;
    }

    function setActiveButton(value) {
      buttons.forEach(function (button) {
        button.classList.toggle('is-active', normalize(button.getAttribute('data-filter-value')) === normalize(value));
      });
    }

    function filterCards(value) {
      var keyword = normalize(value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
      });
    }

    input.addEventListener('input', function () {
      filterCards(input.value);
      setActiveButton('');
    });

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter-value') || '';
        input.value = value;
        filterCards(value);
        setActiveButton(value);
      });
    });

    filterCards(input.value);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSiteSearch();
    initHeroSlider();
    initCardFilter();
  });
})();
