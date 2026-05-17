import type { Component } from "@earendil-works/pi-tui";
import { matchesKey } from "@earendil-works/pi-tui";

/**
 * Simple demo component that displays text and counts keypresses
 */
export class DemoComponent implements Component {
	private keyCount = 0;
	private lastKey = "none";

	render(width: number): string[] {
		const lines: string[] = [];

		// Title
		lines.push("\x1b[1;36m╔═══════════════════════════════════════╗\x1b[0m");
		lines.push("\x1b[1;36m║\x1b[0m  \x1b[1;33mPi TUI Browser Demo with xterm.js\x1b[0m  \x1b[1;36m║\x1b[0m");
		lines.push("\x1b[1;36m╚═══════════════════════════════════════╝\x1b[0m");
		lines.push("");

		// Info section
		lines.push("\x1b[1mTerminal Information:\x1b[0m");
		lines.push(`  Width:  ${width} columns`);
		lines.push(`  Height: (determined by xterm.js)`);
		lines.push("");

		// Key press counter
		lines.push("\x1b[1mInteractive Demo:\x1b[0m");
		lines.push(`  Keys pressed: \x1b[32m${this.keyCount}\x1b[0m`);
		lines.push(`  Last key:     \x1b[33m${this.lastKey}\x1b[0m`);
		lines.push("");

		// Instructions
		lines.push("\x1b[1mInstructions:\x1b[0m");
		lines.push("  • Press any key to increment counter");
		lines.push("  • Press \x1b[36mCtrl+C\x1b[0m to exit");
		lines.push("  • Terminal width adjusts dynamically");
		lines.push("");

		// Demo features
		lines.push("\x1b[1mTUI Features Demonstrated:\x1b[0m");
		lines.push("  ✓ ANSI color sequences");
		lines.push("  ✓ Keyboard input handling");
		lines.push("  ✓ Differential rendering");
		lines.push("  ✓ Dynamic terminal resizing");
		lines.push("");

		// Footer
		lines.push("\x1b[2m─────────────────────────────────────────\x1b[0m");
		lines.push("\x1b[2mPowered by @earendil-works/pi-tui\x1b[0m");

		return lines;
	}

	handleInput(data: string): void {
		// Handle Ctrl+C
		if (matchesKey(data, "ctrl+c")) {
			// In a real app, you might want to exit gracefully
			// For this demo, we'll just show the key press
			this.lastKey = "Ctrl+C (exit signal)";
		} else if (matchesKey(data, "enter")) {
			this.lastKey = "Enter";
		} else if (matchesKey(data, "escape")) {
			this.lastKey = "Escape";
		} else if (matchesKey(data, "backspace")) {
			this.lastKey = "Backspace";
		} else if (matchesKey(data, "tab")) {
			this.lastKey = "Tab";
		} else if (data.length === 1 && data.charCodeAt(0) >= 32 && data.charCodeAt(0) <= 126) {
			// Printable ASCII character
			this.lastKey = `'${data}'`;
		} else {
			// Show escape sequence for special keys
			this.lastKey = JSON.stringify(data);
		}

		this.keyCount++;
	}

	invalidate(): void {
		// No cached state to invalidate
	}
}
