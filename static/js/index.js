window.HELP_IMPROVE_VIDEOJS = false;

document.addEventListener('DOMContentLoaded', function () {
  // Navbar burger
  var burger = document.querySelector('.navbar-burger');
  var menu = document.querySelector('.navbar-menu');

  if (burger && menu) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('is-active');
      menu.classList.toggle('is-active');
    });
  }

  function prepareVideo(video) {
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');

    video.playsInline = true;
    video.setAttribute('playsinline', '');

    video.preload = 'auto';
    video.setAttribute('preload', 'auto');
  }

  function safePlay(video) {
    if (!video) return;

    prepareVideo(video);

    var p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(function (err) {
        console.log('Autoplay failed:', err);
      });
    }
  }

  function initSimpleVideoCarousel(selector, options) {
    var root = document.querySelector(selector);
    if (!root) return;

    var items = Array.from(root.querySelectorAll(':scope > .item'));
    if (items.length === 0) return;

    var index = 0;
    var timer = null;

    root.classList.add('simple-video-carousel');

    // Create navigation buttons.
    var prevBtn = document.createElement('button');
    prevBtn.className = 'simple-carousel-btn simple-carousel-prev';
    prevBtn.innerHTML = '&#10094;';
    prevBtn.setAttribute('aria-label', 'Previous video');

    var nextBtn = document.createElement('button');
    nextBtn.className = 'simple-carousel-btn simple-carousel-next';
    nextBtn.innerHTML = '&#10095;';
    nextBtn.setAttribute('aria-label', 'Next video');

    root.appendChild(prevBtn);
    root.appendChild(nextBtn);

    // Create dots.
    var dots = document.createElement('div');
    dots.className = 'simple-carousel-dots';

    var dotBtns = items.map(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'simple-carousel-dot';
      dot.setAttribute('aria-label', 'Go to video ' + (i + 1));
      dot.addEventListener('click', function () {
        goTo(i, true);
      });
      dots.appendChild(dot);
      return dot;
    });

    root.appendChild(dots);

    items.forEach(function (item) {
      var video = item.querySelector('video');
      prepareVideo(video);
    });

    function stopAllVideos() {
      items.forEach(function (item) {
        var video = item.querySelector('video');
        if (video) {
          video.pause();
        }
      });
    }

    function showCurrent() {
      stopAllVideos();

      items.forEach(function (item, i) {
        if (i === index) {
          item.classList.add('is-visible');
          item.style.display = 'block';
        } else {
          item.classList.remove('is-visible');
          item.style.display = 'none';
        }
      });

      dotBtns.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });

      var currentVideo = items[index].querySelector('video');
      if (currentVideo) {
        prepareVideo(currentVideo);

        try {
          currentVideo.currentTime = 0;
        } catch (e) {}

        // Give browser one frame to finish display change.
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            safePlay(currentVideo);
          });
        });
      }
    }

    function goTo(newIndex, userTriggered) {
      index = (newIndex + items.length) % items.length;
      showCurrent();

      if (options.autoplayByTimer) {
        restartTimer();
      }
    }

    function next(userTriggered) {
      goTo(index + 1, userTriggered);
    }

    function prev(userTriggered) {
      goTo(index - 1, userTriggered);
    }

    function restartTimer() {
      if (timer) {
        clearInterval(timer);
      }

      if (options.autoplayByTimer) {
        timer = setInterval(function () {
          next(false);
        }, options.interval || 3400);
      }
    }

    prevBtn.addEventListener('click', function () {
      prev(true);
    });

    nextBtn.addEventListener('click', function () {
      next(true);
    });

    // For long baseline videos: move to next when current video ends.
    if (options.advanceOnVideoEnd) {
      items.forEach(function (item) {
        var video = item.querySelector('video');
        if (video) {
          video.addEventListener('ended', function () {
            next(false);
          });
        }
      });
    }

    // Try to start playback after first user interaction too.
    // This helps if the browser blocks autoplay on first page load.
    ['click', 'touchstart', 'keydown', 'mousemove'].forEach(function (eventName) {
      document.addEventListener(
        eventName,
        function () {
          var currentVideo = items[index].querySelector('video');
          safePlay(currentVideo);
        },
        { once: true }
      );
    });

    showCurrent();
    restartTimer();
  }

  // VQ: short clips, switch every 3.4 seconds.
  initSimpleVideoCarousel('#carousel-vq-main', {
    autoplayByTimer: true,
    interval: 3400,
    advanceOnVideoEnd: false
  });

  // VQ unseen subjects: short clips, switch every 3.4 seconds.
  initSimpleVideoCarousel('#carousel-vq-unseen', {
    autoplayByTimer: true,
    interval: 3400,
    advanceOnVideoEnd: false
  });

  // REG: short clips, switch every 3.4 seconds.
  initSimpleVideoCarousel('#carousel-reg-main', {
    autoplayByTimer: true,
    interval: 3400,
    advanceOnVideoEnd: false
  });

  // REG unseen subjects: short clips, switch every 3.4 seconds.
  initSimpleVideoCarousel('#carousel-reg-unseen', {
    autoplayByTimer: true,
    interval: 3400,
    advanceOnVideoEnd: false
  });

  // mmDiff comparison (main): short clips, switch every 3.4 seconds.
  initSimpleVideoCarousel('#carousel-mmdiff-main', {
    autoplayByTimer: true,
    interval: 3400,
    advanceOnVideoEnd: false
  });

  // mmDiff comparison (unseen): short clips, switch every 3.4 seconds.
  initSimpleVideoCarousel('#carousel-mmdiff-unseen', {
    autoplayByTimer: true,
    interval: 3400,
    advanceOnVideoEnd: false
  });

  // Comparison: long clips, switch when current video ends.
  initSimpleVideoCarousel('#carousel-compare-all', {
    autoplayByTimer: false,
    advanceOnVideoEnd: true
  });
});