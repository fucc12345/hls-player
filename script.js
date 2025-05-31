(function () {
  // DOM Element References
  const playerContainer = document.getElementById('playerContainer');
  const video = document.getElementById('video');
  const controlsOverlay = document.getElementById('controlsOverlay');
  
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playPauseIcon = playPauseBtn?.querySelector('svg path');
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
  const loopIconPath = document.getElementById('loopIconPath'); // Assumed to be the <path> element for loop icon
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
  let lastVolume = 0.8; // Default non-muted volume
  let activeMenu = null; // Tracks currently open popup menu (speed or quality)

  // --- Helper Functions ---
  function showNotifier(msg, duration = 2200) {
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
    errorOverlay.innerHTML = `<strong>Playback Error:</strong><br>${msg}`; // Use innerHTML for <br>
    errorOverlay.classList.add('show');
    errorOverlay.setAttribute('aria-hidden', 'false');
    console.error("Player Error:", msg);
    toggleLoading(false); // Ensure loading is hidden on error
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
    
    // Remove any existing ripple to prevent multiple ripples if clicked fast
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
    // Remove ripple after animation (ensure this matches CSS animation duration)
    setTimeout(() => {
        if (circle.parentNode) { // Check if still attached before removing
            circle.remove();
        }
    }, 600); // Duration of ripple animation
  }

  // --- UI Update Functions ---
  function updatePlayPauseUI() {
    if (!video || !playPauseIcon || !playPauseBtn) return;
    const isPaused = video.paused || video.ended;
    playPauseIcon.setAttribute('d', isPaused ? PLAY_PATH : PAUSE_PATH);
    playPauseBtn.setAttribute('aria-label', isPaused ? 'Play' : 'Pause');
    playPauseBtn.setAttribute('aria-pressed', (!isPaused).toString());
    if (playPauseTooltip) playPauseTooltip.textContent = isPaused ? 'Play (k)' : 'Pause (k)';
  }

  function updateFullscreenUI() {
    if (!fullscreenIcon || !fullscreenBtn || !playerContainer) return;
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    fullscreenIcon.setAttribute('d', isFs ? FS_EXIT_PATH : FS_ENTER_PATH);
    fullscreenBtn.setAttribute('aria-label', isFs ? 'Exit Fullscreen' : 'Enter Fullscreen');
    fullscreenBtn.setAttribute('aria-pressed', isFs.toString());
    if (fullscreenTooltip) fullscreenTooltip.textContent = isFs ? 'Exit Fullscreen (f)' : 'Fullscreen (f)';
    playerContainer.classList.toggle('fullscreen', isFs);
  }
  
  function updateVolumeUI() {
    if (!video || !volumeIcon || !volumeBtn || !volumeRangeSlider) return;
    const vol = video.volume;
    const muted = video.muted;
    let iconPath;

    if (muted || vol < 0.01) iconPath = VOL_MUTE_PATH;
    else if (vol < 0.33) iconPath = VOL_LOW_PATH;
    else if (vol < 0.66) iconPath = VOL_MID_PATH; // VOL_MID_PATH can be same as VOL_HIGH_PATH if desired
    else iconPath = VOL_HIGH_PATH;
    
    volumeIcon.setAttribute('d', iconPath);
    volumeBtn.setAttribute('aria-label', muted ? "Unmute" : "Mute"); // Mute button's primary action
    if (volumeTooltip) volumeTooltip.textContent = muted ? 'Unmute (m)' : 'Mute (m)';
    
    volumeRangeSlider.value = muted ? 0 : vol;
    volumeRangeSlider.style.setProperty('--volume-fill', `${muted ? 0 : vol * 100}%`);
    volumeRangeSlider.setAttribute('aria-valuenow', muted ? 0 : (vol * 100).toFixed(0));
    volumeRangeSlider.setAttribute('aria-valuetext', muted ? 'Muted' : `${(vol * 100).toFixed(0)}% volume`);
  }

  function updateSeekbar() {
    if (!video || !seekbar || !currentTimeEl || !seekbarBufferedProgress) return;
    const duration = video.duration;

    if (isNaN(duration) || !isFinite(duration) || duration <= 0) {
      seekbar.value = 0; 
      seekbar.style.setProperty('--seekbar-fill', `0%`);
      currentTimeEl.textContent = formatTime(0); 
      // Only reset durationEl if it seems uninitialized or was '0:00'
      // This prevents overwriting a valid duration if video.duration temporarily becomes invalid
      if (durationEl && (durationEl.textContent === "0:00" || durationEl.textContent === "" || !durationEl.textContent.includes(":"))) {
          durationEl.textContent = formatTime(0);
      }
      seekbarBufferedProgress.style.width = '0%';
      seekbar.setAttribute('aria-valuenow', '0'); 
      seekbar.setAttribute('aria-valuetext', '0:00');
      return;
    }

    const currentTime = video.currentTime;
    const percentage = (currentTime / duration) * 100;
    seekbar.value = percentage; 
    seekbar.style.setProperty('--seekbar-fill', `${percentage}%`);
    currentTimeEl.textContent = formatTime(currentTime);
    seekbar.setAttribute('aria-valuenow', percentage.toFixed(2));
    seekbar.setAttribute('aria-valuetext', formatTime(currentTime));

    if (video.buffered && video.buffered.length > 0) {
        try { 
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const bufferedPercentage = (bufferedEnd / duration) * 100;
            seekbarBufferedProgress.style.width = `${Math.min(bufferedPercentage, 100)}%`; // Cap at 100%
        } catch (e) { 
            // console.warn("Error accessing video.buffered:", e); // Optional for debugging
            seekbarBufferedProgress.style.width = '0%'; // Fallback
        }
    } else { 
        seekbarBufferedProgress.style.width = '0%'; 
    }
  }

  function updatePipButtonUI() {
    if (!pipBtn) return;
    if (!document.pictureInPictureEnabled) { 
      pipBtn.style.display = 'none'; 
      return; 
    }
    pipBtn.style.display = 'flex'; // Ensure it's flex if supported, matches CSS
    const inPip = document.pictureInPictureElement === video;
    pipBtn.setAttribute('aria-label', inPip ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture');
    if (pipTooltip) pipTooltip.textContent = inPip ? 'Exit PiP (p)' : 'Picture-in-Picture (p)';
    pipBtn.setAttribute('aria-pressed', inPip.toString());
  }
  
  function updateLoopToggleUI() {
    if (!loopBtn || !video || !loopIconPath) return;
    const isLooping = video.loop;
    loopIconPath.setAttribute('d', isLooping ? LOOP_ON_PATH : LOOP_OFF_PATH);
    loopBtn.setAttribute('aria-label', isLooping ? 'Disable Loop' : 'Enable Loop');
    if (loopTooltip) loopTooltip.textContent = isLooping ? 'Loop Off (l)' : 'Loop On (l)';
    loopBtn.setAttribute('aria-pressed', isLooping.toString());
  }

  function updateSpeedIndicator() {
    if (!speedIndicator || !video) return;
    const rate = video.playbackRate;
    // Show 1 or 2 decimal places, but no decimal for whole numbers like 1x, 2x
    speedIndicator.textContent = rate === 1 ? '1x' : `${rate.toFixed(rate % 1 === 0 ? 0 : (rate.toString().split('.')[1]?.length || 2) > 1 ? 2 : 1)}x`;
  }

  // --- Controls Visibility & Interaction ---
  function hideControlsAndCursor() { 
    if (!controlsOverlay || !playerContainer || !video) return;
    const isFullScreenActive = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (isFullScreenActive && !video.paused) {
      // Only hide if no menu is open and volume slider is not active/hovered
      if (!isSpeedMenuOpen && !isQualityMenuOpen && 
          !(volumeSliderWrapper && (volumeSliderWrapper.matches(':hover') || volumeSliderWrapper.classList.contains('active')))) {
        controlsOverlay.classList.add('hidden');
        playerContainer.classList.add('cursor-hidden');
      }
    }
  }
  function showControlsAndCursor() { 
    if (!controlsOverlay || !playerContainer || !video) return;
    controlsOverlay.classList.remove('hidden');
    playerContainer.classList.remove('cursor-hidden');
    clearTimeout(controlsTimeout);
    const isFullScreenActive = !!(document.fullscreenElement || document.webkitFullscreenElement);
    if (isFullScreenActive && !video.paused) {
      controlsTimeout = setTimeout(hideControlsAndCursor, 3000);
    }
  }
  
  if (playerContainer) {
    playerContainer.addEventListener('mousemove', showControlsAndCursor);
    playerContainer.addEventListener('mouseenter', showControlsAndCursor);
    playerContainer.addEventListener('mouseleave', () => {
      if (!video || !volumeSliderWrapper || !speedMenu || !qualityMenu) return;
      const isFullScreenActive = !!(document.fullscreenElement || document.webkitFullscreenElement);
      // If mouse leaves player container while in fullscreen, video playing, and no popups are active/hovered
      if (isFullScreenActive && !video.paused && !activeMenu && !volumeSliderWrapper.classList.contains('active')) {
         if (!speedMenu?.matches(':hover') && !qualityMenu?.matches(':hover') && !volumeSliderWrapper?.matches(':hover')) { 
             controlsTimeout = setTimeout(hideControlsAndCursor, 500);
         }
      }
    });
  }
  if (controlsOverlay) {
    controlsOverlay.addEventListener('mouseenter', () => clearTimeout(controlsTimeout)); // Keep controls if mouse enters overlay
    controlsOverlay.addEventListener('mouseleave', () => { // If mouse leaves overlay (e.g. back to video area)
      if (!video) return;
      const isFullScreenActive = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (isFullScreenActive && !video.paused) {
        showControlsAndCursor(); // Re-trigger timer
      }
    });
  }

  // --- Core Player Actions ---
  function togglePlayPause() {
    if(!video) return;
    // If video hasn't loaded metadata and has no src, but a videoSrc is defined, try loading it.
    if(video.readyState < video.HAVE_METADATA && !video.src && videoSrc) { 
      loadMedia(); 
      return; 
    }
    if(video.paused || video.ended) {
      video.play().catch(err => showError(`Playback failed: ${err.message || 'Unknown error'}`));
    } else {
      video.pause();
    }
  }

  function toggleFullscreen() {
    if(!playerContainer) return;
    if(!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)) {
      if(playerContainer.requestFullscreen) playerContainer.requestFullscreen().catch(err => showError(`Fullscreen request failed: ${err.message || 'Unknown error'}`));
      else if(playerContainer.webkitRequestFullscreen) playerContainer.webkitRequestFullscreen(); // Safari
      else if(playerContainer.mozRequestFullScreen) playerContainer.mozRequestFullScreen(); // Firefox (older)
      else if(playerContainer.msRequestFullscreen) playerContainer.msRequestFullscreen(); // IE11
    } else {
      if(document.exitFullscreen) document.exitFullscreen().catch(err => showError(`Exit fullscreen failed: ${err.message || 'Unknown error'}`));
      else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if(document.mozCancelFullScreen) document.mozCancelFullScreen(); // Firefox (older)
      else if(document.msExitFullscreen) document.msExitFullscreen();
    }
  }

  function toggleMute() { // Primarily for keyboard shortcut 'm'
    if(!video) return;
    video.muted = !video.muted;
    if(!video.muted && video.volume < 0.02) { // If unmuting and volume is near zero
        video.volume = lastVolume > 0.01 ? lastVolume : 0.5; // Restore last known or default
    }
    showNotifier(video.muted ? 'Muted' : `Volume: ${Math.round(video.volume * 100)}%`);
    updateVolumeUI(); // Ensure UI (icon, slider) updates immediately
  }

  function handleVolumeChange() { // Called by video's 'volumechange' event
    if(!video) return;
    if(!video.muted && video.volume > 0.01) { // Store last non-zero, non-muted volume
        lastVolume = video.volume;
    }
    updateVolumeUI();
    // Notifier is typically handled by the action that caused volume change (e.g., slider, mute key)
  }

  function togglePip() {
    if(!video || !pipBtn) return; // Ensure button exists
    if(!document.pictureInPictureEnabled) { 
        showNotifier("Picture-in-Picture is not supported or enabled in your browser."); 
        return; 
    }
    if(document.pictureInPictureElement === video) {
        document.exitPictureInPicture().catch(err => showError(`Could not exit Picture-in-Picture: ${err.message || 'Unknown error'}`));
    } else {
        video.requestPictureInPicture().catch(err => showError(`Could not enter Picture-in-Picture: ${err.message || 'Unknown error'}`));
    }
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
      const shouldOpen = !window[isOpenStateKey]; // Access global state variable by string key
      
      if (shouldOpen) { 
          // Close any other active menu (speed/quality)
          if (activeMenu && activeMenu !== menuElement) { 
              activeMenu.classList.remove('show');
              const activeBtn = document.querySelector(`[aria-controls="${activeMenu.id}"]`);
              if (activeBtn) activeBtn.setAttribute('aria-expanded', 'false');
              // Update the corresponding global state variable for the closed menu
              if (activeMenu === speedMenu) isSpeedMenuOpen = false;
              if (activeMenu === qualityMenu) isQualityMenuOpen = false;
          }
          // Also close volume slider if it's open and we are opening a menu
          if (volumeSliderWrapper?.classList.contains('active')) { 
              volumeSliderWrapper.classList.remove('active');
              if(volumeBtn) volumeBtn.setAttribute('aria-expanded', 'false');
          }
      }

      menuElement.classList.toggle('show', shouldOpen);
      buttonElement.setAttribute('aria-expanded', shouldOpen.toString());
      menuElement.setAttribute('aria-hidden', (!shouldOpen).toString());
      window[isOpenStateKey] = shouldOpen; // Update global state variable for current menu
      activeMenu = shouldOpen ? menuElement : null;

      if (shouldOpen) {
          clearTimeout(controlsTimeout); // Keep controls visible while menu is open
      } else if (document.fullscreenElement || document.webkitFullscreenElement) {
          showControlsAndCursor(); // Restart controls hiding timer if in fullscreen and menu closed
      }
  }
  
  // --- Quality & Speed Logic ---
  function populateAndSetQualityMenu(manifestLevels) {
    if(!qualityMenu || !qualityBtn || !hls) return;
    qualityMenu.innerHTML = ''; 
    const availableLevels = manifestLevels || (hls.levels || []); // Use manifest levels, fallback to HLS instance levels

    const autoItem = document.createElement('div');
    autoItem.className = 'menu-item'; autoItem.setAttribute('role', 'menuitemradio');
    autoItem.dataset.level = "-1"; autoItem.textContent = "Auto";
    autoItem.setAttribute('aria-checked', 'false'); // Initial state, will be updated
    autoItem.addEventListener('click', () => selectQualityLevel(autoItem, -1));
    qualityMenu.appendChild(autoItem);

    if (availableLevels.length === 0) { // If no specific levels, only "Auto" is available
        qualityBtn.style.display = 'none'; 
        autoItem.classList.add('selected'); autoItem.setAttribute('aria-checked', 'true');
        return;
    }
    qualityBtn.style.display = 'flex'; // Show quality button if there are levels

    availableLevels.forEach((level, index) => {
      const item = document.createElement('div');
      item.className = 'menu-item'; item.setAttribute('role', 'menuitemradio');
      item.setAttribute('aria-checked', 'false'); item.dataset.level = index.toString(); // Index in hls.levels array
      
      let qualityText = level.height ? `${level.height}p` : (level.bitrate ? `${Math.round(level.bitrate/1000)}kbps` : `Level ${index + 1}`);
      // Add bitrate info if useful and not redundant
      if(level.height && level.bitrate && Math.round(level.bitrate/1000) > 50 && level.height < 2000) { 
        qualityText += ` (${Math.round(level.bitrate/1000)}kbps)`;
      }
      item.textContent = qualityText;
      item.addEventListener('click', () => selectQualityLevel(item, index));
      qualityMenu.appendChild(item);
    });

    // hls.currentLevel is -1 for auto, or an index into hls.levels
    const currentHlsLevelIndex = hls.currentLevel; 
    // Try to find the menu item corresponding to HLS's current level
    const activeQualityItem = qualityMenu.querySelector(`.menu-item[data-level="${currentHlsLevelIndex}"]`);
    
    if (activeQualityItem) { // If a specific level is active and found in the menu
        activeQualityItem.classList.add('selected'); 
        activeQualityItem.setAttribute('aria-checked', 'true');
    } else { // Default to "Auto" if currentLevel is -1 (auto) or not found in menu items
        autoItem.classList.add('selected'); 
        autoItem.setAttribute('aria-checked', 'true');
    }
  }

  function selectQualityLevel(clickedItem, levelIndex) { // levelIndex is index in hls.levels, or -1 for auto
    if (!hls || !qualityMenu) return;
    
    // Update UI immediately for responsiveness
    qualityMenu.querySelectorAll('.menu-item').forEach(el => {
        el.classList.remove('selected'); 
        el.setAttribute('aria-checked', 'false');
    });
    clickedItem.classList.add('selected'); 
    clickedItem.setAttribute('aria-checked', 'true');
    
    hls.currentLevel = levelIndex; // Tell HLS to switch level
    showNotifier(`Quality changing to: ${levelIndex === -1 ? 'Auto' : clickedItem.textContent.split(' (')[0]}`); // Split to get "720p" from "720p (1200kbps)"
    
    // Optional: Close menu after selection, or let user close it.
    // if (qualityBtn) toggleMenu(qualityMenu, qualityBtn, 'isQualityMenuOpen'); 
  }
  
  // --- Media Loading & Reset ---
  function resetPlayerStateForNewUrl() {
    if (!video) return;
    if (hls) { hls.destroy(); hls = null; } // Destroy existing HLS instance
    
    video.pause(); 
    video.removeAttribute('src'); // Remove current source
    if (typeof video.load === 'function') video.load(); // Resets media element state
    
    toggleLoading(false); 
    if (errorOverlay) { 
        errorOverlay.classList.remove('show'); 
        errorOverlay.setAttribute('aria-hidden', 'true'); 
        errorOverlay.textContent = ''; 
    }
    if(currentTimeEl) currentTimeEl.textContent = '0:00'; 
    if(durationEl) durationEl.textContent = '0:00';
    if(seekbar) {
      seekbar.value = 0; 
      seekbar.style.setProperty('--seekbar-fill', `0%`);
      seekbar.setAttribute('aria-valuenow', '0');
      seekbar.setAttribute('aria-valuetext', '0:00');
    }
    if(seekbarBufferedProgress) seekbarBufferedProgress.style.width = '0%';
    
    updatePlayPauseUI(); // Reset play/pause button
    if(qualityBtn) qualityBtn.style.display = 'none'; // Hide quality button initially
    if(qualityMenu) qualityMenu.innerHTML = '<div class="menu-item selected" role="menuitemradio" aria-checked="true" data-level="-1">Auto</div>'; // Reset to default "Auto"
    
    // Close any open menus
    if (isQualityMenuOpen && qualityMenu && qualityBtn) toggleMenu(qualityMenu, qualityBtn, 'isQualityMenuOpen');
    if (isSpeedMenuOpen && speedMenu && speedBtn) toggleMenu(speedMenu, speedBtn, 'isSpeedMenuOpen');
    
    video.playbackRate = 1; // Reset speed
    updateSpeedIndicator();
    if(speedMenu) { // Reset speed menu selection
        speedMenu.querySelectorAll('.menu-item').forEach(el => {el.classList.remove('selected'); el.setAttribute('aria-checked', 'false');});
        const defaultSpeedItem = speedMenu.querySelector('.menu-item[data-speed="1"]');
        if (defaultSpeedItem) { defaultSpeedItem.classList.add('selected'); defaultSpeedItem.setAttribute('aria-checked', 'true');}
    }
    if(video.loop) video.loop = false; // Reset loop state
    updateLoopToggleUI();
    // Other UI elements like fullscreen, PIP will be updated by video events or init
  }

  function loadMedia() {
    if (!video || !videoSrc) { showError("Video element or source URL missing."); return; }
    resetPlayerStateForNewUrl(); // Ensure clean state before loading new media
    toggleLoading(true, 'Loading...');
    if (errorOverlay) { errorOverlay.classList.remove('show'); errorOverlay.setAttribute('aria-hidden', 'true');} // Hide previous errors
    
    const urlLower = videoSrc.toLowerCase().trim();

    if (urlLower.includes('.m3u8')) {
      if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hls = new Hls({
          // Example HLS.js configurations:
          // capLevelToPlayerSize: true, // Useful for optimizing bandwidth by not loading qualities larger than player
          // abrEwmaDefaultEstimate: 500000, // Initial bitrate estimate for ABR, affects startup
          // lowLatencyMode: urlLower.includes('ll-hls') // Conditionally enable LL-HLS mode
        });
        hls.loadSource(videoSrc); 
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => { 
            toggleLoading(false); 
            populateAndSetQualityMenu(data.levels); // Use levels from this specific manifest for menu
            showNotifier('Video ready'); 
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data); 
          let msg = `HLS Error (Type: ${data.type}).`;
          if (data.details) msg += ` Details: ${data.details}.`;
          if (data.fatal) { 
            toggleLoading(false); 
            showError(msg); 
            if(qualityBtn) qualityBtn.style.display = 'none'; // Hide quality if HLS fails fatally
          } else { 
            console.warn("Non-fatal HLS Error:", msg); 
            // Optionally, show a less intrusive notification for non-fatal errors if desired
          }
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            if(!hls || !qualityMenu || !hls.levels || data.level === undefined) return; // Guard checks
            const levelIndex = data.level; // This is the index in hls.levels array
            const level = hls.levels[levelIndex]; 
            
            if(level) { // If specific level info is available
                showNotifier(`Quality: ${level.height ? level.height + 'p' : (level.bitrate ? Math.round(level.bitrate/1000) + 'kbps' : 'Auto')}`);
            } else if (levelIndex === -1) { // Explicitly switched to Auto mode
                showNotifier(`Quality: Auto`);
            }
            
            // Update the selected item in the quality menu
            qualityMenu.querySelectorAll('.menu-item').forEach(el => {el.classList.remove('selected'); el.setAttribute('aria-checked', 'false');});
            const activeSwitchedItem = qualityMenu.querySelector(`.menu-item[data-level="${levelIndex}"]`);
            if (activeSwitchedItem) { 
                activeSwitchedItem.classList.add('selected'); 
                activeSwitchedItem.setAttribute('aria-checked', 'true');
            } else { // Fallback to "Auto" item if specific level not in menu or if levelIndex is -1
                 const autoItem = qualityMenu.querySelector('.menu-item[data-level="-1"]');
                 if(autoItem) {autoItem.classList.add('selected'); autoItem.setAttribute('aria-checked', 'true');}
            }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('audio/mpegurl')) { // Native HLS support (e.g., Safari)
        video.src = videoSrc; 
        // Native HLS: loadedmetadata will hide loader. Quality selection is typically not available.
        if(qualityBtn) qualityBtn.style.display='none';
        showNotifier('Using native HLS playback'); 
        // toggleLoading(false) will be called by video events like 'canplay' or 'loadedmetadata'
      } else { // No HLS support at all
        toggleLoading(false); 
        showError('HLS playback is not supported in this browser.'); 
        if(qualityBtn) qualityBtn.style.display='none';
      }
    } else if (urlLower.endsWith('.mp4') || urlLower.endsWith('.webm') || urlLower.endsWith('.ogv') || 
               video.canPlayType('video/mp4') || video.canPlayType('video/webm') || video.canPlayType('video/ogg')) { // Common video formats
      if (hls) { hls.destroy(); hls = null; } // Ensure HLS is cleaned up if switching from HLS to MP4
      if (qualityBtn) qualityBtn.style.display = 'none'; // No quality selection for direct files
      video.src = videoSrc;
      // Video events like 'loadedmetadata', 'canplay' will handle hiding loader and other UI updates.
    } else { // Unsupported format
      toggleLoading(false); 
      showError("Unsupported video URL or format. Please provide an HLS (m3u8) or common video (MP4, WebM, OGV) URL.");
      if (qualityBtn) qualityBtn.style.display = 'none';
    }
  }

  // --- Event Listeners Setup (Universal Ripple first) ---
  document.querySelectorAll('.btn, .btn-load, .menu-item').forEach(interactiveElement => {
      if (interactiveElement) interactiveElement.addEventListener('click', createRipple);
  });

  playPauseBtn?.addEventListener('click', () => { togglePlayPause(); showControlsAndCursor(); });
  fullscreenBtn?.addEventListener('click', () => { toggleFullscreen(); showControlsAndCursor(); });
  loopBtn?.addEventListener('click', () => { toggleLoop(); showControlsAndCursor(); });
  speedBtn?.addEventListener('click', () => { if(speedMenu && speedBtn) toggleMenu(speedMenu, speedBtn, 'isSpeedMenuOpen'); });
  qualityBtn?.addEventListener('click', () => { if(qualityMenu && qualityBtn) toggleMenu(qualityMenu, qualityBtn, 'isQualityMenuOpen'); });
  
  video?.addEventListener('click', (e) => { 
    // Click on video itself to toggle play/pause, but not if a menu/slider is open on top
    if (e.target === video && !activeMenu && !volumeSliderWrapper?.classList.contains('active') ) { 
        togglePlayPause(); 
        showControlsAndCursor(); 
    } 
  });

  volumeBtn?.addEventListener('click', () => { 
      // This button primarily toggles the visibility of the volume slider.
      if (volumeSliderWrapper && volumeBtn) {
          const isSliderShown = volumeSliderWrapper.classList.toggle('active');
          volumeBtn.setAttribute('aria-expanded', isSliderShown.toString());
          if (isSliderShown) { // If opening volume slider
              if (activeMenu) { // Close any other active menu (speed/quality)
                  const menuToClose = activeMenu; 
                  const btnForMenu = document.querySelector(`[aria-controls="${menuToClose.id}"]`);
                  const stateKey = menuToClose === speedMenu ? 'isSpeedMenuOpen' : 'isQualityMenuOpen';
                  if (btnForMenu) toggleMenu(menuToClose, btnForMenu, stateKey); 
              }
              clearTimeout(controlsTimeout); // Keep controls visible while slider is active
          } else if (document.fullscreenElement || document.webkitFullscreenElement) {
              showControlsAndCursor(); // Restart timer if closing slider in fullscreen
          }
      } else { // Fallback to simple mute if slider wrapper isn't part of the design (unlikely with current HTML)
          toggleMute(); // This would be if volumeBtn is a pure mute button
      }
      showControlsAndCursor(); // Ensure controls are visible after interaction
  });

  volumeRangeSlider?.addEventListener('input', () => { 
    if(!video) return;
    let v = parseFloat(volumeRangeSlider.value);
    if(v < 0.01) { // Treat very low volume as effectively mute for UI consistency
        v = 0; // Set volume to 0
        if(!video.muted) video.muted = true; // Also set muted state
    } else {
        if(video.muted) video.muted = false; // Unmute if was muted and slider moved
    }
    video.volume = v; // Set video volume
    // updateVolumeUI() will be called by the 'volumechange' event on the video element
    showControlsAndCursor(); // Keep controls visible during interaction
  });
  volumeRangeSlider?.addEventListener('change', () => { // After user releases slider
    if(!video) return;
    // Provide feedback on the final volume set
    showNotifier(video.muted ? 'Muted' : `Volume: ${Math.round(video.volume*100)}%`); 
    // updateVolumeUI will be called by 'volumechange'
  });

  seekbar?.addEventListener('input', () => { // While dragging
    if(!video||!video.duration||!isFinite(video.duration)||!currentTimeEl || video.duration <= 0)return;
    const seekTime = (parseFloat(seekbar.value)/100)*video.duration;
    currentTimeEl.textContent=formatTime(seekTime); // Update time display immediately
    seekbar.style.setProperty('--seekbar-fill', `${seekbar.value}%`); // Update fill track immediately
    showControlsAndCursor();
  });
  seekbar?.addEventListener('change', () => { // After drag release
    if(!video||!video.duration||!isFinite(video.duration) || video.duration <= 0)return;
    video.currentTime=(parseFloat(seekbar.value)/100)*video.duration; // Set video current time
    showNotifier(`Seeked to: ${formatTime(video.currentTime)}`);
    showControlsAndCursor();
  });

  if (seekbarContainer && seekbarTooltip) {
    seekbarContainer.addEventListener('mousemove', (e) => {
      if(!video||!video.duration||!isFinite(video.duration) || video.duration <= 0){ // Ensure valid duration
        if (seekbarTooltip) seekbarTooltip.classList.remove('visible');
        return;
      }
      const r=seekbarContainer.getBoundingClientRect();
      const x=e.clientX-r.left; // Mouse position relative to seekbar container
      const p=Math.max(0,Math.min(1,x/r.width)); // Percentage position on seekbar
      
      seekbarTooltip.textContent=formatTime(p*video.duration); // Set tooltip text
      
      // Position tooltip: try to center it above cursor, constrained by seekbar width
      const tooltipWidth = seekbarTooltip.offsetWidth;
      let tooltipLeft = x - (tooltipWidth / 2);
      tooltipLeft = Math.max(0, tooltipLeft); // Prevent going off left edge
      tooltipLeft = Math.min(tooltipLeft, r.width - tooltipWidth); // Prevent going off right edge
      
      seekbarTooltip.style.left=`${tooltipLeft}px`;
      seekbarTooltip.classList.add('visible');
    });
    seekbarContainer.addEventListener('mouseleave', () => {
        if (seekbarTooltip) seekbarTooltip.classList.remove('visible');
    });
  }

  speedMenu?.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', () => { 
      if(!video || !speedBtn || !speedMenu) return; // Guard clauses
      video.playbackRate=parseFloat(item.dataset.speed);
      // Update selection state in menu
      speedMenu.querySelectorAll('.menu-item').forEach(el=>{el.classList.remove('selected');el.setAttribute('aria-checked','false');});
      item.classList.add('selected');item.setAttribute('aria-checked','true');
      
      updateSpeedIndicator(); // Update the speed indicator text
      showNotifier(`Speed: ${item.textContent === 'Normal' || item.textContent === '1x' ? '1x' : item.textContent}`);
      toggleMenu(speedMenu, speedBtn, 'isSpeedMenuOpen'); // Close menu after selection
    });
  });

  pipBtn?.addEventListener('click', () => togglePip());

  // --- Video Element Event Listeners ---
  if (video) {
    video.addEventListener('play', ()=>{updatePlayPauseUI();showNotifier('Playing');toggleLoading(false);showControlsAndCursor();});
    video.addEventListener('pause', ()=>{updatePlayPauseUI();/*showNotifier('Paused');*/toggleLoading(false);clearTimeout(controlsTimeout);showControlsAndCursor();}); // No notifier on pause to avoid too many messages
    video.addEventListener('ended', ()=>{updatePlayPauseUI();showNotifier('Video Ended');toggleLoading(false);if(video.loop&&video.duration>0 && isFinite(video.duration))video.play().catch(e => console.warn("Loop playback error:", e));});
    video.addEventListener('timeupdate', updateSeekbar);
    video.addEventListener('loadedmetadata', ()=>{
        if(durationEl && video.duration && isFinite(video.duration)) durationEl.textContent=formatTime(video.duration);
        updateSeekbar();updateVolumeUI();updateSpeedIndicator();
        updateLoopToggleUI();updatePipButtonUI();updateFullscreenUI();
        toggleLoading(false); // Hide loading once metadata is loaded
        if(errorOverlay){errorOverlay.classList.remove('show');errorOverlay.setAttribute('aria-hidden','true');} // Clear any previous errors
    });
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ratechange', updateSpeedIndicator); 
    video.addEventListener('waiting', ()=>toggleLoading(true,'Buffering...')); // Simplified buffering message
    video.addEventListener('seeking', ()=>toggleLoading(true,'Seeking...'));
    video.addEventListener('seeked', ()=>{toggleLoading(false);updateSeekbar();}); // Hide loading after seek, update seekbar
    video.addEventListener('playing', ()=>{toggleLoading(false);updateSeekbar();}); // When playback actually starts/resumes
    video.addEventListener('canplay', ()=>toggleLoading(false)); // Enough data to start playing
    video.addEventListener('progress', ()=>{
        updateSeekbar(); // Update buffer bar on progress
        // If loading overlay is shown for buffering, update percentage
        if(video.buffered.length > 0 && video.duration > 0 && isFinite(video.duration)){
            try{
                const bufferedEnd = video.buffered.end(video.buffered.length-1);
                const percentBuffered = (bufferedEnd / video.duration)*100;
                if(loadingOverlay?.classList.contains('show') && (video.seeking || video.readyState < video.HAVE_FUTURE_DATA)){ // HAVE_FUTURE_DATA means enough data for current and some future frames
                    toggleLoading(true,`Buffering... ${Math.min(100,Math.round(percentBuffered))}%`);
                }
            } catch(e){ /* ignore error during buffering calculation, e.g. if buffer becomes empty */ }
        }
    });
    video.addEventListener('error', ()=>{
        toggleLoading(false);
        const err = video.error;
        let errMsg = 'An unknown media error occurred.';
        if (err) { // Provide more specific error messages
            errMsg = `Error Code ${err.code}: `;
            switch (err.code) {
                case MediaError.MEDIA_ERR_ABORTED: errMsg += 'Playback aborted by user or script.'; break;
                case MediaError.MEDIA_ERR_NETWORK: errMsg += 'A network error occurred while fetching media.'; break;
                case MediaError.MEDIA_ERR_DECODE: errMsg += 'Media decoding error. The format may be unsupported or corrupted.'; break;
                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: errMsg += 'Media source not supported or could not be found.'; break;
                default: errMsg += (err.message || 'Unknown media error detail.'); break;
            }
        }
        showError(errMsg);
        if(hls){hls.destroy();hls=null;} // Clean up HLS on error
        if(qualityBtn)qualityBtn.style.display='none'; // Hide quality selection if media fails
    });
    video.addEventListener('enterpictureinpicture', ()=>{updatePipButtonUI();showNotifier('Entered Picture-in-Picture');});
    video.addEventListener('leavepictureinpicture', ()=>{updatePipButtonUI();showNotifier('Exited Picture-in-Picture');});
  }

  // --- Document & Global Event Listeners ---
  ['fullscreenchange','webkitfullscreenchange','mozfullscreenchange','MSFullscreenChange'].forEach(evt => 
    document.addEventListener(evt,()=>{
        const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        updateFullscreenUI(); // Update button icon and player class
        showControlsAndCursor(); // Always manage controls visibility on FS change
        if(!isFs && playerContainer) playerContainer.classList.remove('cursor-hidden'); // Ensure cursor is visible when exiting FS
        // Notifier for fullscreen change can be added if desired, e.g.:
        // showNotifier(isFs?'Fullscreen Enabled':'Fullscreen Disabled');
    })
  );
  
  document.addEventListener('click',(e)=>{ 
    const target = e.target;
    // Close speed/quality menus if click is outside the menu and its button
    if (activeMenu && !activeMenu.contains(target)) {
        const controllingButton = document.querySelector(`[aria-controls="${activeMenu.id}"]`);
        // Check if click is also outside the button that controls this menu
        if (controllingButton && !controllingButton.contains(target)) {
            const stateKey = activeMenu === speedMenu ? 'isSpeedMenuOpen' : 'isQualityMenuOpen';
            toggleMenu(activeMenu, controllingButton, stateKey);
        }
    }
    // Close volume slider if click is outside slider, its button, and not on the button itself
    if (volumeSliderWrapper?.classList.contains('active') && 
        !volumeSliderWrapper.contains(target) && 
        target !== volumeBtn && !volumeBtn?.contains(target)) {
        volumeSliderWrapper.classList.remove('active'); 
        if (volumeBtn) volumeBtn.setAttribute('aria-expanded', 'false');
        if (document.fullscreenElement || document.webkitFullscreenElement) { // If in fullscreen
            showControlsAndCursor(); // Restart controls hide timer
        }
    }
  });

  document.addEventListener('keydown',(e)=>{
    // Only handle keydown if focus is somewhat within the player or on body (global shortcuts)
    // or specifically on the custom URL input for its own Escape/Enter handling.
    const isPlayerFocused = playerContainer && playerContainer.contains(document.activeElement);
    const isBodyFocused = document.activeElement === document.body;
    const isCustomUrlInputFocused = document.activeElement === customUrlInput;

    if (!video || (!isPlayerFocused && !isBodyFocused && !isCustomUrlInputFocused)) {
        // Allow Esc to exit fullscreen even if focus is outside player
        if(e.key === 'Escape' && (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)){
             // Let browser handle fullscreen exit or toggleFullscreen will do it
        } else {
            return; // Don't interfere with other page element keydowns
        }
    }

    const activeEl = document.activeElement;
    // If focus is on an input field (except our custom URL input, which has specific handling), let it type.
    const isGenericInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
    if(isGenericInputFocused && activeEl !== customUrlInput && e.key !== 'Escape') return;
    // For custom URL input, only handle Enter and Escape here, let other keys type.
    if(activeEl === customUrlInput && e.key !== 'Escape' && e.key !== 'Enter') return;

    let preventDefault = true; // Assume we'll handle the key, unless specified otherwise
    let notifyMsg = '';

    switch(e.key.toLowerCase()){ // Use toLowerCase for case-insensitivity
      case' ': case'k': 
        if(activeEl && activeEl.tagName === 'BUTTON') { preventDefault = false; break; } // Allow space to activate focused button
        togglePlayPause(); 
        break;
      case'f': 
        if(fullscreenBtn) fullscreenBtn.click(); else preventDefault = false;
        break;
      case'm': 
        toggleMute(); 
        break;
      case'arrowleft': 
        if(activeEl === seekbar || activeEl === volumeRangeSlider) { preventDefault = false; break; } // Allow native slider interaction
        if(!video.duration||!isFinite(video.duration)||video.duration <= 0){preventDefault=false;break;}
        video.currentTime=Math.max(0,video.currentTime-5); // Seek back 5s
        notifyMsg=`Seek Back: ${formatTime(video.currentTime)}`;
        updateSeekbar(); // Update UI immediately
        break;
      case'arrowright': 
        if(activeEl === seekbar || activeEl === volumeRangeSlider) { preventDefault = false; break; }
        if(!video.duration||!isFinite(video.duration)||video.duration <= 0){preventDefault=false;break;}
        video.currentTime=Math.min(video.duration,video.currentTime+5); // Seek forward 5s
        notifyMsg=`Seek Fwd: ${formatTime(video.currentTime)}`;
        updateSeekbar(); // Update UI immediately
        break;
      case'arrowup': 
        if(activeEl === volumeRangeSlider || (activeEl?.closest && activeEl.closest('#volumeSliderWrapper'))) { preventDefault = false; break; }
        video.volume=Math.min(1,video.volume+0.05); // Increase volume
        if(video.muted && video.volume > 0.01) video.muted=false; // Unmute if increasing volume
        notifyMsg=`Volume: ${Math.round(video.volume*100)}%`;
        // updateVolumeUI() will be called by 'volumechange' event
        break;
      case'arrowdown': 
        if(activeEl === volumeRangeSlider || (activeEl?.closest && activeEl.closest('#volumeSliderWrapper'))) { preventDefault = false; break; }
        video.volume=Math.max(0,video.volume-0.05); // Decrease volume
        if(video.volume < 0.02 && !video.muted && video.volume > 0) { /* do nothing, let it go to 0 then mute */ }
        else if (video.volume < 0.01 && !video.muted) video.muted=true; // Auto-mute if volume is very low
        notifyMsg=video.muted?'Muted':`Volume: ${Math.round(video.volume*100)}%`;
        // updateVolumeUI() will be called by 'volumechange' event
        break;
      case'escape':
        if(activeEl === customUrlInput) { customUrlInput.blur(); preventDefault = true; break;} // Blur input on Esc
        if(activeMenu){ // Close open menu (speed/quality)
            const btnForMenu = document.querySelector(`[aria-controls="${activeMenu.id}"]`);
            const stateKey = activeMenu === speedMenu ? 'isSpeedMenuOpen' : 'isQualityMenuOpen';
            if(btnForMenu) toggleMenu(activeMenu, btnForMenu, stateKey);
        } else if(volumeSliderWrapper?.classList.contains('active')){ // Close volume slider
            volumeSliderWrapper.classList.remove('active');
            if(volumeBtn) volumeBtn.setAttribute('aria-expanded','false');
        } else if(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) { // Exit fullscreen
            toggleFullscreen();
        } else {
            preventDefault = false; // Don't prevent default if nothing to close/exit
        }
        break;
      case'p':
        if(document.pictureInPictureEnabled && pipBtn && pipBtn.style.display!=='none') togglePip();
        else preventDefault = false;
        break;
      case'l':
        toggleLoop();
        break;
      default:
        if(e.key >= '0' && e.key <= '9'){ // Number keys for seeking (0-90%)
            if(activeEl === seekbar || isGenericInputFocused) { preventDefault = false; break; } 
            if(!video.duration||!isFinite(video.duration)||video.duration <= 0){preventDefault=false;break;}
            const percent = parseInt(e.key)*10;
            video.currentTime=(percent/100)*video.duration;
            notifyMsg=`Seek to ${percent}%`;
            updateSeekbar();
        } else {
            preventDefault = false; // Don't prevent other unhandled keys
        }
    }

    if(preventDefault) {
        e.preventDefault();
        showControlsAndCursor(); // Show controls on any handled interaction
    }
    if(notifyMsg) showNotifier(notifyMsg);
  });
  
  loadCustomUrlBtn?.addEventListener('click',()=>{
    const url = customUrlInput?.value.trim();
    if(url){
        showNotifier(`Loading: ${url.substring(0,37)+(url.length>40?'...':'')}`); // Show truncated URL
        videoSrc=url; // Update global videoSrc
        loadMedia(); // Load the new media
        if(customUrlInput) customUrlInput.value=''; // Clear input field
    } else {
        showNotifier("Please enter a valid URL.");
    }
  });
  customUrlInput?.addEventListener('keypress',(e)=>{
    if(e.key==='Enter' && loadCustomUrlBtn) {
        e.preventDefault(); // Prevent form submission if it's in a form
        loadCustomUrlBtn.click();
    }
  });


  // --- Initialisation ---
  function setAccentColorRGB(){
    if (!document.documentElement) return;
    const s = getComputedStyle(document.documentElement);
    const c = s.getPropertyValue('--primary-accent').trim();
    let rgbValues = '';

    if (c.startsWith('#')) {
        const h = c.substring(1).toLowerCase(); // Normalize to lowercase
        if (h.length === 3) { // Handle shorthand hex like #rgb -> #rrggbb
            const r = parseInt(h[0] + h[0], 16);
            const g = parseInt(h[1] + h[1], 16);
            const b = parseInt(h[2] + h[2], 16);
            if(!isNaN(r) && !isNaN(g) && !isNaN(b)) rgbValues = `${r},${g},${b}`;
        } else if (h.length === 6) { // Handle standard hex #rrggbb
            const r = parseInt(h.substring(0, 2), 16);
            const g = parseInt(h.substring(2, 4), 16);
            const b = parseInt(h.substring(4, 6), 16);
            if(!isNaN(r) && !isNaN(g) && !isNaN(b)) rgbValues = `${r},${g},${b}`;
        }
    } else if (c.startsWith('rgb')) { // Handles rgb(r, g, b) and rgba(r, g, b, a)
        const p = c.match(/\d+/g); // Extract numbers
        if (p && p.length >= 3) { // Need at least R, G, B
            rgbValues = `${p[0]},${p[1]},${p[2]}`;
        }
    }
    if (rgbValues) {
        document.documentElement.style.setProperty('--primary-accent-rgb', rgbValues);
    } else {
        console.warn("Could not parse --primary-accent color for RGB conversion:", c);
        // Optionally set a default fallback if parsing fails and accent-rgb is critical
        // document.documentElement.style.setProperty('--primary-accent-rgb', '0,123,255'); 
    }
  }
  
  function initPlayer() {
    if (!video) { console.error("Video player element (#video) not found. Aborting initialization."); return; }
    
    setAccentColorRGB(); // Set CSS variable for ripple/glow effects that use RGB
    video.volume = lastVolume; // Set initial volume from stored state (or default)
    
    // Initial UI updates to set ARIA states, icons, and tooltips correctly
    updatePlayPauseUI(); 
    updateFullscreenUI(); 
    updateVolumeUI(); // This will also set the slider position based on `lastVolume`
    updatePipButtonUI(); 
    updateLoopToggleUI(); 
    updateSpeedIndicator();

    if (speedMenu) { // Set initial "selected" state in the speed menu
        speedMenu.querySelectorAll('.menu-item').forEach(el => {el.classList.remove('selected'); el.setAttribute('aria-checked', 'false');});
        const defaultSpeedItem = speedMenu.querySelector('.menu-item[data-speed="1"]'); // "1x" speed
        if (defaultSpeedItem) { defaultSpeedItem.classList.add('selected'); defaultSpeedItem.setAttribute('aria-checked', 'true');}
    }
    
    // Load the default or specified media source
    loadMedia(); 
    
    // Initially show controls; they might hide based on interaction or fullscreen state
    showControlsAndCursor(); 
  }

  // Initialize player when the DOM is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayer);
  } else {
    initPlayer(); // DOM is already loaded, initialize immediately
  }

})();
