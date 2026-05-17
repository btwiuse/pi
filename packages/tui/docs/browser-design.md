# Browser Rendering Design for `@earendil-works/pi-tui`

## Summary

This document explains the browser support that was added for `@earendil-works/pi-tui`, why it was needed, how to use the new browser entry point, and how to port an existing CLI TUI app to run in the browser.

## Problem

`@earendil-works/pi-tui` was originally optimized for Node/CLI usage and relied on runtime access patterns that are unsafe or unavailable in browsers (for example, Node-specific process behavior and Node-only terminal implementations).

That made it difficult to:

1. Import TUI primitives in browser bundles safely.
2. Reuse existing component/render logic in a browser terminal emulator such as `@xterm/xterm`.
3. Build demos and app experiences that share TUI code between CLI and web.

## What Changed

### 1) Added a browser-specific package entry

A new subpath export was added:

- Package export: `@earendil-works/pi-tui/browser`
- Source: `/home/runner/work/pi/pi/packages/tui/src/browser.ts`

This entry exports a focused browser-safe API surface:

- `TUI`, `Container`, `Component`, `Focusable`, `CURSOR_MARKER`, `visibleWidth`
- `Text`, `Input`, `Spacer`
- `Terminal` type

### 2) Split terminal contract from Node terminal implementation

The shared terminal interface moved to:

- `/home/runner/work/pi/pi/packages/tui/src/terminal-interface.ts`

This allows both:

- `ProcessTerminal` (Node/CLI, in `terminal.ts`)
- Browser adapters (for xterm or other emulators)

to implement the same `Terminal` contract without importing Node-only terminal code.

### 3) Added runtime helpers for browser-safe scheduling/env access

A new runtime shim was added:

- `/home/runner/work/pi/pi/packages/tui/src/runtime.ts`

It centralizes:

- `getEnv()` (safe env lookup when `process` may not exist)
- `nextTick()` (uses `process.nextTick` if available, otherwise `queueMicrotask`)
- `now()` (uses `performance.now` when available, fallback to relative wall-clock time)

`tui.ts`, `keys.ts`, and `terminal-image.ts` were updated to use these helpers, reducing direct dependency on Node globals in browser-imported paths.

### 4) Updated package exports

`/home/runner/work/pi/pi/packages/tui/package.json` now exposes:

- `.` (existing default entry)
- `./browser` (new browser entry with JS + types)

### 5) Added browser demo and smoke coverage

A dedicated demo was added under web-ui example:

- `/home/runner/work/pi/pi/packages/web-ui/example/tui.html`
- `/home/runner/work/pi/pi/packages/web-ui/example/src/tui-demo.ts`
- `/home/runner/work/pi/pi/packages/web-ui/example/src/tui-demo.css`

It mounts `@xterm/xterm`, provides a `BrowserXtermTerminal` adapter implementing `Terminal`, and runs a small interactive TUI app.

Browser smoke coverage was also updated to import `@earendil-works/pi-tui/browser`:

- `/home/runner/work/pi/pi/scripts/browser-smoke-entry.ts`

## Why This Was Necessary

The browser entry point solves a practical boundary issue:

- CLI terminal implementation and browser terminal implementation have different runtime constraints.
- The TUI rendering engine and component model should remain reusable across both.

By separating the interface and adding a browser-safe entry, the package can now be consumed in browser bundles without accidentally pulling in Node-only assumptions, while preserving the existing CLI API.

## How to Use `@earendil-works/pi-tui/browser`

### 1) Install dependencies

In a browser app package (example shown in this repository), include:

- `@earendil-works/pi-tui`
- `@xterm/xterm`

### 2) Import browser entry and xterm

```ts
import { Input, Text, TUI, type Terminal } from "@earendil-works/pi-tui/browser";
import { Terminal as XtermTerminal } from "@xterm/xterm";
```

### 3) Implement a browser terminal adapter

Create a class that implements the `Terminal` interface and maps methods/events to xterm:

- Forward keyboard data (`xterm.onData`) to `onInput`
- Forward resize (`xterm.onResize`) to `onResize`
- Implement writes using `xterm.write(...)`
- Implement cursor/control escape forwarding as needed

### 4) Create and run your TUI

```ts
const xterm = new XtermTerminal({ cols: 80, rows: 24 });
xterm.open(document.getElementById("terminal")!);

const terminal = new BrowserXtermTerminal(xterm);
const tui = new TUI(terminal);

const input = new Input();
input.onSubmit = (value) => {
  // update components/state
};

tui.addChild(new Text("Hello browser TUI"));
tui.addChild(input);
tui.setFocus(input);
tui.start();
```

## Porting Guide: Existing CLI TUI -> Browser

Use this checklist to port an existing app that currently uses `ProcessTerminal`.

### Step 1: Keep component logic unchanged

Do not rewrite your component tree unless needed. `TUI`, `Text`, `Input`, container/focus behavior, and render semantics remain the same.

### Step 2: Replace terminal construction

Before (CLI):

- `const terminal = new ProcessTerminal();`

After (browser):

- `const xterm = new XtermTerminal(...)`
- `const terminal = new BrowserXtermTerminal(xterm);`

### Step 3: Replace CLI process lifecycle hooks

Remove or adapt Node-specific behavior, such as:

- `process.exit(...)`
- direct stdin/stdout assumptions
- OS signal handling

Use browser lifecycle instead (UI buttons, route changes, unmount cleanup, etc.).

### Step 4: Re-map keyboard/resize through the adapter

Ensure your adapter forwards xterm events exactly once and cleans up listeners on stop/unmount.

### Step 5: Handle browser focus intentionally

Call `xterm.focus()` where appropriate so keyboard input reaches the TUI.

### Step 6: Validate rendering assumptions

If your CLI app relies on terminal capabilities (images, environment heuristics, or specific key protocol behaviors), verify browser behavior and adjust where needed. Browser terminal emulators may not support every escape/protocol path exactly like native terminals.

## Compatibility Notes

- Existing CLI consumers using `@earendil-works/pi-tui` are preserved.
- Browser consumers should prefer `@earendil-works/pi-tui/browser`.
- `ProcessTerminal` remains the Node/CLI implementation and is not required in browser apps.

## Reference Files

- `/home/runner/work/pi/pi/packages/tui/src/browser.ts`
- `/home/runner/work/pi/pi/packages/tui/src/runtime.ts`
- `/home/runner/work/pi/pi/packages/tui/src/terminal-interface.ts`
- `/home/runner/work/pi/pi/packages/tui/src/tui.ts`
- `/home/runner/work/pi/pi/packages/web-ui/example/src/tui-demo.ts`
- `/home/runner/work/pi/pi/packages/web-ui/example/tui.html`
