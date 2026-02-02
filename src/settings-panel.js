import createFloatingPanel from "./floating-panel";

const STORAGE_KEY = "skribbl-autodraw-settings-v3";

const DEFAULT_SETTINGS = {
    preset: "fast",
    quality: 3, // 1..5
    colorQuantization: 6, // bits 4..8
    colorBatching: true,
    penMode: "fast", // accurate | fast
    scaleMode: "fit", // fit | fill
    enableFill: true,
    useCorsProxy: true,
    showAdvanced: false,
    debugLogging: false,
    panelPosition: { left: null, top: 120 }
};

const PRESETS = {
    fast: {
        quality: 2,
        colorQuantization: 5,
        colorBatching: true,
        penMode: "fast",
        scaleMode: "fit",
        enableFill: true
    },
    balanced: {
        quality: 3,
        colorQuantization: 6,
        colorBatching: true,
        penMode: "fast",
        scaleMode: "fit",
        enableFill: true
    },
    quality: {
        quality: 5,
        colorQuantization: 8,
        colorBatching: false,
        penMode: "accurate",
        scaleMode: "fit",
        enableFill: true
    }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const loadSettings = function () {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        return { ...DEFAULT_SETTINGS, ...saved };
    } catch (error) {
        return { ...DEFAULT_SETTINGS };
    }
};

const saveSettings = function (settings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

const createRange = function (id, min, max, value) {
    const input = document.createElement("input");
    input.type = "range";
    input.id = id;
    input.min = min;
    input.max = max;
    input.step = 1;
    input.value = value;
    return input;
};

const createCheckbox = function (id, checked) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.checked = checked;
    input.className = "autoDrawCheckboxInput";

    const visual = document.createElement("span");
    visual.className = "autoDrawCheckboxVisual";

    const wrapper = document.createElement("span");
    wrapper.className = "autoDrawCheckboxWrapper";
    wrapper.appendChild(input);
    wrapper.appendChild(visual);

    input._autoDrawWrapper = wrapper;
    return input;
};

const createRadioGroup = function (name, options, value) {
    const wrapper = document.createElement("div");
    wrapper.className = "autoDrawRadioGroup";

    for (const option of options) {
        const label = document.createElement("label");
        label.className = "autoDrawRadio";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = name;
        input.value = option.value;
        input.checked = option.value === value;

        const text = document.createElement("span");
        text.textContent = option.label;

        label.appendChild(input);
        label.appendChild(text);
        wrapper.appendChild(label);
    }

    return wrapper;
};

const createSelect = function (id, options, value) {
    const select = document.createElement("select");
    select.id = id;
    for (const option of options) {
        const opt = document.createElement("option");
        opt.value = option.value;
        opt.textContent = option.label;
        if (option.value === value) opt.selected = true;
        select.appendChild(opt);
    }
    return select;
};

const createRow = function (labelText, input, valueEl, tooltipText) {
    const row = document.createElement("label");
    row.className = "autoDrawRow";
    if (input.classList && input.classList.contains("autoDrawRadioGroup")) {
        row.classList.add("autoDrawRow--full");
    }
    if (valueEl) {
        row.classList.add("autoDrawRow--hasValue");
    }
    const label = document.createElement("span");
    label.className = "autoDrawLabel";
    label.textContent = labelText;
    if (tooltipText) {
        label.setAttribute("data-tip", tooltipText);
    }
    row.appendChild(label);
    const control = input && input._autoDrawWrapper ? input._autoDrawWrapper : input;
    if (control) {
        row.appendChild(control);
    }
    if (valueEl) row.appendChild(valueEl);
    return row;
};

export default function createSettingsPanel(doc) {
    const settings = loadSettings();

    const PANEL_WIDTH_PX = 280;

    const getStoredPanelPosition = function () {
        const stored = settings.panelPosition || {};
        if (typeof stored.left === "number" && Number.isFinite(stored.left)) {
            return { left: stored.left, top: typeof stored.top === "number" ? stored.top : 120 };
        }
        if (typeof stored.right === "number" && Number.isFinite(stored.right)) {
            const left = Math.max(8, window.innerWidth - PANEL_WIDTH_PX - stored.right);
            const normalized = { left, top: typeof stored.top === "number" ? stored.top : 120 };
            settings.panelPosition = normalized;
            saveSettings(settings);
            return normalized;
        }
        return null;
    };

    const COLLAPSED_KEY = "skribbl-autodraw-panel-collapsed";
    const loadCollapsed = () => localStorage.getItem(COLLAPSED_KEY) === "1";
    const saveCollapsed = val => localStorage.setItem(COLLAPSED_KEY, val ? "1" : "0");

    const floatingPanel = createFloatingPanel(doc, {
        id: "autoDrawPanel",
        title: "AutoDraw",
        bodyClass: "autoDrawBody",
        collapseClass: "autoDrawCollapse",
        initialPosition: getStoredPanelPosition(),
        initiallyCollapsed: loadCollapsed(),
        getDefaultPosition: panelEl => {
            const width = panelEl?.offsetWidth || PANEL_WIDTH_PX;
            const left = Math.max(8, window.innerWidth - width - 12);
            return { left, top: 120 };
        },
        onPositionChange: position => {
            settings.panelPosition = { left: position.left, top: position.top };
            saveSettings(settings);
        },
        onCollapsedChange: collapsed => {
            saveCollapsed(collapsed);
        },
        zIndex: 9999
    });

    const { body } = floatingPanel;

    const presetInput = createRadioGroup("autoDrawPreset", [
        { value: "fast", label: "Fast" },
        { value: "balanced", label: "Balanced" },
        { value: "quality", label: "Quality" }
    ], settings.preset);

    const advancedToggle = createCheckbox("autoDrawAdvanced", settings.showAdvanced);
    const debugToggle = createCheckbox("autoDrawDebug", settings.debugLogging);

    const qualityValue = doc.createElement("span");
    qualityValue.className = "autoDrawValue";
    qualityValue.textContent = String(settings.quality);
    const qualityInput = createRange("autoDrawQuality", 1, 5, settings.quality);

    const quantValue = doc.createElement("span");
    quantValue.className = "autoDrawValue";
    quantValue.textContent = String(settings.colorQuantization);
    const quantInput = createRange("autoDrawQuant", 4, 8, settings.colorQuantization);

    const batchingInput = createCheckbox("autoDrawBatching", settings.colorBatching);
    const fillInput = createCheckbox("autoDrawFill", settings.enableFill);
    const proxyInput = createCheckbox("autoDrawProxy", settings.useCorsProxy);

    const penModeInput = createSelect("autoDrawPenMode", [
        { value: "accurate", label: "Accurate" },
        { value: "fast", label: "Fast" }
    ], settings.penMode);

    const scaleModeInput = createSelect("autoDrawScaleMode", [
        { value: "fit", label: "Fit" },
        { value: "fill", label: "Fill" }
    ], settings.scaleMode);

    const stopButton = doc.createElement("button");
    stopButton.id = "autoDrawStop";
    stopButton.textContent = "Stop";

    const status = doc.createElement("div");
    status.id = "autoDrawStatus";
    status.textContent = "Idle";

    const estimate = doc.createElement("div");
    estimate.id = "autoDrawEstimate";
    estimate.textContent = "";

    body.appendChild(createRow("Mode", presetInput));
    body.appendChild(createRow("Advanced", advancedToggle, null, "Show expert controls"));

    const advancedSection = doc.createElement("div");
    advancedSection.className = "autoDrawAdvanced";
    advancedSection.appendChild(createRow("Quality", qualityInput, qualityValue, "Higher = more detail, slower"));
    advancedSection.appendChild(createRow("Color bits", quantInput, quantValue, "Lower = fewer colors, faster"));
    advancedSection.appendChild(createRow("Batch by color", batchingInput, null, "Fewer color switches"));
    advancedSection.appendChild(createRow("Fill background", fillInput, null, "Fill canvas with dominant color"));
    advancedSection.appendChild(createRow("CORS proxy", proxyInput, null, "Try proxy if image host blocks CORS"));
    advancedSection.appendChild(createRow("Pen mode", penModeInput, null, "Fast uses larger strokes"));
    advancedSection.appendChild(createRow("Scale", scaleModeInput, null, "Fit keeps aspect ratio"));
    advancedSection.appendChild(createRow("Debug logs", debugToggle, null, "Enable console logs"));

    body.appendChild(advancedSection);
    body.appendChild(stopButton);
    body.appendChild(status);
    body.appendChild(estimate);

    const listeners = [];

    const applyPreset = function (presetId) {
        const preset = PRESETS[presetId];
        if (!preset) return;
        settings.preset = presetId;
        settings.quality = preset.quality;
        settings.colorQuantization = preset.colorQuantization;
        settings.colorBatching = preset.colorBatching;
        settings.penMode = preset.penMode;
        settings.scaleMode = preset.scaleMode;
        settings.enableFill = preset.enableFill;

        qualityInput.value = settings.quality;
        quantInput.value = settings.colorQuantization;
        batchingInput.checked = settings.colorBatching;
        fillInput.checked = settings.enableFill;
        penModeInput.value = settings.penMode;
        scaleModeInput.value = settings.scaleMode;

        presetInput.querySelectorAll("input[type=radio]").forEach(input => {
            input.checked = input.value === presetId;
        });
    };

    const updateAdvancedVisibility = function () {
        advancedSection.style.display = settings.showAdvanced ? "grid" : "none";
    };

    const updateSettings = function () {
        settings.quality = clamp(parseInt(qualityInput.value, 10), 1, 5);
        settings.colorQuantization = clamp(parseInt(quantInput.value, 10), 4, 8);
        settings.colorBatching = batchingInput.checked;
        settings.enableFill = fillInput.checked;
        settings.useCorsProxy = proxyInput.checked;
        settings.penMode = penModeInput.value;
        settings.scaleMode = scaleModeInput.value;
        const presetChecked = presetInput.querySelector("input[type=radio]:checked");
        settings.preset = presetChecked ? presetChecked.value : settings.preset;
        settings.showAdvanced = advancedToggle.checked;
        settings.debugLogging = debugToggle.checked;

        qualityValue.textContent = String(settings.quality);
        quantValue.textContent = String(settings.colorQuantization);

        updateAdvancedVisibility();
        saveSettings(settings);
        listeners.forEach(listener => listener({ ...settings }));
    };

    const inputs = [
        advancedToggle,
        qualityInput,
        quantInput,
        batchingInput,
        fillInput,
        proxyInput,
        penModeInput,
        scaleModeInput,
        debugToggle
    ];

    inputs.forEach(input => input.addEventListener("input", updateSettings));
    inputs.forEach(input => input.addEventListener("change", updateSettings));

    presetInput.querySelectorAll("input[type=radio]").forEach(input => {
        input.addEventListener("change", () => {
            applyPreset(input.value);
            updateSettings();
        });
    });

    applyPreset(settings.preset);
    updateAdvancedVisibility();
    updateSettings();

    return {
        getSettings: () => ({ ...settings }),
        onChange: listener => listeners.push(listener),
        setStatus: text => { status.textContent = text; },
        setEstimate: text => { estimate.textContent = text || ""; },
        stopButton
    };
}
