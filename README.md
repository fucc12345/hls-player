# Enhanced Video Player (HLS & MP4) 🎬

A modern, feature-rich HTML5 video player with support for HLS (HTTP Live Streaming) and standard MP4 video formats. Built with vanilla JavaScript and CSS, this player offers a clean interface, responsive design, and a range of user-friendly controls.

## ✨ Features

*   **Universal Playback:**
    *   Supports HLS (.m3u8) streams via HLS.js.
    *   Supports standard MP4, WebM, and OGV video files.
    *   Fallback to native HLS playback on supported browsers (e.g., Safari).
    *   Graceful handling of unknown URL types by attempting HLS.js first, then direct source.
*   **Comprehensive Controls:**
    *   Play/Pause
    *   Fullscreen toggle
    *   Volume control (slider accessible via options menu, visual feedback)
    *   Seekbar with progress display
    *   Current time and total duration display
    *   Playback speed adjustment (0.5x, 1x, 1.5x, 2x)
    *   Video quality selection for HLS streams (Auto + available levels)
    *   "More Options" menu for advanced settings.
*   **User Experience (UX):**
    *   **Responsive Design:** Adapts to various screen sizes.
    *   **Keyboard Shortcuts:** Intuitive controls for common actions (see below).
    *   **Custom URL Loader:** Easily load videos from external URLs.
    *   **Notifications:** On-screen feedback for actions like play, pause, volume change, seek, etc.
    *   **Loading Indicator:** Spinner displayed while video is buffering.
    *   **Error Handling:** Displays user-friendly error messages for playback or network issues.
    *   **Auto-hiding Controls:** Controls and cursor hide automatically in fullscreen during inactivity.
    *   **Ripple Effect:** Material-style ripple effect on button clicks.
    *   **ARIA Accessibility:** Includes `aria-label`, `aria-haspopup`, etc., for better accessibility.
*   **Modern Styling:**
    *   Sleek dark theme with neon green accents.
    *   Custom-styled range inputs for seekbar and volume.
    *   SVG icons for controls.

## 🚀 How to Use

1.  **Try it Online:** You can test the player live at: [https://hls-player-teal.vercel.app/](https://hls-player-teal.vercel.app/)
2.  **Local Setup:**
    *   **Clone the repository or download the HTML file.**
    *   **Open `index.html` (or your file name) in a modern web browser.**
        *   A default HLS stream (`https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`) will attempt to load.
3.  **Load a Custom Video (in either online or local version):**
    *   Find the "Enter HLS (.m3u8) or MP4 URL" input field below the player.
    *   Paste your video URL (e.g., `your-video.mp4` or `your-stream.m3u8`).
    *   Click the "Load Video" button.

## ⌨️ Keyboard Shortcuts

| Key          | Action                             |
| :----------- | :--------------------------------- |
| `Space` / `K`| Play / Pause                       |
| `F`          | Toggle Fullscreen                  |
| `M`          | Toggle Mute                        |
| `←` (Left Arrow) | Seek Backward 5 seconds          |
| `→` (Right Arrow)| Seek Forward 5 seconds           |
| `↑` (Up Arrow)   | Increase Volume                  |
| `↓` (Down Arrow) | Decrease Volume                  |
| `Esc`        | Exit Fullscreen / Close Options Menu |

*Note: Keyboard shortcuts are disabled when focus is on an input field (except for `Esc`, `F`, `F11`).*

## 🛠️ Tech Stack

*   **HTML5:** Structure and `<video>` element.
*   **CSS3:** Styling, responsiveness, animations (Flexbox, custom properties, transitions).
*   **Vanilla JavaScript (ES6+):** Player logic, DOM manipulation, event handling.
*   **HLS.js:** JavaScript library for HLS playback (included via CDN).

## 🧩 Key HTML Elements & Structure

*   `.player-container`: Main wrapper for the video and controls.
    *   `video#video`: The HTML5 video element.
    *   `.loading-overlay#loadingOverlay`: Shows a spinner during loading.
    *   `.error-overlay#errorOverlay`: Displays error messages.
    *   `.controls`: Container for all player control buttons and inputs.
        *   `#playPauseBtn`: Play/Pause button.
        *   `#fullscreenBtn`: Fullscreen button.
        *   `.progress-container`: Contains time displays and seekbar.
            *   `#currentTime`, `#duration`: Time displays.
            *   `#seekbar`: Video progress/seek slider.
        *   `.more-options-container`:
            *   `#moreOptionsBtn`: Opens the options menu.
            *   `#optionsMenu`: Popup menu for Volume, Speed, Quality.
                *   `#volumeOption` & `#volumeSliderPopup`: Volume control.
                *   `#speedOption` & `#speedSubmenu`: Playback speed selection.
                *   `#qualityOption` & `#qualitySubmenu`: HLS quality selection.
*   `.custom-url-loader`: Section for inputting and loading custom video URLs.
    *   `#customUrlInput`: Text input for URL.
    *   `#loadCustomUrlBtn`: Button to trigger loading.
*   `#notifier`: Displays temporary on-screen messages.

## 📄 Dependencies

*   **HLS.js:** Fetched from `https://cdn.jsdelivr.net/npm/hls.js@latest`. Required for HLS stream playback on browsers that don't natively support it.

## 💡 Possible Future Enhancements

*   Picture-in-Picture (PiP) mode.
*   Chromecast/AirPlay support.
*   Subtitle/Caption support.
*   Thumbnail previews on seekbar hover.
*   Remembering user preferences (volume, speed) using LocalStorage.
*   More advanced HLS error recovery strategies.

## 📝 License

This project is open source. Feel free to use it as a reference or base for your own projects.
Consider adding a specific license like MIT if you intend to share it widely:


MIT License
Copyright (c) [2025] [Bhargav]
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
