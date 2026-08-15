# ♟ EinkChess - Core Guidelines

This project (`eink-chess`) is a web-based chess game specifically designed for E-ink devices (like Amazon Kindle).
Whenever you work on this project, you MUST strictly adhere to the following rules.

## 1. 🚫 NO Animations & 🚫 NO Effects
- Do NOT use CSS transitions, `keyframes`, `box-shadow` (for blur), `opacity` animations, or gradients.
- E-ink screens suffer from severe ghosting and slow refresh rates. Animations cause the screen to flash constantly.
- Use solid colors and thick borders (e.g. `outline: 3px solid #000; outline-offset: -3px;`) for selected states.

## 2. ⚡ Cache Busting (CRITICAL)
- E-ink devices cache static assets (CSS, JS) very aggressively and it is difficult for users to clear the cache.
- Whenever you modify a CSS or JS file, you MUST go to the corresponding HTML file(s) and update the version query parameter (e.g., `<script src="js/app.js?v=1.0.2"></script>`). Use a timestamp or increment the version number.

## 3. 💾 ES5 Javascript & Old WebKit Constraints
- Kindle Experimental Browser is based on an old WebKit engine.
- Write **ES5 compliant** JavaScript.
- Do NOT use `const`, `let`, arrow functions `() => {}`, template literals, classes, or `async`/`await`.
- Do NOT use WebAssembly (WASM) or Web Workers.
- Do NOT use modern CSS like `clamp()`, `aspect-ratio`, or Flexbox `gap`. Use fallbacks.

## 4. 👆 Touch Targets & Interaction
- Ensure all interactive elements (buttons, squares) are large enough (minimum 44x44px) to easily tap on an e-reader screen.
- Remove tap highlights (`-webkit-tap-highlight-color: transparent`) to prevent extra screen flashes.
- For DOM updates, use Incremental DOM patching (only update the elements that actually changed) to trigger fast partial refreshes instead of full page redraws.

## 5. 🎨 High Contrast Monochrome
- Stick to Black, White, and high-contrast Gray colors.
- Do not use pitch black for dark squares to ensure black pieces remain visible. Use `#888888` or `#2a2a2a`.

## 6. 📝 Sync Requirements (CRITICAL)
- Whenever you add a new feature, modify logic, or change the architecture, you MUST automatically update the `requirements_einkchess.md` file to keep it in sync with the codebase.
- The `requirements_einkchess.md` is the single source of truth for the project's specification.

By following these rules, we ensure a smooth, flash-free, and functional experience on all Kindle and E-ink devices.
