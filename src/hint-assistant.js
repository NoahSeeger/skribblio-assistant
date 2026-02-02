const WORDLIST_URLS = [
    "https://api.npoint.io/91ac00bc3d335f00e13f",
    "https://skribbliohints.github.io/words.json"
];

const CACHE_KEY = "skribbl-hints-cache-v1";
const ENABLE_KEY = "skribbl-hints-enabled";
const LANG_KEY = "skribbl-hints-lang";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 3; // 3 days
const POS_KEY = "skribbl-hints-pos";
const WORD_CHECK_INTERVAL_MS = 500;
const MAX_RENDERED_RESULTS = 200;
const TOP_INLINE_RESULTS = 3;

const safeJsonParse = function (text) {
    try {
        return JSON.parse(text);
    } catch (error) {
        return null;
    }
};

const loadCachedWordList = function () {
    const cached = safeJsonParse(localStorage.getItem(CACHE_KEY));
    if (!cached) return null;
    if (!Array.isArray(cached.words) || typeof cached.timestamp !== "number") return null;
    const isFresh = Date.now() - cached.timestamp < CACHE_TTL_MS;
    return isFresh ? cached.words : null;
};

const saveCachedWordList = function (words) {
    const payload = { timestamp: Date.now(), words };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
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

const fetchWordList = async function () {
    const cached = loadCachedWordList();
    if (cached) return cached;

    for (const url of WORDLIST_URLS) {
        try {
            const data = await fetchWithTimeout(url);
            if (Array.isArray(data)) {
                saveCachedWordList(data);
                return data;
            }
            if (data && Array.isArray(data.words)) {
                saveCachedWordList(data.words);
                return data.words;
            }
        } catch (error) {
            // Try next URL
        }
    }
    throw new Error("Unable to load word list");
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
    const panel = doc.createElement("div");
    panel.id = "hintAssistantPanel";
    const savedPos = (() => {
        try {
            return JSON.parse(localStorage.getItem(POS_KEY) || "{}");
        } catch (e) {
            return {};
        }
    })();
    panel.style.left = `${savedPos.left ?? 12}px`;
    panel.style.top = `${savedPos.top ?? 120}px`;

    const header = doc.createElement("div");
    header.id = "hintAssistantHeader";
    header.textContent = "Skribbl Hints";

    const actions = doc.createElement("div");
    actions.className = "hintAssistantActions";

    const status = doc.createElement("span");
    status.id = "hintAssistantStatus";
    status.textContent = "Loading word list...";

    const toggle = doc.createElement("button");
    toggle.id = "hintAssistantToggle";
    toggle.textContent = "–";

    actions.appendChild(status);
    actions.appendChild(toggle);
    header.appendChild(actions);

    const body = doc.createElement("div");
    body.id = "hintAssistantBody";

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

    panel.appendChild(header);
    panel.appendChild(body);

    return { panel, header, body, status, toggle, hintList, enableInput, search, langSelect, inner, savedPos };
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
    const containerSidebar = doc.body;

    if (!inputChat || !formChat) return null;

    const { panel, header, body, status, toggle, hintList, enableInput, search, langSelect, inner, savedPos } = createPanel(doc);
    containerSidebar.appendChild(panel);

    let enabled = localStorage.getItem(ENABLE_KEY) !== "0";
    let wordList = [];
    let lastPattern = "";
    let ready = false;
    const languageSelect = doc.querySelector("#item-settings-language");
    const storedLang = localStorage.getItem(LANG_KEY);

    const populateLangSelect = function () {
        const seen = new Set();
        const addOption = (value, label) => {
            if (seen.has(value)) return;
            const opt = doc.createElement("option");
            opt.value = value;
            opt.textContent = label;
            langSelect.appendChild(opt);
            seen.add(value);
        };

        if (languageSelect) {
            Array.from(languageSelect.options).forEach(opt => {
                const val = opt.value || opt.textContent || "unknown";
                addOption(val, opt.textContent || val);
            });
        }

        if (!seen.size) {
            addOption("0", "English");
            addOption("1", "German");
        }
    };

    const getLanguageLabel = function () {
        const manualOpt = langSelect.options[langSelect.selectedIndex];
        if (manualOpt) return (manualOpt.textContent || "Unknown").trim();
        return "Unknown";
    };

    const persistEnabled = function () {
        localStorage.setItem(ENABLE_KEY, enabled ? "1" : "0");
    };

    const updateEnabledUi = function () {
        toggle.textContent = panel.classList.contains("collapsed") ? "+" : "–";
        enableInput.checked = enabled;
        inner.style.display = enabled ? "" : "none";
        const langLabel = getLanguageLabel();
        if (!enabled) {
            status.textContent = `Hints disabled (Alt to enable) | Lang: ${langLabel}`;
            return;
        }
        if (ready) {
            status.textContent = `Loaded ${wordList.length} words | Lang: ${langLabel}`;
        }
    };

    toggle.addEventListener("click", () => {
        const isCollapsed = panel.classList.toggle("collapsed");
        toggle.textContent = isCollapsed ? "+" : "–";
    });

    const startDrag = function (event) {
        if (event.target !== header) return;
        event.preventDefault();
        const startX = event.clientX;
        const startY = event.clientY;
        const rect = panel.getBoundingClientRect();
        const startLeft = rect.left;
        const startTop = rect.top;

        const move = function (moveEvent) {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            const pw = panel.offsetWidth || 240;
            const ph = panel.offsetHeight || 200;
            const ww = window.innerWidth;
            const wh = window.innerHeight;
            let newLeft = Math.round(startLeft + dx);
            let newTop = Math.round(startTop + dy);
            newLeft = Math.max(8, Math.min(newLeft, ww - pw - 8));
            newTop = Math.max(8, Math.min(newTop, wh - ph - 8));
            panel.style.left = `${newLeft}px`;
            panel.style.top = `${newTop}px`;
        };

        const end = function () {
            doc.removeEventListener("mousemove", move);
            doc.removeEventListener("mouseup", end);
            try {
                localStorage.setItem(POS_KEY, JSON.stringify({
                    left: parseInt(panel.style.left, 10) || 12,
                    top: parseInt(panel.style.top, 10) || 120
                }));
            } catch (e) {
                /* ignore */
            }
        };

        doc.addEventListener("mousemove", move);
        doc.addEventListener("mouseup", end);
    };

    header.addEventListener("mousedown", startDrag);

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
        const gameWord = doc.getElementById("game-word");
        const desc = gameWord ? gameWord.querySelector(".description") : null;
        if (gameWord && desc) {
            if (inlineContainer.parentElement !== gameWord) {
                gameWord.insertBefore(inlineContainer, desc);
            }
        }
    };
    attachInline();

    const renderInlineTop = function (matches) {
        inlineContainer.innerHTML = "";
        if (!enabled) return;
        if (!matches.length) return;
        matches.slice(0, TOP_INLINE_RESULTS).forEach(word => {
            const chip = doc.createElement("button");
            chip.type = "button";
            chip.className = "hintAssistantInlineChip";
            chip.textContent = word;
            chip.title = "Click to fill. Ctrl/Cmd click submits.";
            chip.addEventListener("click", event => {
                if (!inputChat) return;
                inputChat.value = word;
                inputChat.focus();
                if (formChat) {
                    formChat.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
                }
            });
            inlineContainer.appendChild(chip);
        });
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

    fetchWordList()
        .then(words => {
            wordList = words;
            ready = true;
            status.textContent = `Loaded ${words.length} words | Lang: ${getLanguageLabel()}`;
            sync();
            updateEnabledUi();
        })
        .catch(() => {
            status.textContent = "Failed to load word list";
        });

    setInterval(sync, WORD_CHECK_INTERVAL_MS);

    doc.addEventListener("keyup", event => {
        if (event.key !== "Alt") return;
        enabled = !enabled;
        persistEnabled();
        lastPattern = ""; // force rerender inline/top3 on re-enable
        updateEnabledUi();
        sync();
    });

    enableInput.addEventListener("change", () => {
        enabled = enableInput.checked;
        persistEnabled();
        lastPattern = ""; // force rerender inline/top3 on re-enable
        updateEnabledUi();
        sync();
    });

    search.addEventListener("input", () => {
        lastPattern = ""; // force recompute with filter
        sync();
    });

    langSelect.addEventListener("change", () => {
        localStorage.setItem(LANG_KEY, langSelect.value || "");
        lastPattern = ""; // refresh inline/top3 after lang change
        updateEnabledUi();
        sync();
    });

    populateLangSelect();
    if (storedLang) {
        const opt = Array.from(langSelect.options).find(o => o.value === storedLang);
        if (opt) opt.selected = true;
    } else if (languageSelect) {
        langSelect.value = languageSelect.value;
    }

    updateEnabledUi();

    const observeLanguage = function () {
        if (!languageSelect) return;
        languageSelect.addEventListener("change", () => {
            if (!localStorage.getItem(LANG_KEY)) {
                langSelect.value = languageSelect.value;
            }
            updateEnabledUi();
            sync();
        });
    };

    observeLanguage();

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
