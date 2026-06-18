(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function text(value) {
        return String(value || "").toLowerCase();
    }

    function setupMenu() {
        all(".mobile-menu-button").forEach(function (button) {
            button.addEventListener("click", function () {
                var menu = document.querySelector(".mobile-menu");
                if (menu) {
                    menu.classList.toggle("hidden");
                }
            });
        });
    }

    function setupHero() {
        var slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }
        var slides = all(".hero-slide", slider);
        var dots = all(".hero-dots button", slider);
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
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        if (slides.length > 1) {
            show(0);
            play();
        }
    }

    function setupSearchForms() {
        all(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var select = form.querySelector("select[name='category']");
                var params = new URLSearchParams();
                if (input && input.value.trim()) {
                    params.set("q", input.value.trim());
                }
                if (select && select.value && select.value !== "all") {
                    params.set("category", select.value);
                }
                var query = params.toString();
                window.location.href = "search.html" + (query ? "?" + query : "");
            });
        });
    }

    function setupFilters() {
        var grid = document.querySelector(".filter-grid");
        if (!grid) {
            return;
        }
        var cards = all(".movie-card", grid);
        var input = document.querySelector(".search-input");
        var select = document.querySelector(".category-filter");
        var empty = document.querySelector(".empty-state");
        var params = new URLSearchParams(window.location.search);
        if (input && params.get("q")) {
            input.value = params.get("q");
        }
        if (select && params.get("category")) {
            select.value = params.get("category");
        }
        function apply() {
            var q = input ? text(input.value) : "";
            var category = select ? select.value : "all";
            var shown = 0;
            cards.forEach(function (card) {
                var haystack = text([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.tags,
                    card.dataset.genre
                ].join(" "));
                var matchedText = !q || haystack.indexOf(q) !== -1;
                var matchedCategory = !category || category === "all" || card.dataset.category === category;
                var visible = matchedText && matchedCategory;
                card.classList.toggle("hidden", !visible);
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.style.display = shown ? "none" : "block";
            }
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        if (select) {
            select.addEventListener("change", apply);
        }
        apply();
    }

    window.initMoviePlayer = function (id, source) {
        var wrap = document.getElementById(id);
        if (!wrap) {
            return;
        }
        var video = wrap.querySelector("video");
        var overlay = wrap.querySelector(".play-overlay");
        var loaded = false;
        function bind() {
            if (loaded || !video) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = source;
            }
        }
        function start() {
            bind();
            if (overlay) {
                overlay.classList.add("hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("hidden");
                }
            });
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupSearchForms();
        setupFilters();
    });
}());
