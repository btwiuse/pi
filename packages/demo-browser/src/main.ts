import { Terminal as XtermInstance } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { TUI } from "@earendil-works/pi-tui";
import { XtermTerminal } from "./xterm-terminal";
import { DemoComponent } from "./demo-component";

// Create xterm.js instance
const xterm = new XtermInstance({
	cols: 80,
	rows: 30,
	cursorBlink: true,
	theme: {
		background: "#1e1e1e",
		foreground: "#d4d4d4",
		cursor: "#ffffff",
		cursorAccent: "#1e1e1e",
		selectionBackground: "#264f78",
		black: "#000000",
		red: "#cd3131",
		green: "#0dbc79",
		yellow: "#e5e510",
		blue: "#2472c8",
		magenta: "#bc3fbc",
		cyan: "#11a8cd",
		white: "#e5e5e5",
		brightBlack: "#666666",
		brightRed: "#f14c4c",
		brightGreen: "#23d18b",
		brightYellow: "#f5f543",
		brightBlue: "#3b8eea",
		brightMagenta: "#d670d6",
		brightCyan: "#29b8db",
		brightWhite: "#ffffff",
	},
});

// Mount xterm to the DOM
const terminalElement = document.getElementById("terminal");
if (!terminalElement) {
	throw new Error("Terminal element not found");
}
xterm.open(terminalElement);

// Create the adapter
const terminal = new XtermTerminal(xterm);

// Create TUI instance
const tui = new TUI(terminal);

// Create and add demo component
const demoComponent = new DemoComponent();
tui.addChild(demoComponent);
tui.setFocus(demoComponent);

// Start the TUI
tui.start();

// Handle window resize
window.addEventListener("resize", () => {
	// Resize xterm to fit container
	// In a real app, you might use FitAddon from @xterm/addon-fit
});

// Clean up on page unload
window.addEventListener("beforeunload", () => {
	tui.stop();
});
