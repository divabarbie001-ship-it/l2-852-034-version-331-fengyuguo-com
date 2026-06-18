(function () {
    var body = document.body;
    var header = document.querySelector('[data-header]');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var backTop = document.querySelector('[data-back-top]');

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 12);
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            body.classList.toggle('menu-open');
        });
    }

    document.querySelectorAll('.mobile-nav a').forEach(function (link) {
        link.addEventListener('click', function () {
            body.classList.remove('menu-open');
        });
    });

    if (backTop) {
        window.addEventListener('scroll', function () {
            backTop.classList.toggle('visible', window.scrollY > 480);
        }, { passive: true });
        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dotWrap = document.querySelector('[data-hero-dots]');
    var dots = dotWrap ? Array.prototype.slice.call(dotWrap.querySelectorAll('button')) : [];
    var currentSlide = 0;
    var slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        window.clearInterval(slideTimer);
        slideTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var filterPanel = document.querySelector('[data-filter-panel]');
    var catalogGrid = document.querySelector('[data-catalog-grid]');

    if (filterPanel && catalogGrid) {
        var searchInput = filterPanel.querySelector('[data-filter-search]');
        var regionInput = filterPanel.querySelector('[data-filter-region]');
        var typeInput = filterPanel.querySelector('[data-filter-type]');
        var categoryInput = filterPanel.querySelector('[data-filter-category]');
        var emptyState = document.querySelector('[data-empty-state]');
        var cards = Array.prototype.slice.call(catalogGrid.querySelectorAll('[data-movie-card]'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function includesValue(value, keyword) {
            return String(value || '').toLowerCase().indexOf(keyword) !== -1;
        }

        function applyFilters() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var region = regionInput ? regionInput.value : '';
            var type = typeInput ? typeInput.value : '';
            var category = categoryInput ? categoryInput.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.textContent
                ].join(' ').toLowerCase();
                var matched = true;

                if (keyword && !includesValue(haystack, keyword)) {
                    matched = false;
                }
                if (region && card.dataset.region !== region) {
                    matched = false;
                }
                if (type && card.dataset.type !== type) {
                    matched = false;
                }
                if (category && card.dataset.category !== category) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [searchInput, regionInput, typeInput, categoryInput].forEach(function (input) {
            if (input) {
                input.addEventListener('input', applyFilters);
                input.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
        link.addEventListener('click', function () {
            var button = document.querySelector('[data-play-button]');
            if (button) {
                window.setTimeout(function () {
                    button.click();
                }, 320);
            }
        });
    });
})();
