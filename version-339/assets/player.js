(function () {
  const panel = document.querySelector('[data-player]');

  if (!panel) {
    return;
  }

  const video = panel.querySelector('video');
  const playButton = panel.querySelector('[data-play-button]');
  let hlsInstance = null;

  function bindVideo() {
    if (!video || video.dataset.bound === '1') {
      return;
    }

    const stream = video.dataset.stream;

    if (!stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else {
      video.src = stream;
    }

    video.dataset.bound = '1';
  }

  function startPlayback() {
    bindVideo();
    panel.classList.add('is-playing');

    if (video) {
      const played = video.play();

      if (played && typeof played.catch === 'function') {
        played.catch(function () {});
      }
    }
  }

  if (playButton) {
    playButton.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      panel.classList.add('is-playing');
    });
    video.addEventListener('ended', function () {
      panel.classList.remove('is-playing');
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
