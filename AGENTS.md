# ♟ EinkChess - Core Guidelines

This project (`eink-chess`) is a web-based chess game specifically designed for E-ink devices (like Amazon Kindle).
Whenever you work on this project, you MUST strictly adhere to the following rules.

## 1. ❓ Clarification & Questions (Ask Clarifying Questions First - CRITICAL)
- When receiving a request, identify potential blind spots — ambiguous requirements, edge cases, or design decisions whose answers would change the implementation approach.
- Ask these questions before writing code.

## 2. 🚫 NO Animations & 🚫 NO Effects
- Do NOT use CSS transitions, `keyframes`, `box-shadow` (for blur), `opacity` animations, or gradients.
- E-ink screens suffer from severe ghosting and slow refresh rates. Animations cause the screen to flash constantly.
- Use solid colors and thick borders (e.g. `outline: 3px solid #000; outline-offset: -3px;`) for selected states.

## 3. ⚡ Cache Busting (CRITICAL)
- E-ink devices cache static assets (CSS, JS) very aggressively and it is difficult for users to clear the cache.
- Whenever you modify a CSS or JS file, you MUST go to the corresponding HTML file(s) and update the version query parameter (e.g., `<script src="js/app.js?v=1.0.2"></script>`). Use a timestamp or increment the version number.

## 4. 💾 ES5 Javascript & Old WebKit Constraints
- Kindle Experimental Browser is based on an old WebKit engine.
- Write **ES5 compliant** JavaScript.
- Do NOT use `const`, `let`, arrow functions `() => {}`, template literals, classes, or `async`/`await`.
- Do NOT use WebAssembly (WASM) or Web Workers.
- Do NOT use modern CSS like `clamp()`, `aspect-ratio`, or Flexbox `gap`. Use fallbacks.

## 5. 👆 Touch Targets & Interaction
- Ensure all interactive elements (buttons, squares) are large enough (minimum 44x44px) to easily tap on an e-reader screen.
- Remove tap highlights (`-webkit-tap-highlight-color: transparent`) to prevent extra screen flashes.
- For DOM updates, use Incremental DOM patching (only update the elements that actually changed) to trigger fast partial refreshes instead of full page redraws.

## 6. 🎨 High Contrast Monochrome
- Stick to Black, White, and high-contrast Gray colors.
- Do not use pitch black for dark squares to ensure black pieces remain visible. Use `#888888` or `#2a2a2a`.

## 7. 📝 Sync Requirements (CRITICAL)
- Whenever you add a new feature, modify logic, or change the architecture, you MUST automatically update the `requirements_einkchess.md` file to keep it in sync with the codebase.
- The `requirements_einkchess.md` is the single source of truth for the project's specification.

## 8. 🔒 Git Operations (Do NOT Commit or Push)
- The human developer handles all git operations (`commit`, `push`, `tag`, `release`).
- The agent may stage changes or suggest commit messages, but MUST NOT run `git commit` or `git push`.

## 9. 🧪 Testing & Execution (Do NOT Run Tests Without Confirmation)
- The agent may update or propose test plans, but MUST ask for confirmation before executing any test commands (build, lint, manual test steps, automated test suites).

## 10. 💬 Comment Preservation
- Preserve existing comments.
- Do NOT remove comments explaining complex logic — especially stack-based algorithms.

By following these rules, we ensure a smooth, flash-free, and functional experience on all Kindle and E-ink devices.
