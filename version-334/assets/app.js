(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.getElementById("mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });
    play();
  }

  function initSearchRedirect() {
    Array.prototype.slice.call(document.querySelectorAll("[data-site-search]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[type='search'], input[name='q']");
        var query = input ? input.value.trim() : "";
        if (form.hasAttribute("data-search-page")) {
          return;
        }
        event.preventDefault();
        var url = "./search.html";
        if (query) {
          url += "?q=" + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function initFilters() {
    var form = document.querySelector("[data-filter-form]");
    if (!form) {
      return;
    }
    var input = form.querySelector("[data-search-input]");
    var category = form.querySelector("[data-filter-category]");
    var year = form.querySelector("[data-filter-year]");
    var type = form.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input && query) {
      input.value = query;
    }
    function apply() {
      var q = normalize(input && input.value);
      var c = normalize(category && category.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var shown = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-category"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags")
        ].join(" "));
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (c && normalize(card.getAttribute("data-category")) !== c) {
          ok = false;
        }
        if (y && normalize(card.getAttribute("data-year")) !== y) {
          ok = false;
        }
        if (t && normalize(card.getAttribute("data-type")) !== t) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }
    [input, category, year, type].forEach(function (node) {
      if (!node) {
        return;
      }
      node.addEventListener("input", apply);
      node.addEventListener("change", apply);
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });
    apply();
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("movie-player");
    var button = document.getElementById("movie-play");
    if (!video || !source) {
      return;
    }
    var attached = false;
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }
    function start() {
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }
    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (button && video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initSearchRedirect();
    initFilters();
  });
})();
