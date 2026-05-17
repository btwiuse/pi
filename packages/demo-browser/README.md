# Pi TUI Browser Demo

A browser demo showcasing the `@earendil-works/pi-tui` library running in the browser using [xterm.js](https://xtermjs.org/).

## Overview

This demo demonstrates how to use the pi-tui library in a browser environment by implementing a custom `Terminal` adapter that wraps xterm.js. The TUI library, originally designed for Node.js terminal applications, can run in the browser with the proper adapter implementation.

## Features

- **XtermTerminal Adapter**: A complete implementation of the `Terminal` interface that bridges pi-tui with xterm.js
- **Interactive Demo Component**: A simple component demonstrating:
  - Keyboard input handling
  - ANSI color sequences
  - Differential rendering
  - Dynamic terminal resizing
- **Node.js Polyfills**: Uses `vite-plugin-node-polyfills` to handle Node.js built-in modules (`fs`, `os`, `path`, `perf_hooks`)

## Architecture

```
packages/demo-browser/
├── index.html              # Entry HTML page
├── src/
│   ├── main.ts            # Application entry point
│   ├── xterm-terminal.ts  # Terminal adapter implementation
│   └── demo-component.ts  # Simple interactive demo component
├── package.json
├── vite.config.ts         # Vite configuration with polyfills
└── tsconfig.json
```

## XtermTerminal Adapter

The `XtermTerminal` class implements the `Terminal` interface from `@earendil-works/pi-tui`:

### Key Mappings

- `write(data)` → `xterm.write(data)` - ANSI escape sequences are natively parsed by xterm.js
- `start(onInput, onResize)` → Sets up `xterm.onData()` and `xterm.onResize()` handlers
- `columns` / `rows` → `xterm.cols` / `xterm.rows`
- `hideCursor()` → Writes `\x1b[?25l`
- `showCursor()` → Writes `\x1b[?25h`
- `clearLine()` → Writes `\x1b[K`
- `clearFromCursor()` → Writes `\x1b[J`
- `clearScreen()` → Writes `\x1b[2J\x1b[H`
- `moveBy(lines)` → Writes `\x1b[{n}A` (up) or `\x1b[{n}B` (down)
- `setTitle(title)` → Writes `\x1b]0;${title}\x07`
- `kittyProtocolActive` → Returns `false` (browser terminals don't support Kitty protocol)
- `drainInput()` → No-op (returns resolved promise)
- `stop()` → Disposes xterm event listeners

## Getting Started

### Installation

From the repository root:

```bash
npm install
```

### Development

Run the dev server:

```bash
cd packages/demo-browser
npm run dev
```

Then open your browser to the URL shown (typically `http://localhost:5173`).

### Build

Build for production:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview

Preview the production build:

```bash
npm run preview
```

## Usage Example

```typescript
import { Terminal as XtermInstance } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { TUI } from "@earendil-works/pi-tui";
import { XtermTerminal } from "./xterm-terminal";

// Create xterm.js instance
const xterm = new XtermInstance({
  cols: 80,
  rows: 30,
  cursorBlink: true,
});

// Mount to DOM
xterm.open(document.getElementById("terminal")!);

// Create adapter
const terminal = new XtermTerminal(xterm);

// Create TUI
const tui = new TUI(terminal);

// Add your components
tui.addChild(myComponent);
tui.setFocus(myComponent);

// Start
tui.start();
```

## Creating Custom Components

Components must implement the `Component` interface:

```typescript
import type { Component } from "@earendil-works/pi-tui";

class MyComponent implements Component {
  render(width: number): string[] {
    return [
      "Line 1 with \x1b[32mcolor\x1b[0m",
      "Line 2",
    ];
  }

  handleInput(data: string): void {
    // Handle keyboard input
  }

  invalidate(): void {
    // Clear any cached rendering state
  }
}
```

## Node.js Polyfills

The TUI library uses some Node.js built-in modules. These are polyfilled using `vite-plugin-node-polyfills`:

- `node:fs` - File system operations (mostly no-ops in browser)
- `node:os` - OS information
- `node:path` - Path manipulation
- `node:perf_hooks` - Performance monitoring
- `process.nextTick` - Polyfilled as `queueMicrotask`

## Limitations

Some features that work in Node.js terminals are not available in the browser:

- **Kitty Keyboard Protocol**: Not supported by browser terminals
- **Terminal Progress Indicator (OSC 9;4)**: Browser-specific
- **Raw Mode**: Not applicable in browser context
- **Image Support**: Limited to what xterm.js supports

## Dependencies

- `@earendil-works/pi-tui` - The TUI library (workspace dependency)
- `@xterm/xterm` - Terminal emulator for the browser
- `vite` - Build tool and dev server
- `vite-plugin-node-polyfills` - Node.js polyfills for browser

## License

MIT
