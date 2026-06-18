function initMoviePlayer(videoSource) {
  var video = document.querySelector('.player-video');
  var cover = document.querySelector('.player-cover');
  var hlsInstance = null;

  if (!video || !cover || !videoSource) {
    return;
  }

  function loadVideo() {
    if (video.getAttribute('data-ready') === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSource;
    } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(videoSource);
      hlsInstance.attachMedia(video);
    } else {
      video.src = videoSource;
    }

    video.setAttribute('data-ready', 'true');
  }

  function startVideo() {
    loadVideo();
    cover.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  cover.addEventListener('click', startVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      startVideo();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
