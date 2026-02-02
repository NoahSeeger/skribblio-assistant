const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const isFiniteNumber = value => typeof value === "number" && Number.isFinite(value);

const resolvePosition = (source, panel, fallback) => {
    if (typeof source === "function") {
        const result = source(panel);
        return typeof result === "object" && result ? result : fallback;
    }
    if (source && typeof source === "object") {
        return source;
    }
    return fallback;
};

export default function createFloatingPanel(doc, options = {}) {
    if (!doc) throw new Error("Document reference is required to create a floating panel.");

    const {
        id,
        title = "",
        parent = doc.body,
        panelClass = "",
        headerClass = "autoDrawHeader",
        headerId,
        bodyClass = "",
        bodyId,
        collapseClass = "autoDrawCollapse",
        collapseButtonId,
        initiallyCollapsed = false,
        initialPosition,
        getDefaultPosition,
        onPositionChange,
        onCollapsedChange,
        subtitle = "",
        zIndex
    } = options;

    const panel = doc.createElement("div");
    panel.id = id;
    panel.className = ["floatingPanel", panelClass].filter(Boolean).join(" ");
    if (typeof zIndex === "number") {
        panel.style.zIndex = String(zIndex);
    }

    const header = doc.createElement("div");
    header.className = ["autoDrawHeader", headerClass].filter(Boolean).join(" ");
    if (headerId) header.id = headerId;

    const titleWrapper = doc.createElement("div");
    titleWrapper.className = "floatingPanelHeaderTitle";

    const titleEl = doc.createElement("span");
    titleEl.className = "floatingPanelTitle";
    titleEl.textContent = title;

    const subtitleEl = doc.createElement("span");
    subtitleEl.className = "floatingPanelSubtitle";
    subtitleEl.textContent = subtitle;
    subtitleEl.hidden = !subtitle;

    titleWrapper.appendChild(titleEl);
    titleWrapper.appendChild(subtitleEl);

    const headerActions = doc.createElement("div");
    headerActions.className = "floatingPanelHeaderActions";

    const collapseButton = doc.createElement("button");
    collapseButton.type = "button";
    collapseButton.className = collapseClass;
    if (collapseButtonId) collapseButton.id = collapseButtonId;
    collapseButton.textContent = initiallyCollapsed ? "+" : "–";

    headerActions.appendChild(collapseButton);

    header.appendChild(titleWrapper);
    header.appendChild(headerActions);

    const body = doc.createElement("div");
    body.className = ["floatingPanelBody", bodyClass].filter(Boolean).join(" ");
    if (bodyId) body.id = bodyId;

    panel.appendChild(header);
    panel.appendChild(body);
    parent.appendChild(panel);

    if (initiallyCollapsed) {
        panel.classList.add("collapsed");
    }

    const defaultPositionFn = typeof getDefaultPosition === "function"
        ? getDefaultPosition
        : () => ({ left: 12, top: 120 });

    const clampPositionToViewport = pos => {
        const width = panel.offsetWidth || 280;
        const height = panel.offsetHeight || 200;
        const ww = window.innerWidth || (width + 16);
        const wh = window.innerHeight || (height + 16);
        const safeLeft = isFiniteNumber(pos?.left) ? pos.left : 12;
        const safeTop = isFiniteNumber(pos?.top) ? pos.top : 120;
        return {
            left: clamp(safeLeft, 8, Math.max(8, ww - width - 8)),
            top: clamp(safeTop, 8, Math.max(8, wh - height - 8))
        };
    };

    const initial = resolvePosition(initialPosition, panel, defaultPositionFn(panel));
    let position = clampPositionToViewport(initial);

    const applyPosition = next => {
        position = clampPositionToViewport(next || position);
        panel.style.left = `${position.left}px`;
        panel.style.top = `${position.top}px`;
    };

    applyPosition(position);

    const emitPosition = () => {
        if (typeof onPositionChange === "function") {
            onPositionChange({ ...position });
        }
    };

    const handleResize = () => {
        applyPosition(position);
        emitPosition();
    };

    window.addEventListener("resize", handleResize);

    const isInteractiveTarget = target => Boolean(target?.closest("button, input, select, textarea, a"));

    const startDrag = event => {
        if (event.button !== 0) return;
        if (isInteractiveTarget(event.target)) return;
        event.preventDefault();
        const startX = event.clientX;
        const startY = event.clientY;
        const rect = panel.getBoundingClientRect();
        const startLeft = rect.left;
        const startTop = rect.top;

        const move = moveEvent => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            applyPosition({
                left: startLeft + dx,
                top: startTop + dy
            });
        };

        const end = () => {
            doc.removeEventListener("mousemove", move);
            doc.removeEventListener("mouseup", end);
            emitPosition();
        };

        doc.addEventListener("mousemove", move);
        doc.addEventListener("mouseup", end);
    };

    header.addEventListener("mousedown", startDrag);

    // Double-click to reset position feature removed

    const setCollapsed = collapsed => {
        panel.classList.toggle("collapsed", collapsed);
        collapseButton.textContent = collapsed ? "+" : "–";
        if (typeof onCollapsedChange === "function") {
            onCollapsedChange(collapsed);
        }
    };

    collapseButton.addEventListener("click", () => {
        setCollapsed(!panel.classList.contains("collapsed"));
    });

    const setSubtitle = text => {
        subtitleEl.textContent = text || "";
        subtitleEl.hidden = !text;
    };

    const setTitle = text => {
        titleEl.textContent = text || "";
    };

    const destroy = () => {
        window.removeEventListener("resize", handleResize);
        header.removeEventListener("mousedown", startDrag);
    };

    return {
        panel,
        header,
        body,
        collapseButton,
        headerActions,
        titleEl,
        subtitleEl,
        setSubtitle,
        setTitle,
        setCollapsed,
        isCollapsed: () => panel.classList.contains("collapsed"),
        getPosition: () => ({ ...position }),
        destroy
    };
}
