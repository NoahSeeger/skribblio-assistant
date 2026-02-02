import createColorPalette from "./color-palette";
import { fitImage, fillImage } from "./image-helper";
import log from "./log";

const nominalPenDiameter = 4;
// Treat the pen like it's smaller to prevent blank horizontal lines.
const realPenDiameter = 2.9;

const qualityScaleMap = [0.35, 0.6, 0.9, 1.2, 1.6];
const minQualityScale = 0.2;
const maxQualityScale = 2;
const fillSettings = {
    minRatio: 0.45,
    edgeAgreementRatio: 0.75,
    lightBackgroundLuma: 190,
    darkBackgroundLuma: 65
};
const backgroundSampleStops = [0, 0.25, 0.5, 0.75, 1];

const quantize = function (value, bits) {
    const shift = 8 - bits;
    if (shift <= 0) return value;
    const rounded = (value + (1 << (shift - 1))) >> shift;
    return Math.max(0, Math.min(255, rounded << shift));
};

const pickPenDiameter = function (length, penMode) {
    if (penMode !== "fast") return nominalPenDiameter;

    if (length >= 200) return 40;
    if (length >= 120) return 32;
    if (length >= 60) return 20;
    if (length >= 30) return 10;
    return nominalPenDiameter;
};

const getLuma = function (color) {
    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
};

export default function (canvas, toolbar) {
    const colorPalette = createColorPalette(toolbar.getColors());
    const availablePenDiameters = toolbar.getPenDiameters()
        .slice()
        .sort((a, b) => a - b);

    const clampQualityScale = function (scale) {
        if (!Number.isFinite(scale) || scale <= 0) return 1;
        return Math.max(minQualityScale, Math.min(maxQualityScale, scale));
    };

    const snapPenDiameter = function (diameter) {
        let closest = availablePenDiameters[0];
        let smallestDiff = Math.abs(closest - diameter);
        for (const candidate of availablePenDiameters) {
            const diff = Math.abs(candidate - diameter);
            if (diff < smallestDiff) {
                closest = candidate;
                smallestDiff = diff;
            }
        }
        return closest;
    };

    const getMostCommonColorInfo = function (lines) {
        const counts = new Array(toolbar.getColors().length).fill(0);
        let total = 0;
        for (const line of lines) {
            const weight = line.endX - line.startX + 1;
            counts[line.colorIndex] += weight;
            total += weight;
        }

        let bestIndex = 0;
        let bestScore = -1;
        for (let i = 0; i < counts.length; i++) {
            if (counts[i] > bestScore) {
                bestScore = counts[i];
                bestIndex = i;
            }
        }

        const ratio = total > 0 ? bestScore / total : 0;
        return { index: bestIndex, ratio, source: "dominant" };
    };

    const fillCanvas = function (color) {
        return [
            function () {
                toolbar.setFillTool();
                toolbar.setColor(color);
                canvas.draw([
                    { x: 0, y: 0 },
                    { x: 0, y: 0 }
                ]);
            }
        ];
    };

    const getEdgeSampleCoordinates = function (width, height) {
        if (!width || !height) return [];
        const coords = [];
        const maxX = width - 1;
        const maxY = height - 1;
        for (const stop of backgroundSampleStops) {
            const x = Math.round(maxX * stop);
            const y = Math.round(maxY * stop);
            coords.push({ x, y: 0 });
            coords.push({ x, y: maxY });
            coords.push({ x: 0, y });
            coords.push({ x: maxX, y });
        }

        const unique = new Map();
        for (const coord of coords) {
            const key = `${coord.x},${coord.y}`;
            if (!unique.has(key)) unique.set(key, coord);
        }

        return Array.from(unique.values());
    };

    const sampleColorIndexAt = function (image, x, y, options, colorCache) {
        if (!image.width || !image.height) return 0;
        const clampedX = Math.max(0, Math.min(image.width - 1, Math.round(x)));
        const clampedY = Math.max(0, Math.min(image.height - 1, Math.round(y)));
        const offset = (clampedY * image.width + clampedX) * 4;
        const data = image.data;
        const pixelColor = {
            r: quantize(data[offset + 0], options.colorQuantization),
            g: quantize(data[offset + 1], options.colorQuantization),
            b: quantize(data[offset + 2], options.colorQuantization)
        };
        return colorPalette.getClosestColorIndex(pixelColor, colorCache);
    };

    const detectEdgeBackgroundIndex = function (image, options, colorCache) {
        const coords = getEdgeSampleCoordinates(image.width, image.height);
        if (!coords.length) return null;

        const counts = new Map();
        for (const coord of coords) {
            const colorIndex = sampleColorIndexAt(image, coord.x, coord.y, options, colorCache);
            counts.set(colorIndex, (counts.get(colorIndex) || 0) + 1);
        }

        const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
        if (!sorted.length) return null;

        const [bestIndex, bestCount] = sorted[0];
        const ratio = bestCount / coords.length;
        if (ratio >= fillSettings.edgeAgreementRatio) {
            return { index: bestIndex, ratio, source: "edge" };
        }

        return null;
    };

    const extractLines = function (image, options, colorCache) {
        const data = image.data;
        const lines = [];

        let i = 0;
        for (let y = 0; y < image.height; y++) {
            let lineStartX = 0;
            let lineColorIndex = null;

            for (let x = 0; x < image.width; x++, i += 4) {
                const pixelColor = {
                    r: quantize(data[i + 0], options.colorQuantization),
                    g: quantize(data[i + 1], options.colorQuantization),
                    b: quantize(data[i + 2], options.colorQuantization)
                };

                const colorIndex = colorPalette.getClosestColorIndex(pixelColor, colorCache);

                if (lineColorIndex === null) {
                    lineColorIndex = colorIndex;
                    lineStartX = x;
                    continue;
                }

                if (lineColorIndex !== colorIndex) {
                    lines.push({ y: y, startX: lineStartX, endX: x - 1, colorIndex: lineColorIndex });
                    lineStartX = x;
                    lineColorIndex = colorIndex;
                }
            }

            if (lineColorIndex !== null) {
                lines.push({ y: y, startX: lineStartX, endX: image.width - 1, colorIndex: lineColorIndex });
            }
        }

        return lines;
    };

    const drawLines = function (lines, offset, options, state, scale) {
        const commands = [];
        const scaleX = scale?.x ?? 1;
        const scaleY = scale?.y ?? 1;
        const coverageScale = options.penMode === "fast" ? Math.max(scaleY, 0.25) : 1;

        for (const line of lines) {
            const length = (line.endX - line.startX + 1) * scaleX;
            const basePenDiameter = pickPenDiameter(length, options.penMode);
            const penDiameter = snapPenDiameter(basePenDiameter * coverageScale);
            const color = colorPalette.getColor(line.colorIndex);

            commands.push(function () {
                if (state.tool !== "pen") {
                    toolbar.setPenTool();
                    state.tool = "pen";
                }
                if (state.colorIndex !== line.colorIndex) {
                    toolbar.setColor(color);
                    state.colorIndex = line.colorIndex;
                }
                if (state.penDiameter !== penDiameter) {
                    toolbar.setPenDiameter(penDiameter);
                    state.penDiameter = penDiameter;
                }
                const startX = (line.startX + offset.x) * scaleX;
                const endX = (line.endX + offset.x) * scaleX;
                const y = (line.y + offset.y) * scaleY;
                canvas.draw([
                    { x: startX * realPenDiameter, y: y * realPenDiameter },
                    { x: endX * realPenDiameter, y: y * realPenDiameter }
                ]);
            });
        }

        return commands;
    };

    return {
        draw: function (image, options) {
            const unclampedQualityScale = qualityScaleMap[options.quality - 1] || 0.7;
            const qualityScale = clampQualityScale(unclampedQualityScale);
            const maxDrawingSize = {
                width: canvas.size.width / realPenDiameter,
                height: canvas.size.height / realPenDiameter
            };
            const samplingSize = {
                width: Math.max(8, Math.round(maxDrawingSize.width * qualityScale)),
                height: Math.max(8, Math.round(maxDrawingSize.height * qualityScale))
            };
            const scaleMultiplier = {
                x: maxDrawingSize.width / samplingSize.width,
                y: maxDrawingSize.height / samplingSize.height
            };

            const scaleImage = options.scaleMode === "fill" ? fillImage : fitImage;
            const scaledImage = scaleImage(samplingSize, image);

            log("Generating draw commands...");
            let commands = [];

            const colorCache = {};
            const allLines = extractLines(scaledImage, options, colorCache);
            const edgeFillInfo = options.enableFill ? detectEdgeBackgroundIndex(scaledImage, options, colorCache) : null;
            const dominantFillInfo = getMostCommonColorInfo(allLines);
            const fillInfo = edgeFillInfo || dominantFillInfo;
            const fillColorIndex = fillInfo ? fillInfo.index : null;
            const fillColor = fillColorIndex != null ? colorPalette.getColor(fillColorIndex) : null;
            const fillLuma = fillColor ? getLuma(fillColor) : 0;
            const meetsRatioRequirement = fillInfo && (fillInfo.source === "edge" || fillInfo.ratio >= fillSettings.minRatio);
            const hasHighContrastBackground = fillColor
                && (fillLuma >= fillSettings.lightBackgroundLuma || fillLuma <= fillSettings.darkBackgroundLuma);
            const shouldFill = Boolean(options.enableFill && fillColor && meetsRatioRequirement && hasHighContrastBackground);

            if (shouldFill && fillColor) {
                commands = commands.concat(fillCanvas(fillColor));
            }

            // Don't need to draw lines that match the fill color.
            const filteredLines = shouldFill && fillColorIndex != null
                ? allLines.filter(line => line.colorIndex !== fillColorIndex)
                : allLines;

            let sortedLines = filteredLines;

            if (options.colorBatching) {
                const buckets = new Map();
                for (const line of filteredLines) {
                    if (!buckets.has(line.colorIndex)) buckets.set(line.colorIndex, []);
                    buckets.get(line.colorIndex).push(line);
                }

                const orderedBuckets = Array.from(buckets.values())
                    .sort((a, b) => b.length - a.length);

                sortedLines = orderedBuckets.flatMap(bucket =>
                    bucket.sort((l1, l2) => (l2.endX - l2.startX) - (l1.endX - l1.startX))
                );
            } else {
                sortedLines = filteredLines
                    // Randomize drawing order so the overall image fills in evenly.
                    .sort(() => 0.5 - Math.random())
                    // Long and short lines take the same time to draw. Draw long ones first so the image fills in faster.
                    .sort((l1, l2) => {
                        const length1 = l1.endX - l1.startX;
                        const length2 = l2.endX - l2.startX;
                        return length1 > length2 ? -1 : length1 == length2 ? 0 : 1;
                    });
            }

            let drawingOffset = {
                x: (samplingSize.width - scaledImage.width) / 2 + 0.5,
                y: (samplingSize.height - scaledImage.height) / 2 + 0.5
            };
            const drawState = { tool: null, colorIndex: null, penDiameter: null };
            commands = commands.concat(drawLines(sortedLines, drawingOffset, options, drawState, scaleMultiplier));

            log(`${commands.length} commands generated.`);
            return commands;
        }
    };
};
