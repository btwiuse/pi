import { Input, Spacer, Text, TUI, type Terminal } from "@earendil-works/pi-tui/browser";
import { Terminal as XtermTerminal } from "@xterm/xterm";
import "./tui-demo.css";

class BrowserXtermTerminal implements Terminal {
	private inputHandler?: (data: string) => void;
	private resizeHandler?: () => void;
	private disposers: Array<() => void> = [];

	constructor(private readonly xterm: XtermTerminal) {}

	start(onInput: (data: string) => void, onResize: () => void): void {
		this.inputHandler = onInput;
		this.resizeHandler = onResize;

		const inputDisposable = this.xterm.onData((data) => {
			this.inputHandler?.(data);
		});
		const resizeDisposable = this.xterm.onResize(() => {
			this.resizeHandler?.();
		});

		this.disposers.push(() => inputDisposable.dispose(), () => resizeDisposable.dispose());
	}

	stop(): void {
		for (const dispose of this.disposers.splice(0)) {
			dispose();
		}
		this.inputHandler = undefined;
		this.resizeHandler = undefined;
	}

	async drainInput(): Promise<void> {}

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
		return false;
	}

	moveBy(lines: number): void {
		if (lines > 0) {
			this.xterm.write(`\x1b[${lines}B`);
		} else if (lines < 0) {
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
		document.title = title;
	}

	setProgress(_active: boolean): void {}
}

const transcriptLines = [
	"assistant: Welcome to the pi-tui browser demo.",
	"assistant: Type a message and press Enter. Use /clear to reset the transcript.",
];

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
	throw new Error("App container not found");
}

app.innerHTML = `
	<div class="demo-shell">
		<div class="demo-panel">
			<div class="demo-header">
				<h1 class="demo-title">pi-tui + xterm browser demo</h1>
				<p class="demo-copy">
					This page mounts an <code>@xterm/xterm</code> instance in the browser and lets a small
					<code>@earendil-works/pi-tui</code> app render directly into it.
				</p>
			</div>
			<div class="demo-actions">
				<a class="demo-link" href="/">Open the web UI example</a>
				<button class="demo-button" id="reset-demo" type="button">Reset demo</button>
			</div>
			<div class="terminal-frame">
				<div id="terminal"></div>
			</div>
		</div>
	</div>
`;

const terminalElement = document.querySelector<HTMLDivElement>("#terminal");

if (!terminalElement) {
	throw new Error("Terminal container not found");
}

const xterm = new XtermTerminal({
	cols: 80,
	rows: 24,
	cursorBlink: true,
	convertEol: true,
	fontFamily: "Menlo, Consolas, Monaco, 'Liberation Mono', monospace",
	fontSize: 14,
	lineHeight: 1.2,
	theme: {
		background: "#020617",
		foreground: "#e2e8f0",
		cursor: "#38bdf8",
		selectionBackground: "#334155",
	},
});

xterm.open(terminalElement);
xterm.focus();

const browserTerminal = new BrowserXtermTerminal(xterm);
const tui = new TUI(browserTerminal);
const header = new Text("pi-tui in the browser", 1, 0);
const transcript = new Text("", 1, 0);
const input = new Input();

function renderTranscript(): void {
	transcript.setText(transcriptLines.join("\n"));
	tui.requestRender();
}

input.onSubmit = (value) => {
	const trimmed = value.trim();
	if (!trimmed) {
		return;
	}

	if (trimmed === "/clear") {
		transcriptLines.splice(
			0,
			transcriptLines.length,
			"assistant: Welcome to the pi-tui browser demo.",
			"assistant: The transcript was cleared.",
		);
	} else {
		transcriptLines.push(`you: ${trimmed}`);
		transcriptLines.push(`assistant: I received ${trimmed.length} character(s).`);
	}

	input.setValue("");
	renderTranscript();
};

tui.addChild(header);
tui.addChild(new Text("Type into the input below. The TUI render loop writes ANSI directly into xterm.", 1, 1));
tui.addChild(transcript);
tui.addChild(new Spacer(1));
tui.addChild(input);
tui.setFocus(input);
tui.start();
renderTranscript();

const resetButton = document.querySelector<HTMLButtonElement>("#reset-demo");

resetButton?.addEventListener("click", () => {
	transcriptLines.splice(
		0,
		transcriptLines.length,
		"assistant: Welcome to the pi-tui browser demo.",
		"assistant: Type a message and press Enter. Use /clear to reset the transcript.",
	);
	input.setValue("");
	xterm.reset();
	tui.requestRender(true);
	renderTranscript();
	xterm.focus();
});
