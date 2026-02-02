import createFloatingPanel from "./floating-panel";

const LANGUAGE_SOURCES = {
    en: { label: "English", url: "https://skribbliohints.github.io/English.json" },
    fr: { label: "French", url: "https://skribbliohints.github.io/French.json" },
    de: { label: "German", url: "https://skribbliohints.github.io/German.json" },
    ko: { label: "Korean", url: "https://skribbliohints.github.io/Korean.json" },
    es: { label: "Spanish", url: "https://skribbliohints.github.io/Spanish.json" }
};

const LANGUAGE_ALIASES = {
    en: ["en", "english", "englisch"],
    fr: ["fr", "french", "français", "francais"],
    de: ["de", "german", "deutsch"],
    ko: ["ko", "korean", "한국어", "hangul"],
    es: ["es", "spanish", "español", "espanol"]
};

const DEFAULT_LANGUAGE = "en";
const AUTO_LANG_OPTION = "auto";
const HINT_COLLAPSE_KEY = "skribbl-hints-panel-collapsed";

const CACHE_KEY = "skribbl-hints-cache-v1";
const ENABLE_KEY = "skribbl-hints-enabled";
const LANG_KEY = "skribbl-hints-lang";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 3; // 3 days
const POS_KEY = "skribbl-hints-pos";
const WORD_CHECK_INTERVAL_MS = 500;
const MAX_RENDERED_RESULTS = 200;
const TOP_INLINE_RESULTS = 3;

const loadPanelPosition = function () {
    try {
        const saved = JSON.parse(localStorage.getItem(POS_KEY) || "{}");
        if (typeof saved.left === "number" && typeof saved.top === "number") {
            return { left: saved.left, top: saved.top };
        }
    } catch (error) {
        /* ignore */
    }
    return null;
};

const savePanelPosition = function (pos) {
    try {
        localStorage.setItem(POS_KEY, JSON.stringify({ left: pos.left, top: pos.top }));
    } catch (error) {
        /* ignore */
    }
};

const loadPanelCollapsed = function () {
    return localStorage.getItem(HINT_COLLAPSE_KEY) === "1";
};

const savePanelCollapsed = function (collapsed) {
    localStorage.setItem(HINT_COLLAPSE_KEY, collapsed ? "1" : "0");
};

const safeJsonParse = function (text) {
    try {
        return JSON.parse(text);
    } catch (error) {
        return null;
    }
};

const buildCacheKey = language => `${CACHE_KEY}-${language}`;

const loadCachedWordList = function (language) {
    const cached = safeJsonParse(localStorage.getItem(buildCacheKey(language)));
    if (!cached) return null;
    if (!Array.isArray(cached.words) || typeof cached.timestamp !== "number") return null;
    const isFresh = Date.now() - cached.timestamp < CACHE_TTL_MS;
    return isFresh ? cached.words : null;
};

const saveCachedWordList = function (language, words) {
    const payload = { timestamp: Date.now(), words };
    localStorage.setItem(buildCacheKey(language), JSON.stringify(payload));
};

const normalizeWordPayload = function (payload) {
    if (!payload) return [];
    const seen = new Set();
    const collected = [];

    const pushWord = word => {
        if (typeof word !== "string") return;
        const normalized = word.trim();
        if (!normalized) return;
        const key = normalized.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        collected.push(normalized);
    };

    const consume = value => {
        if (!value) return;
        if (typeof value === "string") {
            pushWord(value);
            return;
        }
        if (Array.isArray(value)) {
            value.forEach(consume);
            return;
        }
        if (typeof value === "object") {
            if (Array.isArray(value.words)) {
                value.words.forEach(consume);
                return;
            }
            if (typeof value.word === "string") {
                pushWord(value.word);
                return;
            }
            Object.values(value).forEach(consume);
        }
    };

    consume(payload);
    return collected;
};

const fetchWithTimeout = function (url, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
        fetch(url)
            .then(response => {
                clearTimeout(timer);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(resolve)
            .catch(reject);
    });
};

const fetchWordList = async function (language) {
    const source = LANGUAGE_SOURCES[language] || LANGUAGE_SOURCES[DEFAULT_LANGUAGE];
    const data = await fetchWithTimeout(source.url);
    const words = normalizeWordPayload(data);
    if (!words.length) {
        throw new Error(`Empty word list for ${language}`);
    }
    return words;
};

const buildRegex = function (pattern) {
    const sanitized = pattern.trim();
    if (!sanitized || !sanitized.includes("_")) return null;
    // Escape regex specials, then replace placeholder tokens.
    const escaped = sanitized.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const body = escaped
        // underscores become "any non-space, non-quote, non-dash"
        .replace(/_/g, "[^\\s\\\"-]")
        // literal spaces become \s to match space
        .replace(/\s+/g, "\\s+");
    return new RegExp(`^${body}$`, "i");
};

const filterWords = function (words, pattern) {
    const regex = buildRegex(pattern);
    if (!regex) return [];
    return words.filter(word => regex.test(word)).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
};

const filterBySearch = function (words, searchTerm) {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return words;
    return words.filter(w => w.toLowerCase().includes(term));
};

const createPanel = function (doc) {
    const floatingPanel = createFloatingPanel(doc, {
        id: "hintAssistantPanel",
        title: "Skribbl Hints",
        bodyClass: "hintAssistantBody",
        collapseClass: "autoDrawCollapse",
        subtitle: "Loading word list...",
        initialPosition: loadPanelPosition(),
        getDefaultPosition: () => ({ left: 12, top: 120 }),
        onPositionChange: savePanelPosition,
        initiallyCollapsed: loadPanelCollapsed(),
        onCollapsedChange: savePanelCollapsed,
        zIndex: 9998
    });

    const { panel, body, setSubtitle } = floatingPanel;

    const enableRow = doc.createElement("label");
    enableRow.className = "hintAssistantRow hintAssistantRow--split";
    const enableLabel = doc.createElement("span");
    enableLabel.textContent = "Hints";
    const enableWrapper = doc.createElement("span");
    enableWrapper.className = "autoDrawCheckboxWrapper";
    const enableInput = doc.createElement("input");
    enableInput.type = "checkbox";
    enableInput.id = "hintAssistantEnable";
    enableInput.className = "autoDrawCheckboxInput";
    const enableVisual = doc.createElement("span");
    enableVisual.className = "autoDrawCheckboxVisual";
    enableWrapper.appendChild(enableInput);
    enableWrapper.appendChild(enableVisual);
    enableRow.appendChild(enableLabel);
    enableRow.appendChild(enableWrapper);

    const langRow = doc.createElement("div");
    langRow.className = "hintAssistantRow";
    const langLabel = doc.createElement("span");
    langLabel.textContent = "Language";
    const langSelect = doc.createElement("select");
    langSelect.id = "hintAssistantLang";
    langRow.appendChild(langLabel);
    langRow.appendChild(langSelect);

    const searchRow = doc.createElement("div");
    searchRow.className = "hintAssistantRow";
    const search = doc.createElement("input");
    search.type = "text";
    search.placeholder = "Filter results";
    search.id = "hintAssistantSearch";
    searchRow.appendChild(search);

    const hintInfo = doc.createElement("div");
    hintInfo.id = "hintAssistantInfo";
    hintInfo.textContent = "Click to fill. Ctrl/Cmd click submits.";

    const hintList = doc.createElement("div");
    hintList.id = "hintAssistantHints";
    hintList.textContent = "Waiting for a pattern...";

    const inner = doc.createElement("div");
    inner.className = "hintAssistantInner";
    inner.appendChild(langRow);
    inner.appendChild(searchRow);
    inner.appendChild(hintInfo);
    inner.appendChild(hintList);

    body.appendChild(enableRow);
    body.appendChild(inner);

    return { panel, body, hintList, enableInput, search, langSelect, inner, setSubtitle };
};

const renderHints = function (doc, { hintList, inputChat, formChat }, words, pattern) {
    hintList.innerHTML = "";
    if (!pattern || !pattern.includes("_")) {
        hintList.textContent = "Waiting for a pattern...";
        return;
    }
    if (!words.length) {
        hintList.textContent = "No hints for this pattern.";
        return;
    }

    words.slice(0, MAX_RENDERED_RESULTS).forEach(word => {
        const item = doc.createElement("button");
        item.className = "hintAssistantHint";
        item.type = "button";
        item.textContent = word;
        item.title = "Click to fill. Ctrl/Cmd click submits.";

        item.addEventListener("click", event => {
            if (!inputChat) return;
            inputChat.value = word;
            inputChat.focus();
            if (event.ctrlKey || event.metaKey) {
                if (formChat) {
                    formChat.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
                }
            }
        });

        hintList.appendChild(item);
    });
};

export default function createHintAssistant(doc) {
    if (doc.getElementById("hintAssistantPanel")) return null;

    const inputChat = doc.querySelector("#game-chat form.chat-form input[type=text]");
    const formChat = doc.querySelector("#game-chat form.chat-form");
    if (!inputChat || !formChat) return null;

    const { hintList, enableInput, search, langSelect, inner, setSubtitle } = createPanel(doc);

    let enabled = localStorage.getItem(ENABLE_KEY) !== "0";
    let wordList = [];
    let lastPattern = "";
    let ready = false;

    const languageSelect = doc.querySelector("#item-settings-language");
    const wordListCache = {};
    let detectedLanguage = DEFAULT_LANGUAGE;
    let manualLanguage = AUTO_LANG_OPTION;
    let currentLanguage = null;
    let loadingLanguage = null;

    const matchLanguageId = function (value) {
        if (!value) return null;
        const normalized = value.trim().toLowerCase();
        if (!normalized) return null;
        if (LANGUAGE_SOURCES[normalized]) return normalized;
        for (const [lang, aliases] of Object.entries(LANGUAGE_ALIASES)) {
            if (aliases.some(alias => alias.toLowerCase() === normalized)) {
                return lang;
            }
        }
        return null;
    };

    const normalizeStoredLanguage = function (value) {
        if (!value || value === AUTO_LANG_OPTION) return AUTO_LANG_OPTION;
        return matchLanguageId(value) || AUTO_LANG_OPTION;
    };

    manualLanguage = normalizeStoredLanguage(localStorage.getItem(LANG_KEY));
    localStorage.setItem(LANG_KEY, manualLanguage);

    const detectLanguageFromGame = function () {
        if (!languageSelect) return DEFAULT_LANGUAGE;
        const selected = languageSelect.options[languageSelect.selectedIndex];
        if (!selected) return DEFAULT_LANGUAGE;
        return matchLanguageId(selected.value) || matchLanguageId(selected.textContent) || DEFAULT_LANGUAGE;
    };

    detectedLanguage = detectLanguageFromGame();

    const getLanguageMeta = function (languageId) {
        return LANGUAGE_SOURCES[languageId] || LANGUAGE_SOURCES[DEFAULT_LANGUAGE];
    };

    const getActiveLanguageId = function () {
        if (manualLanguage !== AUTO_LANG_OPTION && LANGUAGE_SOURCES[manualLanguage]) {
            return manualLanguage;
        }
        return LANGUAGE_SOURCES[detectedLanguage] ? detectedLanguage : DEFAULT_LANGUAGE;
    };

    const getLanguageDisplayLabel = function () {
        const meta = getLanguageMeta(getActiveLanguageId());
        return manualLanguage === AUTO_LANG_OPTION ? `${meta.label} (auto)` : meta.label;
    };

    const populateLangSelect = function () {
        langSelect.innerHTML = "";
        const autoOption = doc.createElement("option");
        autoOption.value = AUTO_LANG_OPTION;
        autoOption.textContent = "Auto (match game)";
        langSelect.appendChild(autoOption);

        Object.entries(LANGUAGE_SOURCES).forEach(([id, meta]) => {
            const opt = doc.createElement("option");
            opt.value = id;
            opt.textContent = meta.label;
            langSelect.appendChild(opt);
        });

        if (!langSelect.querySelector(`option[value="${manualLanguage}"]`)) {
            manualLanguage = AUTO_LANG_OPTION;
            localStorage.setItem(LANG_KEY, manualLanguage);
        }
        langSelect.value = manualLanguage;
    };

    const persistEnabled = function () {
        localStorage.setItem(ENABLE_KEY, enabled ? "1" : "0");
    };

    const updateStatus = function (text) {
        setSubtitle(text);
    };

    const updateEnabledUi = function () {
        enableInput.checked = enabled;
        inner.style.display = enabled ? "" : "none";
        const langLabel = getLanguageDisplayLabel();
        if (!enabled) {
            updateStatus(`Hints disabled (Alt to enable) | Lang: ${langLabel}`);
            return;
        }
        if (ready) {
            updateStatus(`Loaded ${wordList.length} words | Lang: ${langLabel}`);
        } else {
            updateStatus(`Loading word list | Lang: ${langLabel}`);
        }
    };

    const getWordListForLanguage = async function (languageId) {
        if (wordListCache[languageId]) return wordListCache[languageId];
        const cached = loadCachedWordList(languageId);
        if (cached) {
            wordListCache[languageId] = cached;
            return cached;
        }
        const fetched = await fetchWordList(languageId);
        wordListCache[languageId] = fetched;
        saveCachedWordList(languageId, fetched);
        return fetched;
    };

    const loadLanguage = async function (languageId) {
        const targetLanguage = LANGUAGE_SOURCES[languageId] ? languageId : DEFAULT_LANGUAGE;
        loadingLanguage = targetLanguage;
        ready = false;
        updateEnabledUi();
        try {
            const words = await getWordListForLanguage(targetLanguage);
            if (loadingLanguage !== targetLanguage) return;
            wordList = words;
            currentLanguage = targetLanguage;
            ready = true;
            updateEnabledUi();
            lastPattern = ""; // force refresh with new language
            sync();
        } catch (error) {
            if (loadingLanguage !== targetLanguage) return;
            ready = false;
            updateStatus(`Failed to load ${getLanguageMeta(targetLanguage).label} word list`);
        }
    };

    const refreshActiveLanguage = function (force = false) {
        const nextLanguage = getActiveLanguageId();
        if (!force && ready && currentLanguage === nextLanguage) {
            updateEnabledUi();
            return;
        }
        loadLanguage(nextLanguage);
    };

    const getPattern = function () {
        const container = doc.querySelector("#game-word .hints .container");
        if (!container) return "";
        const hintEls = Array.from(container.querySelectorAll(".hint"));
        if (!hintEls.length) return "";
        const chars = [];
        for (const el of hintEls) {
            if (el.classList.contains("word-length")) continue;
            const raw = el.textContent || "";
            const t = raw.trim();
            if (t === "_") {
                chars.push("_");
            } else if (t === "") {
                // spaces between words are rendered as blank hints
                chars.push(" ");
            } else {
                chars.push(t[0]);
            }
        }
        return chars.join("");
    };

    const inlineContainer = doc.createElement("div");
    inlineContainer.id = "hintAssistantInline";
    const attachInline = function () {
        const chat = doc.getElementById("game-chat");
        const chatForm = chat ? chat.querySelector(".chat-form") : null;
        if (chat && chatForm) {
            // Insert inline hints above the chat input
            if (inlineContainer.parentElement !== chat || inlineContainer.nextSibling !== chatForm) {
                chat.insertBefore(inlineContainer, chatForm);
            }
        }
    };
    attachInline();

    const renderInlineTop = function (matches) {
        if (!enabled) {
            if (inlineContainer.parentElement) {
                inlineContainer.parentElement.removeChild(inlineContainer);
            }
            return;
        }
        inlineContainer.innerHTML = "";
        if (!matches.length) return;
        matches.slice(0, TOP_INLINE_RESULTS).forEach(word => {
            const chip = doc.createElement("button");
            chip.type = "button";
            chip.className = "hintAssistantInlineChip";
            chip.textContent = word;
            chip.title = "Click to send guess.";
            chip.addEventListener("click", () => {
                if (!inputChat || !formChat) return;
                inputChat.value = word;
                inputChat.focus();
                formChat.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
            });
            inlineContainer.appendChild(chip);
        });
        attachInline();
    };

    const sync = function () {
        attachInline();
        if (!enabled) {
            inlineContainer.innerHTML = "";
            return;
        }
        const pattern = getPattern();
        if (pattern === lastPattern && ready) return;
        lastPattern = pattern;
        if (!ready) return;
        const matches = filterWords(wordList, pattern);
        const filtered = filterBySearch(matches, search.value || "");
        renderHints(doc, { hintList, inputChat, formChat }, filtered, pattern);
        renderInlineTop(filtered);
    };

    setInterval(sync, WORD_CHECK_INTERVAL_MS);

    doc.addEventListener("keyup", event => {
        if (event.key !== "Alt") return;
        enabled = !enabled;
        persistEnabled();
        lastPattern = ""; // force rerender inline/top3 on re-enable
        updateEnabledUi();
        sync();
        if (!enabled && inlineContainer.parentElement) {
            inlineContainer.parentElement.removeChild(inlineContainer);
        }
    });

    enableInput.addEventListener("change", () => {
        enabled = enableInput.checked;
        persistEnabled();
        lastPattern = ""; // force rerender inline/top3 on re-enable
        updateEnabledUi();
        sync();
        if (!enabled && inlineContainer.parentElement) {
            inlineContainer.parentElement.removeChild(inlineContainer);
        }
    });

    search.addEventListener("input", () => {
        lastPattern = ""; // force recompute with filter
        sync();
    });

    langSelect.addEventListener("change", () => {
        manualLanguage = langSelect.value || AUTO_LANG_OPTION;
        localStorage.setItem(LANG_KEY, manualLanguage);
        lastPattern = ""; // refresh inline/top3 after lang change
        refreshActiveLanguage(true);
    });

    const observeLanguage = function () {
        if (!languageSelect) return;
        languageSelect.addEventListener("change", () => {
            detectedLanguage = detectLanguageFromGame();
            if (manualLanguage === AUTO_LANG_OPTION) {
                refreshActiveLanguage();
            } else {
                updateEnabledUi();
            }
        });
    };

    populateLangSelect();
    updateEnabledUi();
    observeLanguage();
    refreshActiveLanguage(true);

    return {
        enable() {
            enabled = true;
            persistEnabled();
            updateEnabledUi();
            sync();
        },
        disable() {
            enabled = false;
            persistEnabled();
            updateEnabledUi();
        }
    };
}
