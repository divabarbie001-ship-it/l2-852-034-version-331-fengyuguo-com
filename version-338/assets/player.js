(function () {
    function attachStream(video, stream) {
        if (!video || !stream) {
            return Promise.reject(new Error('empty'));
        }

        if (video.dataset.ready === 'true') {
            return video.play();
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video._hls = hls;
            video.dataset.ready = 'true';
            return new Promise(function (resolve) {
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve(video.play());
                });
            });
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.dataset.ready = 'true';
            return video.play();
        }

        video.src = stream;
        video.dataset.ready = 'true';
        return video.play();
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var stream = video ? video.getAttribute('data-stream') : '';

        function play() {
            attachStream(video, stream).then(function () {
                player.classList.add('is-playing');
            }).catch(function () {
                if (button) {
                    button.querySelector('span:last-child').textContent = '重新播放';
                }
            });
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
        }
    });
})();
