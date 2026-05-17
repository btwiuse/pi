import { main, type MainOptions } from "@earendil-works/pi-coding-agent";

const DEFAULT_SCAFFOLD_ARGS = ["--no-builtin-tools"] as const;

export async function runScaffoldCli(args: string[], options?: MainOptions): Promise<void> {
  await main([...DEFAULT_SCAFFOLD_ARGS, ...args], options);
}
