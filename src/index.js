import createCanvas from "./canvas";
import createToolbar from "./toolbar";
import createArtist from "./artist";
import { getImgFileUrl, getImgElementSrc, getClipboardImgUrl } from "./data-transfer-helper";
import { loadImage } from "./image-helper";
import log, { setLoggingEnabled } from "./log";
import processWithoutBlocking from "./non-blocking-processor";
import listenForDragDropEvents from "./drag-drop-event-listener";
import createDomHelper from "./dom-helper";
import createSettingsPanel from "./settings-panel";
import createHintAssistant from "./hint-assistant";

const domHelper = createDomHelper(document);
const clearToolElement = domHelper.getClearToolElement();
const canvas = createCanvas(domHelper.getCanvasElement());
const toolbar = createToolbar(domHelper);
const artist = createArtist(canvas, toolbar);
const settingsPanel = createSettingsPanel(document);

let hintAssistantInstance = null;
const startHintAssistant = function () {
    if (hintAssistantInstance) return true;
    hintAssistantInstance = createHintAssistant(document) || null;
    return Boolean(hintAssistantInstance);
};

if (!startHintAssistant()) {
    const hintInterval = setInterval(() => {
        if (startHintAssistant()) clearInterval(hintInterval);
    }, 750);
}

let settings = settingsPanel.getSettings();
settingsPanel.onChange(newSettings => {
    settings = newSettings;
    setLoggingEnabled(settings.debugLogging);
});
setLoggingEnabled(settings.debugLogging);

let commands = [];
let isDrawingActive = false;
let activeJobId = 0;
let pendingLoadId = 0;
let suppressStopStatus = false;
const corsProxyUrl = "https://skribbl-io-autodraw-cors-proxy.galehouse5.workers.dev?";
const SERVER_COMMANDS_PER_SECOND = 180;
const MAX_FRAME_BURST = 12;

const estimateTime = function (commandCount) {
    if (!commandCount) return "";
    const seconds = commandCount / SERVER_COMMANDS_PER_SECOND;
    if (!Number.isFinite(seconds)) return "";
    return `Est. ${seconds.toFixed(1)}s`;
};

const loadImageWithFallback = function (imageUrl) {
    if (!settings.useCorsProxy) return loadImage(imageUrl);
    return loadImage(imageUrl)
        .catch(() => loadImage(`${corsProxyUrl}${imageUrl}`));
};

const handleDragEnter = function () {
    if (!toolbar.isEnabled()) return;
    domHelper.showCanvasOverlay("Drop image here to auto draw!");
};

const performToolbarClear = function () {
    suppressStopStatus = true;
    toolbar.clear();
    suppressStopStatus = false;
};

const drawImage = function (image, loadId) {
    if (typeof loadId === "number" && loadId !== pendingLoadId) {
        log("Discarded draw request for a stale image load.");
        return;
    }

    stopDrawing({ silent: true });
    log("Clearing canvas...");
    performToolbarClear();

    const jobId = ++activeJobId;

    log(`Drawing ${image.width} x ${image.height} image...`);
    settingsPanel.setStatus("Drawing...");

    let nextCommands = [];
    try {
        nextCommands = artist.draw(image, settings);
    } catch (error) {
        log(`Failed to generate draw commands: ${error instanceof Error ? error.message : error}`);
        settingsPanel.setStatus("Drawing failed");
        domHelper.showCanvasOverlay("AutoDraw hit an error :(");
        domHelper.hideCanvasOverlay(2500);
        return;
    }

    commands = nextCommands;
    domHelper.hideCanvasOverlay();
    const estimate = estimateTime(commands.length);
    settingsPanel.setEstimate(estimate);

    if (!commands.length) {
        isDrawingActive = false;
        settingsPanel.setStatus("Nothing to draw");
        settingsPanel.setEstimate("");
        return;
    }

    isDrawingActive = true;

    processWithoutBlocking(commands, () => jobId !== activeJobId || !toolbar.isEnabled(), {
        batchSize: MAX_FRAME_BURST,
        maxCommandsPerSecond: SERVER_COMMANDS_PER_SECOND,
        onFinish: () => {
            if (jobId !== activeJobId) return;
            isDrawingActive = false;
            commands = [];
            settingsPanel.setStatus("Done");
            settingsPanel.setEstimate("");
        },
        onStop: () => {
            if (jobId !== activeJobId) return;
            isDrawingActive = false;
            commands = [];
            settingsPanel.setStatus("Stopped");
            settingsPanel.setEstimate("");
        }
    });
};

const stopDrawing = function (options = {}) {
    const silentOption = Boolean(options.silent);
    const statusText = options.statusText || "Stopped";
    if (!isDrawingActive) return false;

    isDrawingActive = false;
    commands = [];
    activeJobId++;
    settingsPanel.setEstimate("");
    const shouldSilence = silentOption || suppressStopStatus;
    if (!shouldSilence) settingsPanel.setStatus(statusText);
    log("Drawing stopped.");
    return true;
};

const loadImageFromSource = function (imageUrl, { overlayText, statusText, errorLabel }) {
    stopDrawing({ silent: true });
    const loadId = ++pendingLoadId;
    settingsPanel.setEstimate("");
    settingsPanel.setStatus(statusText);
    domHelper.showCanvasOverlay(overlayText);

    const shouldRevoke = imageUrl.startsWith("blob:");
    let released = false;
    const releaseUrl = function () {
        if (released || !shouldRevoke) return;
        URL.revokeObjectURL(imageUrl);
        released = true;
    };

    loadImageWithFallback(imageUrl)
        .then(image => {
            releaseUrl();
            if (loadId !== pendingLoadId) {
                log("Discarded stale image load result.");
                return null;
            }
            return image;
        })
        .then(image => {
            if (!image) return;
            drawImage(image, loadId);
        })
        .catch(error => {
            releaseUrl();
            if (loadId !== pendingLoadId) return;
            settingsPanel.setStatus("Loading failed");
            domHelper.showCanvasOverlay("Auto draw couldn't load image :(");
            domHelper.hideCanvasOverlay(2500);
            log(`Couldn't load ${errorLabel}: ${imageUrl}. ${error?.message || error || ""}`);
        });
};

const handleDrop = function (event) {
    event.preventDefault();

    if (!domHelper.getCanvasContainerElement().contains(event.target))
        return domHelper.hideCanvasOverlay();

    if (!toolbar.isEnabled()) {
        log("Can't draw right now.");
        return domHelper.hideCanvasOverlay();
    }

    log("Processing dropped content...");
    const imageUrl = getImgFileUrl(event.dataTransfer)
        || getImgElementSrc(event.dataTransfer);
    if (!imageUrl) {
        domHelper.showCanvasOverlay("Auto draw couldn't load image :(");
        log("Dropped content not recognized.");
        return domHelper.hideCanvasOverlay(/* delay: */ 2500);
    }

    loadImageFromSource(imageUrl, {
        overlayText: "AutoDraw loading image...",
        statusText: "Loading image...",
        errorLabel: "image"
    });
};

const handlePaste = function (event) {
    if (!toolbar.isEnabled()) return;
    const imageUrl = getClipboardImgUrl(event.clipboardData);
    if (!imageUrl) return;

    event.preventDefault();
    loadImageFromSource(imageUrl, {
        overlayText: "AutoDraw loading pasted image...",
        statusText: "Loading pasted image...",
        errorLabel: "pasted image"
    });
};

listenForDragDropEvents(document, handleDragEnter, domHelper.hideCanvasOverlay, handleDrop);
clearToolElement.addEventListener("click", () => {
    if (!suppressStopStatus) pendingLoadId++;
    stopDrawing();
    domHelper.hideCanvasOverlay();
});
settingsPanel.stopButton.addEventListener("click", () => {
    pendingLoadId++;
    stopDrawing();
    domHelper.hideCanvasOverlay();
});
document.addEventListener("paste", handlePaste);
