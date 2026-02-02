export function getImgFileUrl(dataTransfer) {
    if (!dataTransfer.files.length) return null;

    let file = dataTransfer.files[0];
    if (!file.type.startsWith("image/")) return null;

    return URL.createObjectURL(dataTransfer.files[0]);
};

export function getClipboardImgUrl(clipboardData) {
    if (!clipboardData || !clipboardData.items) return null;

    for (const item of clipboardData.items) {
        if (item.type && item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (!file) continue;
            return URL.createObjectURL(file);
        }
    }

    return null;
}

export function getImgElementSrc(dataTransfer) {
    let html = dataTransfer.getData("text/html");
    if (!html) return null;

    let container = document.createElement("div");
    container.innerHTML = html;

    let imgs = container.getElementsByTagName("img");
    if (!imgs.length) return;

    return imgs[0].getAttribute("src");
};
