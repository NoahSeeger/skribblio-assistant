import log from "./log";

export default function (commands, shouldStop, options = {}) {
    const batchSize = Math.max(1, options.batchSize || 150);
    const schedule = options.schedule || requestAnimationFrame;
    const onFinish = options.onFinish || null;
    const onStop = options.onStop || null;
    const maxCommandsPerSecond = Number.isFinite(options.maxCommandsPerSecond) && options.maxCommandsPerSecond > 0
        ? options.maxCommandsPerSecond
        : null;
    let index = 0;
    let allowance = 0;
    let lastTimestamp = null;

    const process = function (timestamp) {
        const now = typeof timestamp === "number" ? timestamp : performance.now();
        if (maxCommandsPerSecond) {
            if (lastTimestamp === null) {
                lastTimestamp = now;
            }
            const deltaMs = Math.max(0, now - lastTimestamp);
            lastTimestamp = now;
            allowance = Math.min(maxCommandsPerSecond, allowance + (maxCommandsPerSecond * deltaMs) / 1000);
            if (allowance < 1) {
                schedule(process);
                return;
            }
        }

        if (index >= commands.length) {
            log("Processing finished.");
            if (onFinish) onFinish();
            return;
        }

        if (shouldStop && shouldStop()) {
            log("Processing stopped.");
            if (onStop) onStop();
            return;
        }

        const frameBudget = maxCommandsPerSecond
            ? Math.min(Math.floor(allowance), batchSize)
            : batchSize;
        if (frameBudget <= 0) {
            schedule(process);
            return;
        }

        const startIndex = index;
        const end = Math.min(index + frameBudget, commands.length);
        for (; index < end; index++) {
            commands[index]();
        }

        if (maxCommandsPerSecond) {
            const executed = end - startIndex;
            allowance = Math.max(0, allowance - executed);
        }

        if ((commands.length - index) % 200 === 0 && commands.length - index > 0) {
            log(`${commands.length - index} commands remaining to process.`);
        }

        schedule(process);
    };

    log(`Processing ${commands.length} commands...`);
    process(performance.now());
};
