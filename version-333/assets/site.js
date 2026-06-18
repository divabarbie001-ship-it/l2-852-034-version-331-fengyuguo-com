(function() {
  var hlsPromise = null;

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function() {
      menu.classList.toggle("is-open");
    });
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function(resolve, reject) {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
      script.async = true;
      script.onload = function() {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function setStatus(shell, text, visible) {
    var status = shell.querySelector("[data-player-status]");
    if (!status) {
      return;
    }
    status.textContent = text || "";
    status.classList.toggle("is-visible", Boolean(visible && text));
  }

  function hideOverlay(shell) {
    var overlay = shell.querySelector("[data-player-start]");
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function playVideo(video, shell) {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function() {
        setStatus(shell, "点击播放", true);
      });
    }
  }

  function attachSource(video, shell, source) {
    if (video.dataset.ready === "1") {
      hideOverlay(shell);
      playVideo(video, shell);
      return;
    }

    setStatus(shell, "加载中...", true);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.dataset.ready = "1";
      hideOverlay(shell);
      video.addEventListener("loadedmetadata", function onLoaded() {
        video.removeEventListener("loadedmetadata", onLoaded);
        setStatus(shell, "", false);
        playVideo(video, shell);
      });
      video.load();
      return;
    }

    loadHls().then(function(Hls) {
      if (!Hls || !Hls.isSupported()) {
        setStatus(shell, "无法播放视频", true);
        return;
      }
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      shell._hls = hls;
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        video.dataset.ready = "1";
        setStatus(shell, "", false);
        hideOverlay(shell);
        playVideo(video, shell);
      });
      hls.on(Hls.Events.ERROR, function(event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus(shell, "网络错误，正在重试", true);
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus(shell, "媒体错误，正在恢复", true);
          hls.recoverMediaError();
        } else {
          setStatus(shell, "无法播放视频", true);
          hls.destroy();
        }
      });
    }).catch(function() {
      setStatus(shell, "无法播放视频", true);
    });
  }

  function initPlayers() {
    document.querySelectorAll("[data-player]").forEach(function(shell) {
      var video = shell.querySelector("video");
      var start = shell.querySelector("[data-player-start]");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-src");
      if (!source) {
        return;
      }
      var begin = function() {
        attachSource(video, shell, source);
      };
      if (start) {
        start.addEventListener("click", begin);
      }
      video.addEventListener("click", function() {
        if (video.dataset.ready !== "1" || video.paused) {
          begin();
        }
      });
      video.addEventListener("play", function() {
        hideOverlay(shell);
        setStatus(shell, "", false);
      });
    });
  }

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase();
  }

  function createCard(item, prefix) {
    var href = prefix + item.url;
    var cover = prefix + item.cover;
    var genre = item.genre ? item.genre.split(/[、，,/]/)[0] : item.type;
    return "" +
      "<article class=\"movie-card\">" +
        "<a href=\"" + href + "\" aria-label=\"" + escapeHtml(item.title) + " 在线观看\">" +
          "<div class=\"poster-frame\">" +
            "<img src=\"" + cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
            "<span class=\"card-tag\">" + escapeHtml(genre) + "</span>" +
            "<span class=\"play-float\">▶</span>" +
            "<div class=\"poster-caption\">" +
              "<h3>" + escapeHtml(item.title) + "</h3>" +
              "<div class=\"card-meta\"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.year) + "</span></div>" +
            "</div>" +
          "</div>" +
        "</a>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearch() {
    var results = document.getElementById("searchResults");
    var form = document.querySelector("[data-search-form]");
    var summary = document.querySelector("[data-search-summary]");
    if (!results || !form || !window.SEARCH_INDEX) {
      return;
    }

    var input = document.getElementById("searchInput");
    var category = document.getElementById("categoryFilter");
    var region = document.getElementById("regionFilter");
    var year = document.getElementById("yearFilter");
    var prefix = results.getAttribute("data-prefix") || "";
    var query = params().get("q");
    if (query && input) {
      input.value = query;
    }

    function render() {
      var q = normalizeText(input && input.value);
      var cat = category ? category.value : "";
      var reg = region ? region.value : "";
      var yr = year ? year.value : "";
      var list = window.SEARCH_INDEX.filter(function(item) {
        var text = normalizeText([
          item.title,
          item.region,
          item.type,
          item.genre,
          item.oneLine,
          (item.tags || []).join(" ")
        ].join(" "));
        if (q && text.indexOf(q) === -1) {
          return false;
        }
        if (cat && normalizeText(item.category).indexOf(normalizeText(cat)) === -1 && normalizeText(item.genre).indexOf(normalizeText(cat)) === -1) {
          return false;
        }
        if (reg && item.region !== reg) {
          return false;
        }
        if (yr && String(item.year) !== yr) {
          return false;
        }
        return true;
      }).slice(0, 120);

      if (summary) {
        summary.textContent = list.length ? "匹配结果" : "暂无匹配内容";
      }
      results.innerHTML = list.map(function(item) {
        return createCard(item, prefix);
      }).join("");
    }

    form.addEventListener("submit", function(event) {
      event.preventDefault();
      render();
    });
    [input, category, region, year].forEach(function(field) {
      if (field) {
        field.addEventListener("input", render);
        field.addEventListener("change", render);
      }
    });
    render();
  }

  ready(function() {
    initMenu();
    initPlayers();
    initSearch();
  });
})();
