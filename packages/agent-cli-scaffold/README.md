# @earendil-works/pi-agent-cli-scaffold

Standalone scaffold CLI package extracted from pi's `--no-builtin-tools` (`-nbt`) mode.

It runs the pi coding-agent CLI with built-in tools disabled by default, so you can start from a bare-bones agent and layer custom tools, extensions, skills, and prompts.

## Installation

```bash
npm install -g @earendil-works/pi-agent-cli-scaffold
```

## Usage

```bash
pi-scaffold
```

This command is equivalent to running:

```bash
pi --no-builtin-tools
```

All regular pi CLI flags still work and can override tool selection, for example:

```bash
pi-scaffold --tools read,bash -p "Inspect this repo"
```
