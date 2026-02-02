import color from "color-diff";

export default function (rgbPalette) {
    let labPalette = rgbPalette
        .map(rgb => color.rgb_to_lab({ R: rgb.r, G: rgb.g, B: rgb.b }));

    return {
        getClosestColorIndex: function (rgb, cache) {
            let key = (rgb.r << 16) | (rgb.g << 8) | rgb.b;
            if (key in cache) return cache[key];

            let lab = color.rgb_to_lab({ R: rgb.r, G: rgb.g, B: rgb.b });
            let minDelta = Number.MAX_VALUE;
            let closestIndex = 0;

            for (let i = 0; i < labPalette.length; i++) {
                let delta = color.diff(lab, labPalette[i]);
                if (delta >= minDelta) continue;

                minDelta = delta;
                closestIndex = i;
            }

            cache[key] = closestIndex;
            return closestIndex;
        },
        getClosestColor: function (rgb, cache) {
            return rgbPalette[this.getClosestColorIndex(rgb, cache)];
        },
        getColor: index => rgbPalette[index]
    }
};
