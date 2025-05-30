(function () {
  // DOM Element References
  const playerContainer = document.getElementById('playerContainer');
  const video = document.getElementById('video');
  const controlsOverlay = document.getElementById('controlsOverlay');
  
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playPauseIcon = playPauseBtn?.querySelector('svg path'); // Optional chaining
  const playPauseTooltip = playPauseBtn?.querySelector('.control-tooltip');
  
  const volumeBtn = document.getElementById('volumeBtn');
  const volumeIcon = volumeBtn?.querySelector('svg path');
  const volumeTooltip = volumeBtn?.querySelector('.control-tooltip');
  const volumeRangeSlider = document.getElementById('volumeRangeSlider');
  const volumeSliderWrapper = document.getElementById('volumeSliderWrapper');
  
  const seekbarContainer = document.getElementById('seekbarContainer');
  const seekbar = document.getElementById('seekbar');
  const seekbarBufferedProgress = document.getElementById('seekbarBufferedProgress');
  const seekbarTooltip = document.getElementById('seekbarTooltip');
  
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');
  
  const pipBtn = document.getElementById('pipBtn');
  const pipTooltip = pipBtn?.querySelector('.control-tooltip');
  const loopBtn = document.getElementById('loopBtn');
  const loopIconPath = document.getElementById('loopIconPath');
  const loopTooltip = loopBtn?.querySelector('.control-tooltip');
  
  const speedBtn = document.getElementById('speedBtn');
  const speedIndicator = document.getElementById('speedIndicator');
  const speedMenu = document.getElementById('speedMenu');
  
  const qualityBtn = document.getElementById('qualityBtn');
  const qualityMenu = document.getElementById('qualityMenu');
  
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const fullscreenIcon = fullscreenBtn?.querySelector('svg path');
  const fullscreenTooltip = fullscreenBtn?.querySelector('.control-tooltip');

  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingPercentage = document.getElementById('loadingPercentage');
  const errorOverlay = document.getElementById('errorOverlay');
  const notifier = document.getElementById('notifier');
  
  const customUrlInput = document.getElementById('customUrlInput');
  const loadCustomUrlBtn = document.getElementById('loadCustomUrlBtn');

  // State Variables & Constants
  let videoSrc = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'; // Default HLS source
  const PLAY_PATH = 'M8 5v14l11-7z';
  const PAUSE_PATH = 'M6 19h4V5H6zm8-14v14h4V5z';
  const FS_ENTER_PATH = 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z';
  const FS_EXIT_PATH = 'M5 16h3v3H5v-3zm3-8H5v3h3V8zm11 8h-3v3h3v-3zm-3-8h3v3h-3V8z';
  const VOL_HIGH_PATH = "M14.5 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM3 9v6h4l5 5V4L7 9H3zm9.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z";
  const VOL_MID_PATH = "M3 9v6h4l5 5V4L7 9H3zm9.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z";
  const VOL_LOW_PATH = "M3 9v6h4l5 5V4L7 9H3z";
  const VOL_MUTE_PATH = "M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z";
  const LOOP_OFF_PATH = "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z";
  const LOOP_ON_PATH = "M17 2.011H7C4.791 2.011 3 3.802 3 6.011v1.978H1V6.011C1 2.692 3.691 0 7 0h10c.552 0 1 .448 1 1v3.089l4-4v11.823l-4-4V9c0-.552-.448-1-1-1zm-1 19.978H7c-2.209 0-4-1.791-4-4v-1.978h2v1.978c0 1.103.897 2 2 2h10c.552 0 1-.448 1-1v-3.089l4 4V9.177l-4 4V15c0 .552-.448 1-1 1zM7 10.011H5v3.978C5 16.209 6.791 18 9 18h7v2H9c-3.309 0-6-2.691-6-6v-3.978h2z";

  let notifierTimeout = null;
  let controlsTimeout = null;
  let hls = null;
  let isSpeedMenuOpen = false;
  let isQualityMenuOpen = false;
  let lastVolume = 0.8; // Default non-muted volume, matches initial slider value
  let activeMenu = null; // Tracks currently open popup menu (speed or quality)

  // --- Helper Functions ---
  function showNotifier(msg, duration = 2200) { // Slightly shorter duration
    if (!notifier) return;
    notifier.textContent = msg;
    notifier.classList.add('show');
    clearTimeout(notifierTimeout);
    notifierTimeout = setTimeout(() => notifier.classList.remove('show'), duration);
  }

  function toggleLoading(show, percentageText = '') {
    if (!loadingOverlay || !loadingPercentage) return;
    loadingOverlay.classList.toggle('show', show);
    loadingOverlay.setAttribute('aria-hidden', (!show).toString());
    loadingPercentage.textContent = percentageText;
    loadingPercentage.style.display = percentageText ? 'block' : 'none';
  }

  function showError(msg) {
    if (!errorOverlay) return;
    errorOverlay.innerHTML = `<strong>Playback Error:</strong><br>${msg}`;
    errorOverlay.classList.add('show');
    errorOverlay.setAttribute('aria-hidden', 'false');
    console.error("Player Error:", msg);
    toggleLoading(false);
  }

  function formatTime(timeInSeconds) {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  
  function createRipple(event) {
    const button = event.currentTarget;
    if (!button || typeof button.getBoundingClientRect !== 'function') return;
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) existingRipple.remove();
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');
    button.appendChild(circle);
    setTimeout(() => { if (circle.parentNode) circle.remove(); }, 600);
  }

  // --- UI Update Functions (Consolidated and refined) ---
  function updatePlayPauseUI() {
    if (!video || !playPauseIcon || !playPauseBtn) return;
    const isPaused = video.paused || video.ended;
    playPauseIcon.setAttribute('d', isPaused ? PLAY_PATH : PAUSE_PATH);
    playPauseBtn.setAttribute('aria-label', isPaused ? 'Play' : 'Pause');
    playPauseBtn.setAttribute('aria-pressed', (!isPaused).toString());
    if (playPauseTooltip) playPauseTooltip.textContent = isPaused ? 'Play' : 'Pause';
  }

  function updateFullscreenUI() {
    if (!fullscreenIcon || !fullscreenBtn || !playerContainer) return;
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    fullscreenIcon.setAttribute('d', isFs ? FS_EXIT_PATH : FS_ENTER_PATH);
    fullscreenBtn.setAttribute('aria-label', isFs ? 'Exit Fullscreen' : 'Enter Fullscreen');
    fullscreenBtn.setAttribute('aria-pressed', isFs.toString());
    if (fullscreenTooltip) fullscreenTooltip.textContent = isFs ? 'Exit Fullscreen' : 'Fullscreen';
    playerContainer.classList.toggle('fullscreen', isFs);
  }
  
  function updateVolumeUI() {
    if (!video || !volumeIcon || !volumeBtn || !volumeRangeSlider) return;
    const vol = video.volume;
    const muted = video.muted;
    let iconPath;
    if (muted || vol < 0.01) iconPath = VOL_MUTE_PATH;
    else if (vol < 0.33) iconPath = VOL_LOW_PATH;
    else if (vol < 0.66) iconPath = VOL_MID_PATH;
    else iconPath = VOL_HIGH_PATH;
    volumeIcon.setAttribute('d', iconPath);
    volumeBtn.setAttribute('aria-label', muted ? "Unmute" : "Mute");
    if (volumeTooltip) volumeTooltip.textContent = muted ? 'Unmute' : 'Mute';
    volumeRangeSlider.value = muted ? 0 : vol;
    volumeRangeSlider.style.setProperty('--volume-fill', `${muted ? 0 : vol * 100}%`);
  }

  function updateSeekbar() {
    if (!video || !seekbar || !currentTimeEl || !seekbarBufferedProgress) return;
    const duration = video.duration;
    if (!duration || !isFinite(duration) || duration <= 0) {
      seekbar.value = 0; seekbar.style.setProperty('--seekbar-fill', `0%`);
      currentTimeEl.textContent = formatTime(0); seekbarBufferedProgress.style.width = '0%';
      seekbar.setAttribute('aria-valuenow', '0'); seekbar.setAttribute('aria-valuetext', '0:00');
      return;
    }
    const currentTime = video.currentTime;
    const percentage = (currentTime / duration) * 100;
    seekbar.value = percentage; seekbar.style.setProperty('--seekbar-fill', `${percentage}%`);
    currentTimeEl.textContent = formatTime(currentTime);
    seekbar.setAttribute('aria-valuenow', percentage.toFixed(2));
    seekbar.setAttribute('aria-valuetext', formatTime(currentTime));

    if (video.buffered.length > 0) {
        try { 
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const bufferedPercentage = (bufferedEnd / duration) * 100;
            seekbarBufferedProgress.style.width = `${Math.min(bufferedPercentage, 100)}%`;
        } catch (e) { seekbarBufferedProgress.style.width = '0%'; }
    } else { seekbarBufferedProgress.style.width = '0%'; }
  }

  function updatePipButtonUI() {
    if (!pipBtn) return;
    if (!document.pictureInPictureEnabled) { pipBtn.style.display = 'none'; return; }
    pipBtn.style.display = 'flex';
    const inPip = document.pictureInPictureElement === video;
    pipBtn.setAttribute('aria-label', inPip ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture');
    if (pipTooltip) pipTooltip.textContent = inPip ? 'Exit Picture-in-Picture' : 'Picture-in-Picture';
    pipBtn.setAttribute('aria-pressed', inPip.toString());
  }
  
  function updateLoopToggleUI() {
    if (!loopBtn || !video || !loopIconPath) return;
    const isLooping = video.loop;
    loopIconPath.setAttribute('d', isLooping ? LOOP_ON_PATH : LOOP_OFF_PATH);
    loopBtn.setAttribute('aria-label', isLooping ? 'Disable Loop' : 'Enable Loop');
    if (loopTooltip) loopTooltip.textContent = isLooping ? 'Disable Loop' : 'Enable Loop';
    loopBtn.setAttribute('aria-pressed', isLooping.toString());
  }

  function updateSpeedIndicator() {
    if (!speedIndicator || !video) return;
    const rate = video.playbackRate;
    speedIndicator.textContent = rate === 1 ? '1x' : `${rate.toFixed(rate % 1 === 0 ? 0 : 2)}x`;
  }

  // --- Controls Visibility & Interaction ---
  function hideControlsAndCursor() { // Combined for fullscreen
    if (!controlsOverlay || !playerContainer || !video) return;
    if ((document.fullscreenElement || document.webkitFullscreenElement) && !video.paused) {
      if (!isSpeedMenuOpen && !isQualityMenuOpen && !(volumeSliderWrapper && (volumeSliderWrapper.matches(':hover') || volumeSliderWrapper.classList.contains('active')))) {
        controlsOverlay.classList.add('hidden');
        playerContainer.classList.add('cursor-hidden');
      }
    }
  }
  function showControlsAndCursor() { // Combined for fullscreen
    if (!controlsOverlay || !playerContainer || !video) return;
    controlsOverlay.classList.remove('hidden');
    playerContainer.classList.remove('cursor-hidden');
    clearTimeout(controlsTimeout);
    if ((document.fullscreenElement || document.webkitFullscreenElement) && !video.paused) {
      controlsTimeout = setTimeout(hideControlsAndCursor, 3000);
    }
  }
  
  if (playerContainer) {
    playerContainer.addEventListener('mousemove', showControlsAndCursor);
    playerContainer.addEventListener('mouseenter', showControlsAndCursor);
    playerContainer.addEventListener('mouseleave', () => {
      if (!video || !volumeSliderWrapper || !speedMenu || !qualityMenu) return;
      if ((document.fullscreenElement || document.webkitFullscreenElement) && !video.paused && !activeMenu && !volumeSliderWrapper.classList.contains('active')) {
         if (!speedMenu.matches(':hover') && !qualityMenu.matches(':hover')) { // Check specific menus
             controlsTimeout = setTimeout(hideControlsAndCursor, 500);
         }
      }
    });
  }
  if (controlsOverlay) {
    controlsOverlay.addEventListener('mouseenter', () => clearTimeout(controlsTimeout));
    controlsOverlay.addEventListener('mouseleave', () => {
      if (!video) return;
      if ((document.fullscreenElement || document.webkitFullscreenElement) && !video.paused) {
        showControlsAndCursor(); // Re-trigger timer
      }
    });
  }

  // --- Core Player Actions ---
  function togglePlayPause() {
    if(!video) return;
    if(video.readyState < video.HAVE_METADATA && !video.src && videoSrc) { loadMedia(); return; }
    if(video.paused || video.ended) video.play().catch(err => showError(`Playback failed: ${err.message || 'Unknown error'}`));
    else video.pause();
  }

  function toggleFullscreen() {
    if(!playerContainer) return;
    if(!(document.fullscreenElement || document.webkitFullscreenElement)) {
      if(playerContainer.requestFullscreen) playerContainer.requestFullscreen().catch(err => showError(`Fullscreen Error: ${err.message}`));
      else if(playerContainer.webkitRequestFullscreen) playerContainer.webkitRequestFullscreen();
    } else {
      if(document.exitFullscreen) document.exitFullscreen().catch(err => showError(`Fullscreen Error: ${err.message}`));
      else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }

  function toggleMute() {
    if(!video) return;
    video.muted = !video.muted;
    if(!video.muted && video.volume < 0.02) video.volume = lastVolume > 0.01 ? lastVolume : 0.5;
    showNotifier(video.muted ? 'Muted' : `Volume: ${Math.round(video.volume * 100)}%`);
    // volumechange event handles UI update
  }

  function handleVolumeChange() {
    if(!video) return;
    if(!video.muted && video.volume > 0.01) lastVolume = video.volume;
    updateVolumeUI();
  }

  function togglePip() {
    if(!video || !pipBtn) return;
    if(!document.pictureInPictureEnabled) { showNotifier("Picture-in-Picture is not supported."); return; }
    if(document.pictureInPictureElement === video) document.exitPictureInPicture().catch(err => showError(`PiP Error: ${err.message}`));
    else video.requestPictureInPicture().catch(err => showError(`PiP Error: ${err.message}`));
  }

  function toggleLoop() {
    if(!video) return;
    video.loop = !video.loop;
    showNotifier(video.loop ? 'Loop: On' : 'Loop: Off');
    updateLoopToggleUI();
  }
  
  // --- Menu Management ---
  function toggleMenu(menuElement, buttonElement, isOpenStateKey) {
      if (!menuElement || !buttonElement) return;
      const shouldOpen = !window[isOpenStateKey];
      
      if (shouldOpen) { // If opening this menu, close any other active menu
          if (activeMenu && activeMenu !== menuElement) {
              activeMenu.classList.remove('show');
              const activeBtn = document.querySelector(`[aria-controls="${activeMenu.id}"]`);
              if (activeBtn) activeBtn.setAttribute('aria-expanded', 'false');
              if (activeMenu === speedMenu) isSpeedMenuOpen = false;
              if (activeMenu === qualityMenu) isQualityMenuOpen = false;
          }
          // Also close volume slider if it's open
          if (volumeSliderWrapper && volumeSliderWrapper.classList.contains('active')) {
              volumeSliderWrapper.classList.remove('active');
              if(volumeBtn) volumeBtn.setAttribute('aria-expanded', 'false');
          }
      }

      menuElement.classList.toggle('show', shouldOpen);
      buttonElement.setAttribute('aria-expanded', shouldOpen.toString());
      menuElement.setAttribute('aria-hidden', (!shouldOpen).toString());
      window[isOpenStateKey] = shouldOpen;
      activeMenu = shouldOpen ? menuElement : null;

      if (shouldOpen) clearTimeout(controlsTimeout);
      else if (document.fullscreenElement || document.webkitFullscreenElement) showControlsAndCursor();
  }
  
  // --- Quality & Speed Logic ---
  function populateAndSetQualityMenu(levels) {
    if(!qualityMenu || !qualityBtn || !hls) return;
    qualityMenu.innerHTML = ''; // Clear previous
    const autoItem = document.createElement('div');
    autoItem.className = 'menu-item'; autoItem.setAttribute('role', 'menuitemradio');
    autoItem.dataset.level = "-1"; autoItem.textContent = "Auto";
    autoItem.addEventListener('click', () => selectQualityLevel(autoItem, -1));
    qualityMenu.appendChild(autoItem);

    if (!levels || levels.length === 0) {
        qualityBtn.style.display = 'none'; // Hide button if only "Auto"
        autoItem.classList.add('selected'); autoItem.setAttribute('aria-checked', 'true');
        return;
    }
    qualityBtn.style.display = 'flex'; // Show quality button
    levels.forEach((level, index) => {
      const item = document.createElement('div');
      item.className = 'menu-item'; item.setAttribute('role', 'menuitemradio');
      item.setAttribute('aria-checked', 'false'); item.dataset.level = index.toString();
      let qualityText = level.height ? `${level.height}p` : (level.bitrate ? `${Math.round(level.bitrate/1000)}kbps` : `Level ${index + 1}`);
      if(level.height && level.bitrate && Math.round(level.bitrate/1000) > 50) qualityText += ` (${Math.round(level.bitrate/1000)}kbps)`;
      item.textContent = qualityText;
      item.addEventListener('click', () => selectQualityLevel(item, index));
      qualityMenu.appendChild(item);
    });
    const initialLevel = hls.currentLevel !== undefined ? hls.currentLevel : (hls.loadLevel !== undefined ? hls.loadLevel : -1);
    const activeQualityItem = qualityMenu.querySelector(`.menu-item[data-level="${initialLevel}"]`);
    if (activeQualityItem) { activeQualityItem.classList.add('selected'); activeQualityItem.setAttribute('aria-checked', 'true'); }
    else { autoItem.classList.add('selected'); autoItem.setAttribute('aria-checked', 'true'); }
  }

  function selectQualityLevel(clickedItem, levelIndex) {
    if (!hls || !qualityMenu) return;
    qualityMenu.querySelectorAll('.menu-item').forEach(el => {
        el.classList.remove('selected', 'pending-selection'); // Remove both
        el.setAttribute('aria-checked', 'false');
    });
    clickedItem.classList.add('selected'); // Mark as selected immediately for UI
    clickedItem.setAttribute('aria-checked', 'true');
    
    hls.currentLevel = levelIndex; // Command HLS to change level
    showNotifier(`Quality changing to: ${clickedItem.textContent.split(' (')[0]}`);
    // The menu remains open. User closes it by clicking outside or pressing Escape.
    // HLS.Events.LEVEL_SWITCHED will confirm the change.
  }
  
  // --- Media Loading & Reset ---
  function resetPlayerStateForNewUrl() {
    if (!video || !currentTimeEl || !durationEl || !seekbar || !seekbarBufferedProgress || !qualityBtn || !qualityMenu || !speedIndicator || !speedMenu) return;
    if (hls) { hls.destroy(); hls = null; }
    video.pause(); video.removeAttribute('src'); if (typeof video.load === 'function') video.load();
    toggleLoading(false); if (errorOverlay) { errorOverlay.classList.remove('show'); errorOverlay.setAttribute('aria-hidden', 'true'); errorOverlay.textContent = ''; }
    currentTimeEl.textContent = '0:00'; durationEl.textContent = '0:00';
    seekbar.value = 0; seekbar.style.setProperty('--seekbar-fill', `0%`); seekbarBufferedProgress.style.width = '0%';
    updatePlayPauseUI();
    qualityBtn.style.display = 'none'; qualityMenu.innerHTML = '<div class="menu-item selected" role="menuitemradio" aria-checked="true" data-level="-1">Auto</div>';
    if (isQualityMenuOpen) toggleMenu(qualityMenu, qualityBtn, 'isQualityMenuOpen');
    if (isSpeedMenuOpen) toggleMenu(speedMenu, speedBtn, 'isSpeedMenuOpen');
    video.playbackRate = 1; updateSpeedIndicator();
    speedMenu.querySelectorAll('.menu-item').forEach(el => {el.classList.remove('selected'); el.setAttribute('aria-checked', 'false');});
    const defaultSpeedItem = speedMenu.querySelector('.menu-item[data-speed="1"]');
    if (defaultSpeedItem) { defaultSpeedItem.classList.add('selected'); defaultSpeedItem.setAttribute('aria-checked', 'true');}
    updateLoopToggleUI();
  }

  function loadMedia() {
    if (!video || !videoSrc) { showError("Video element or source URL missing."); return; }
    resetPlayerStateForNewUrl(); toggleLoading(true, 'Loading...');
    if (errorOverlay) { errorOverlay.classList.remove('show'); errorOverlay.setAttribute('aria-hidden', 'true');}
    const urlLower = videoSrc.toLowerCase().trim();

    if (urlLower.includes('.m3u8')) {
      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hls = new Hls({
          // Fine-tune HLS config for performance if needed
          // abrEwmaDefaultEstimate: 500000, // Example: Lower initial estimate for faster startup on slow nets
          // capLevelToPlayerSize: true,
        });
        hls.loadSource(videoSrc); hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => { toggleLoading(false); populateAndSetQualityMenu(data.levels || (hls?hls.levels:[])); showNotifier('Video ready'); });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data); let msg = `HLS Error (Type: ${data.type}).`;
          if (data.details) msg += ` Details: ${data.details}.`;
          if (data.fatal) { toggleLoading(false); showError(msg); if(qualityBtn) qualityBtn.style.display = 'none'; }
          else { console.warn(msg); /* Non-fatal, might show a subtle notifier if desired */ }
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            if(!hls || !qualityMenu) return; const level = hls.levels[data.level]; if(!level) return;
            showNotifier(`Quality: ${level.height ? level.height + 'p' : Math.round(level.bitrate/1000) + 'kbps'}`);
            // Update UI to reflect actual current level
            qualityMenu.querySelectorAll('.menu-item').forEach(el => {el.classList.remove('selected'); el.setAttribute('aria-checked', 'false');});
            const activeSwitchedItem = qualityMenu.querySelector(`.menu-item[data-level="${data.level}"]`) || qualityMenu.querySelector('.menu-item[data-level="-1"]');
            if (activeSwitchedItem) { activeSwitchedItem.classList.add('selected'); activeSwitchedItem.setAttribute('aria-checked', 'true'); }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc; toggleLoading(false); showNotifier('Using native HLS playback'); if(qualityBtn)qualityBtn.style.display='none';
      } else {
        toggleLoading(false); showError('HLS playback is not supported in this browser.'); if(qualityBtn)qualityBtn.style.display='none';
      }
    } else if (urlLower.endsWith('.mp4') || urlLower.endsWith('.webm') || urlLower.endsWith('.ogv') || video.canPlayType('video/mp4') || video.canPlayType('video/webm')) {
      if (hls) { hls.destroy(); hls = null; } if (qualityBtn) qualityBtn.style.display = 'none';
      video.src = videoSrc;
      // Video events like 'loadedmetadata' will handle hiding loader
    } else {
      toggleLoading(false); showError("Unsupported video URL or format. Please provide an HLS (m3u8) or common video (MP4, WebM) URL.");
      if (qualityBtn) qualityBtn.style.display = 'none';
    }
  }

  // --- Event Listeners Setup (Universal Ripple first) ---
  document.querySelectorAll('.btn, .btn-load, .menu-item').forEach(interactiveElement => {
      interactiveElement.addEventListener('click', createRipple);
  });

  if (playPauseBtn) playPauseBtn.addEventListener('click', () => { togglePlayPause(); showControlsAndCursor(); });
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => { toggleFullscreen(); showControlsAndCursor(); });
  if (loopBtn) loopBtn.addEventListener('click', () => { toggleLoop(); showControlsAndCursor(); });
  if (speedBtn) speedBtn.addEventListener('click', () => { toggleMenu(speedMenu, speedBtn, 'isSpeedMenuOpen'); });
  if (qualityBtn) qualityBtn.addEventListener('click', () => { toggleMenu(qualityMenu, qualityBtn, 'isQualityMenuOpen'); });
  if (video) video.addEventListener('click', (e) => { if (e.target === video && !activeMenu) { togglePlayPause(); showControlsAndCursor(); } });
  if (volumeBtn) volumeBtn.addEventListener('click', () => { toggleMute(); showControlsAndCursor(); });
  if (volumeRangeSlider) {
    volumeRangeSlider.addEventListener('input', () => { if(!video)return;let v=parseFloat(volumeRangeSlider.value);if(v<0.02){v=0;if(!video.muted)video.muted=true;}else if(video.muted)video.muted=false;video.volume=v;showControlsAndCursor();});
    volumeRangeSlider.addEventListener('change', () => { if(!video)return;showNotifier(`Volume: ${Math.round(video.volume*100)}%`); });
  }
  if (seekbar) {
    seekbar.addEventListener('input', () => {if(!video||!video.duration||!isFinite(video.duration)||!currentTimeEl)return;currentTimeEl.textContent=formatTime((parseFloat(seekbar.value)/100)*video.duration);showControlsAndCursor();});
    seekbar.addEventListener('change', () => {if(!video||!video.duration||!isFinite(video.duration))return;video.currentTime=(parseFloat(seekbar.value)/100)*video.duration;showNotifier(`Seeked to: ${formatTime(video.currentTime)}`);showControlsAndCursor();});
  }
  if (seekbarContainer && seekbarTooltip) {
    seekbarContainer.addEventListener('mousemove', (e) => {if(!video||!video.duration||!isFinite(video.duration)){seekbarTooltip.classList.remove('visible');return;}const r=seekbarContainer.getBoundingClientRect(),x=e.clientX-r.left,p=Math.max(0,Math.min(1,x/r.width));seekbarTooltip.textContent=formatTime(p*video.duration);seekbarTooltip.style.left=`${Math.max(0,Math.min(x,r.width))}px`;seekbarTooltip.classList.add('visible');});
    seekbarContainer.addEventListener('mouseleave', () => seekbarTooltip.classList.remove('visible'));
  }
  if (speedMenu) {
    speedMenu.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => { // Ripple added globally
        if(!video)return;video.playbackRate=parseFloat(item.dataset.speed);
        speedMenu.querySelectorAll('.menu-item').forEach(el=>{el.classList.remove('selected');el.setAttribute('aria-checked','false');});
        item.classList.add('selected');item.setAttribute('aria-checked','true');
        updateSpeedIndicator();showNotifier(`Speed: ${item.textContent === 'Normal' ? '1x' : item.textContent}`);
        toggleMenu(speedMenu, speedBtn, 'isSpeedMenuOpen'); // Close after selection
      });
    });
  }
  if (pipBtn) pipBtn.addEventListener('click', () => togglePip());

  // --- Video Element Event Listeners ---
  if (video) {
    video.addEventListener('play', ()=>{updatePlayPauseUI();showNotifier('Playing');toggleLoading(false);showControlsAndCursor();});
    video.addEventListener('pause', ()=>{updatePlayPauseUI();showNotifier('Paused');toggleLoading(false);clearTimeout(controlsTimeout);showControlsAndCursor();}); // Keep controls if paused
    video.addEventListener('ended', ()=>{updatePlayPauseUI();showNotifier('Video Ended');toggleLoading(false);if(video.loop&&video.duration>0)video.play();});
    video.addEventListener('timeupdate', updateSeekbar);
    video.addEventListener('loadedmetadata', ()=>{if(durationEl)durationEl.textContent=formatTime(video.duration);updateSeekbar();updateVolumeUI();updateSpeedIndicator();updateLoopToggleUI();updatePipButtonUI();updateFullscreenUI();toggleLoading(false);if(errorOverlay){errorOverlay.classList.remove('show');errorOverlay.setAttribute('aria-hidden','true');}});
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ratechange', updateSpeedIndicator); // Update indicator when rate changes programmatically too
    video.addEventListener('waiting', ()=>toggleLoading(true,'Buffering... 0%'));
    video.addEventListener('seeking', ()=>toggleLoading(true,'Seeking...'));
    video.addEventListener('seeked', ()=>{toggleLoading(false);updateSeekbar();});
    video.addEventListener('playing', ()=>{toggleLoading(false);updateSeekbar();}); // Also clear loading when playing actually starts/resumes
    video.addEventListener('canplay', ()=>toggleLoading(false)); // Enough data to play
    video.addEventListener('progress', ()=>{updateSeekbar(); if(video.buffered.length>0&&video.duration>0&&isFinite(video.duration)){try{const bE=video.buffered.end(video.buffered.length-1),pB=(bE/video.duration)*100;if(loadingOverlay&&loadingOverlay.classList.contains('show')&&(video.seeking||video.readyState<video.HAVE_FUTURE_DATA))toggleLoading(true,`Buffering... ${Math.min(100,Math.round(pB))}%`);}catch(e){/* ignore */}}});
    video.addEventListener('error', ()=>{toggleLoading(false);const err=video.error;showError(`Error Code ${err?err.code:0}: ${err?err.message:'Unknown media error.'}`);if(hls){hls.destroy();hls=null;}if(qualityBtn)qualityBtn.style.display='none';});
    video.addEventListener('enterpictureinpicture', ()=>{updatePipButtonUI();showNotifier('Entered Picture-in-Picture');});
    video.addEventListener('leavepictureinpicture', ()=>{updatePipButtonUI();showNotifier('Exited Picture-in-Picture');});
  }

  // --- Document & Global Event Listeners ---
  ['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(evt=>document.addEventListener(evt,()=>{const isFs=!!(document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement||document.msFullscreenElement);updateFullscreenUI();showControlsAndCursor();if(!isFs&&playerContainer)playerContainer.classList.remove('cursor-hidden');showNotifier(isFs?'Fullscreen Enabled':'Fullscreen Disabled');}));
  
  document.addEventListener('click',(e)=>{ // Close popups on outside click
    if (activeMenu && !activeMenu.contains(e.target) && !document.querySelector(`[aria-controls="${activeMenu.id}"]`)?.contains(e.target)) {
        toggleMenu(activeMenu, document.querySelector(`[aria-controls="${activeMenu.id}"]`), activeMenu === speedMenu ? 'isSpeedMenuOpen' : 'isQualityMenuOpen');
    }
    if (volumeSliderWrapper && volumeSliderWrapper.classList.contains('active') && !volumeSliderWrapper.contains(e.target) && e.target !== volumeBtn && !(volumeBtn && volumeBtn.contains(e.target))) {
        volumeSliderWrapper.classList.remove('active'); if (volumeBtn) volumeBtn.setAttribute('aria-expanded', 'false');
    }
  });

  if (volumeBtn && volumeSliderWrapper) { // Toggle volume slider and close other popups
      volumeBtn.addEventListener('click', () => {
          const isShown = volumeSliderWrapper.classList.toggle('active'); volumeBtn.setAttribute('aria-expanded', isShown.toString());
          if (isShown && activeMenu) { // If opening volume, close active speed/quality menu
              toggleMenu(activeMenu, document.querySelector(`[aria-controls="${activeMenu.id}"]`), activeMenu === speedMenu ? 'isSpeedMenuOpen' : 'isQualityMenuOpen');
          }
      });
  }

  document.addEventListener('keydown',(e)=>{
    if(!video)return;const activeEl=document.activeElement;
    const isCustomUrlInput=activeEl&&activeEl.id==='customUrlInput';if(isCustomUrlInput&&e.key!=='Escape')return;
    const isRange=activeEl&&activeEl.type==='range';if(isRange&&e.key.startsWith('Arrow'))return;
    if(e.key===' '&&activeEl&&activeEl.tagName==='BUTTON')return;
    showControlsAndCursor();let notifyMsg='',pDef=true;
    switch(e.key.toLowerCase()){
      case' ':case'k':togglePlayPause();break;
      case'f':if(fullscreenBtn)fullscreenBtn.click();break;
      case'm':toggleMute();break;
      case'arrowleft':if(!video.duration||!isFinite(video.duration)){pDef=false;break;}video.currentTime=Math.max(0,video.currentTime-5);notifMsg=`Seek Back: ${formatTime(video.currentTime)}`;break;
      case'arrowright':if(!video.duration||!isFinite(video.duration)){pDef=false;break;}video.currentTime=Math.min(video.duration,video.currentTime+5);notifMsg=`Seek Fwd: ${formatTime(video.currentTime)}`;break;
      case'arrowup':if(activeEl===volumeRangeSlider){pDef=false;break;}video.volume=Math.min(1,video.volume+0.05);if(video.muted&&video.volume>0.01)video.muted=false;notifMsg=`Volume: ${Math.round(video.volume*100)}%`;break;
      case'arrowdown':if(activeEl===volumeRangeSlider){pDef=false;break;}video.volume=Math.max(0,video.volume-0.05);if(video.volume<0.02&&!video.muted)video.muted=true;notifMsg=video.muted?'Muted':`Volume: ${Math.round(video.volume*100)}%`;break;
      case'escape':
        if(activeMenu){toggleMenu(activeMenu,document.querySelector(`[aria-controls="${activeMenu.id}"]`),activeMenu===speedMenu?'isSpeedMenuOpen':'isQualityMenuOpen');}
        else if(volumeSliderWrapper&&volumeSliderWrapper.classList.contains('active')){volumeSliderWrapper.classList.remove('active');if(volumeBtn)volumeBtn.setAttribute('aria-expanded','false');}
        else if(document.fullscreenElement||document.webkitFullscreenElement)toggleFullscreen();else pDef=false;break;
      case'p':if(document.pictureInPictureEnabled&&pipBtn&&pipBtn.style.display!=='none')togglePip();else pDef=false;break;
      case'l':toggleLoop();break;
      default:if(e.key>='0'&&e.key<='9'){if(!video.duration||!isFinite(video.duration)){pDef=false;break;}const pct=parseInt(e.key)*10;video.currentTime=(pct/100)*video.duration;notifMsg=`Seek to ${pct}%`;}else pDef=false;
    }
    if(pDef)e.preventDefault();if(notifMsg)showNotifier(notifMsg);updateSeekbar();updateVolumeUI();
  });
  
  if (loadCustomUrlBtn && customUrlInput) {
    loadCustomUrlBtn.addEventListener('click',()=>{const url=customUrlInput.value.trim();if(url){showNotifier(`Loading: ${url.substring(0,37)+(url.length>40?'...':'')}`);videoSrc=url;loadMedia();customUrlInput.value='';}else showNotifier("Please enter a valid URL.");});
    customUrlInput.addEventListener('keypress',(e)=>{if(e.key==='Enter')loadCustomUrlBtn.click();});
  }

  // --- Initialisation ---
  function setAccentColorRGB(){const s=getComputedStyle(document.documentElement),c=s.getPropertyValue('--primary-accent').trim();if(c.startsWith('#')){const h=c.substring(1),r=parseInt(h.substring(0,2),16),g=parseInt(h.substring(2,4),16),b=parseInt(h.substring(4,6),16);document.documentElement.style.setProperty('--primary-accent-rgb',`${r},${g},${b}`);}else if(c.startsWith('rgb')){const p=c.match(/\d+/g);if(p&&p.length>=3)document.documentElement.style.setProperty('--primary-accent-rgb',`${p[0]},${p[1]},${p[2]}`);}}
  
  function initPlayer() {
    if (!video) { console.error("Video player element (#video) not found. Aborting initialization."); return; }
    setAccentColorRGB();
    video.volume = lastVolume; // Set initial volume from stored state
    
    // Call all UI updaters to set initial states and tooltips
    updatePlayPauseUI(); updateFullscreenUI(); updateVolumeUI();
    updatePipButtonUI(); updateLoopToggleUI(); updateSpeedIndicator();

    if (speedMenu) { // Set initial speed selection in menu
        speedMenu.querySelectorAll('.menu-item').forEach(el => {el.classList.remove('selected'); el.setAttribute('aria-checked', 'false');});
        const defaultSpeedItem = speedMenu.querySelector('.menu-item[data-speed="1"]');
        if (defaultSpeedItem) { defaultSpeedItem.classList.add('selected'); defaultSpeedItem.setAttribute('aria-checked', 'true');}
    }
    
    loadMedia(); // Load default or specified media
    showControlsAndCursor(); // Show controls initially
  }

  // Initialize player when the DOM is ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPlayer);
  else initPlayer(); // DOM is already loaded

})();
