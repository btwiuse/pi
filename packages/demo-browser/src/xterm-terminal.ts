import type { Terminal as XtermInstance } from "@xterm/xterm";
import type { Terminal } from "@earendil-works/pi-tui";

/**
 * XtermTerminal adapter implementing the Terminal interface from pi-tui
 * for use with xterm.js in the browser
 */
export class XtermTerminal implements Terminal {
	private xterm: XtermInstance;
	private inputHandler?: (data: string) => void;
	private resizeHandler?: () => void;
	private onDataDisposable?: { dispose: () => void };
	private onResizeDisposable?: { dispose: () => void };

	constructor(xterm: XtermInstance) {
		this.xterm = xterm;
	}

	start(onInput: (data: string) => void, onResize: () => void): void {
		this.inputHandler = onInput;
		this.resizeHandler = onResize;

		// Set up input handler
		this.onDataDisposable = this.xterm.onData((data) => {
			if (this.inputHandler) {
				this.inputHandler(data);
			}
		});

		// Set up resize handler
		this.onResizeDisposable = this.xterm.onResize(() => {
			if (this.resizeHandler) {
				this.resizeHandler();
			}
		});

		// Enable bracketed paste mode for consistency with ProcessTerminal
		this.xterm.write("\x1b[?2004h");
	}

	stop(): void {
		// Disable bracketed paste mode
		this.xterm.write("\x1b[?2004l");

		// Dispose event listeners
		if (this.onDataDisposable) {
			this.onDataDisposable.dispose();
			this.onDataDisposable = undefined;
		}
		if (this.onResizeDisposable) {
			this.onResizeDisposable.dispose();
			this.onResizeDisposable = undefined;
		}

		this.inputHandler = undefined;
		this.resizeHandler = undefined;
	}

	async drainInput(_maxMs?: number, _idleMs?: number): Promise<void> {
		// No-op for browser terminal - no stdin to drain
		return Promise.resolve();
	}

	write(data: string): void {
		this.xterm.write(data);
	}

	get columns(): number {
		return this.xterm.cols;
	}

	get rows(): number {
		return this.xterm.rows;
	}

	get kittyProtocolActive(): boolean {
		// Browser terminals don't support Kitty protocol
		return false;
	}

	moveBy(lines: number): void {
		if (lines > 0) {
			// Move down
			this.xterm.write(`\x1b[${lines}B`);
		} else if (lines < 0) {
			// Move up
			this.xterm.write(`\x1b[${-lines}A`);
		}
	}

	hideCursor(): void {
		this.xterm.write("\x1b[?25l");
	}

	showCursor(): void {
		this.xterm.write("\x1b[?25h");
	}

	clearLine(): void {
		this.xterm.write("\x1b[K");
	}

	clearFromCursor(): void {
		this.xterm.write("\x1b[J");
	}

	clearScreen(): void {
		this.xterm.write("\x1b[2J\x1b[H");
	}

	setTitle(title: string): void {
		this.xterm.write(`\x1b]0;${title}\x07`);
	}

	setProgress(_active: boolean): void {
		// Browser terminals don't support OSC 9;4 progress indicator
	}
}
