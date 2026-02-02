export default function (message) {
    if (!loggingEnabled) return;

    console.log(`skribbl.io AutoDraw: ${message}`);
};

export const setLoggingEnabled = function (enabled) {
    loggingEnabled = Boolean(enabled);
};

let loggingEnabled = false;
