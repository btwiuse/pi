interface ProcessLike {
	env?: Record<string, string | undefined>;
	nextTick?: (callback: () => void) => void;
}

function getProcessLike(): ProcessLike | undefined {
	return (globalThis as typeof globalThis & { process?: ProcessLike }).process;
}

export function getEnv(name: string): string | undefined {
	return getProcessLike()?.env?.[name];
}

export function nextTick(callback: () => void): void {
	const processLike = getProcessLike();
	if (typeof processLike?.nextTick === "function") {
		processLike.nextTick(callback);
		return;
	}
	queueMicrotask(callback);
}

export function now(): number {
	if (typeof performance !== "undefined" && typeof performance.now === "function") {
		return performance.now();
	}
	return Date.now();
}
