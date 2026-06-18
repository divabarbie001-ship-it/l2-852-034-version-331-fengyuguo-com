(function () {
  var menuButton = document.querySelector(".menu-button");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobilePanel.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      menuButton.textContent = isOpen ? "×" : "☰";
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".hero-tab"));
  var heroIndex = 0;
  var heroTimer = null;

  function setHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === heroIndex);
    });

    tabs.forEach(function (tab, tabIndex) {
      tab.classList.toggle("active", tabIndex === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }

    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      setHero(heroIndex + 1);
    }, 5200);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var index = Number(tab.getAttribute("data-hero-index"));
      if (!Number.isNaN(index)) {
        setHero(index);
        startHero();
      }
    });
  });

  startHero();

  var searchInput = document.getElementById("search-input");
  var searchResults = document.getElementById("search-results");
  var searchTitle = document.getElementById("search-title");

  function normalize(text) {
    return String(text || "").trim().toLowerCase();
  }

  function cardTemplate(item) {
    return [
      "<article class=\"movie-card\">",
      "  <a class=\"poster-link\" href=\"" + item.url + "\" aria-label=\"" + item.title + "\">",
      "    <img src=\"" + item.cover + "\" alt=\"" + item.title + "\" loading=\"lazy\">",
      "    <span class=\"poster-shade\"></span>",
      "    <span class=\"play-dot\">▶</span>",
      "    <span class=\"year-badge\">" + item.year + "</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <h3><a href=\"" + item.url + "\">" + item.title + "</a></h3>",
      "    <p>" + item.oneLine + "</p>",
      "    <div class=\"movie-meta\">",
      "      <span>" + item.region + "</span>",
      "      <span>" + item.type + "</span>",
      "      <a href=\"" + item.categoryUrl + "\">" + item.category + "</a>",
      "    </div>",
      "  </div>",
      "</article>"
    ].join("\n");
  }

  function renderSearch(query) {
    if (!searchResults || !window.SEARCH_INDEX) {
      return;
    }

    var q = normalize(query);
    var items = window.SEARCH_INDEX;

    if (q) {
      items = items.filter(function (item) {
        return normalize(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre + " " + item.tags + " " + item.oneLine).indexOf(q) !== -1;
      });
    }

    items = items.slice(0, 120);
    searchResults.innerHTML = items.map(cardTemplate).join("\n");

    if (searchTitle) {
      searchTitle.textContent = q ? "搜索结果" : "精选内容";
    }
  }

  if (searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    searchInput.value = q;
    renderSearch(q);

    searchInput.addEventListener("input", function () {
      renderSearch(searchInput.value);
    });
  }
})();

function initMoviePlayer(source) {
  var video = document.getElementById("movie-player");
  var button = document.getElementById("movie-play-button");
  var hlsInstance = null;
  var loaded = false;

  if (!video || !button || !source) {
    return;
  }

  function loadVideo() {
    if (loaded) {
      return Promise.resolve();
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    video.src = source;
    return Promise.resolve();
  }

  function playVideo() {
    loadVideo().then(function () {
      button.classList.add("hidden");
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          button.classList.remove("hidden");
        });
      }
    });
  }

  button.addEventListener("click", playVideo);

  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", function () {
    button.classList.add("hidden");
  });

  video.addEventListener("pause", function () {
    if (!video.ended) {
      button.classList.remove("hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
