(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/color-diff/lib/diff.js
  var require_diff = __commonJS({
    "node_modules/color-diff/lib/diff.js"(exports) {
      exports.ciede2000 = ciede2000;
      var sqrt = Math.sqrt;
      var pow = Math.pow;
      var cos = Math.cos;
      var atan2 = Math.atan2;
      var sin = Math.sin;
      var abs = Math.abs;
      var exp = Math.exp;
      var PI = Math.PI;
      function ciede2000(c1, c2) {
        var L1 = c1.L;
        var a1 = c1.a;
        var b1 = c1.b;
        var L2 = c2.L;
        var a2 = c2.a;
        var b2 = c2.b;
        var kL = 1;
        var kC = 1;
        var kH = 1;
        var C1 = sqrt(pow(a1, 2) + pow(b1, 2));
        var C2 = sqrt(pow(a2, 2) + pow(b2, 2));
        var a_C1_C2 = (C1 + C2) / 2;
        var G = 0.5 * (1 - sqrt(pow(a_C1_C2, 7) / (pow(a_C1_C2, 7) + pow(25, 7))));
        var a1p = (1 + G) * a1;
        var a2p = (1 + G) * a2;
        var C1p = sqrt(pow(a1p, 2) + pow(b1, 2));
        var C2p = sqrt(pow(a2p, 2) + pow(b2, 2));
        var h1p = hp_f(b1, a1p);
        var h2p = hp_f(b2, a2p);
        var dLp = L2 - L1;
        var dCp = C2p - C1p;
        var dhp = dhp_f(C1, C2, h1p, h2p);
        var dHp = 2 * sqrt(C1p * C2p) * sin(radians(dhp) / 2);
        var a_L = (L1 + L2) / 2;
        var a_Cp = (C1p + C2p) / 2;
        var a_hp = a_hp_f(C1, C2, h1p, h2p);
        var T = 1 - 0.17 * cos(radians(a_hp - 30)) + 0.24 * cos(radians(2 * a_hp)) + 0.32 * cos(radians(3 * a_hp + 6)) - 0.2 * cos(radians(4 * a_hp - 63));
        var d_ro = 30 * exp(-pow((a_hp - 275) / 25, 2));
        var RC = sqrt(pow(a_Cp, 7) / (pow(a_Cp, 7) + pow(25, 7)));
        var SL = 1 + 0.015 * pow(a_L - 50, 2) / sqrt(20 + pow(a_L - 50, 2));
        var SC = 1 + 0.045 * a_Cp;
        var SH = 1 + 0.015 * a_Cp * T;
        var RT = -2 * RC * sin(radians(2 * d_ro));
        var dE = sqrt(pow(dLp / (SL * kL), 2) + pow(dCp / (SC * kC), 2) + pow(dHp / (SH * kH), 2) + RT * (dCp / (SC * kC)) * (dHp / (SH * kH)));
        return dE;
      }
      function degrees(n) {
        return n * (180 / PI);
      }
      function radians(n) {
        return n * (PI / 180);
      }
      function hp_f(x, y) {
        if (x === 0 && y === 0) return 0;
        else {
          var tmphp = degrees(atan2(x, y));
          if (tmphp >= 0) return tmphp;
          else return tmphp + 360;
        }
      }
      function dhp_f(C1, C2, h1p, h2p) {
        if (C1 * C2 === 0) return 0;
        else if (abs(h2p - h1p) <= 180) return h2p - h1p;
        else if (h2p - h1p > 180) return h2p - h1p - 360;
        else if (h2p - h1p < -180) return h2p - h1p + 360;
        else throw new Error();
      }
      function a_hp_f(C1, C2, h1p, h2p) {
        if (C1 * C2 === 0) return h1p + h2p;
        else if (abs(h1p - h2p) <= 180) return (h1p + h2p) / 2;
        else if (abs(h1p - h2p) > 180 && h1p + h2p < 360) return (h1p + h2p + 360) / 2;
        else if (abs(h1p - h2p) > 180 && h1p + h2p >= 360) return (h1p + h2p - 360) / 2;
        else throw new Error();
      }
    }
  });

  // node_modules/color-diff/lib/convert.js
  var require_convert = __commonJS({
    "node_modules/color-diff/lib/convert.js"(exports) {
      exports.rgb_to_lab = rgb_to_lab;
      exports.rgba_to_lab = rgba_to_lab;
      var pow = Math.pow;
      function rgba_to_lab(c, bc) {
        var bc = typeof bc !== "undefined" ? bc : { R: 255, G: 255, B: 255 };
        var new_c = {
          R: bc.R + (c.R - bc.R) * c.A,
          G: bc.G + (c.G - bc.G) * c.A,
          B: bc.B + (c.B - bc.B) * c.A
        };
        return rgb_to_lab(new_c);
      }
      function rgb_to_lab(c) {
        return xyz_to_lab(rgb_to_xyz(c));
      }
      function rgb_to_xyz(c) {
        var R = c.R / 255;
        var G = c.G / 255;
        var B = c.B / 255;
        if (R > 0.04045) R = pow((R + 0.055) / 1.055, 2.4);
        else R = R / 12.92;
        if (G > 0.04045) G = pow((G + 0.055) / 1.055, 2.4);
        else G = G / 12.92;
        if (B > 0.04045) B = pow((B + 0.055) / 1.055, 2.4);
        else B = B / 12.92;
        R *= 100;
        G *= 100;
        B *= 100;
        var X = R * 0.4124 + G * 0.3576 + B * 0.1805;
        var Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
        var Z = R * 0.0193 + G * 0.1192 + B * 0.9505;
        return { "X": X, "Y": Y, "Z": Z };
      }
      function xyz_to_lab(c) {
        var ref_Y = 100;
        var ref_Z = 108.883;
        var ref_X = 95.047;
        var Y = c.Y / ref_Y;
        var Z = c.Z / ref_Z;
        var X = c.X / ref_X;
        if (X > 8856e-6) X = pow(X, 1 / 3);
        else X = 7.787 * X + 16 / 116;
        if (Y > 8856e-6) Y = pow(Y, 1 / 3);
        else Y = 7.787 * Y + 16 / 116;
        if (Z > 8856e-6) Z = pow(Z, 1 / 3);
        else Z = 7.787 * Z + 16 / 116;
        var L = 116 * Y - 16;
        var a = 500 * (X - Y);
        var b = 200 * (Y - Z);
        return { "L": L, "a": a, "b": b };
      }
    }
  });

  // node_modules/color-diff/lib/palette.js
  var require_palette = __commonJS({
    "node_modules/color-diff/lib/palette.js"(exports) {
      exports.map_palette = map_palette;
      exports.map_palette_lab = map_palette_lab;
      exports.match_palette_lab = match_palette_lab;
      exports.palette_map_key = palette_map_key;
      exports.lab_palette_map_key = lab_palette_map_key;
      var ciede2000 = require_diff().ciede2000;
      var color_convert = require_convert();
      function palette_map_key(c) {
        var s = "R" + c.R + "B" + c.B + "G" + c.G;
        if ("A" in c) {
          s = s + "A" + c.A;
        }
        return s;
      }
      function lab_palette_map_key(c) {
        return "L" + c.L + "a" + c.a + "b" + c.b;
      }
      function map_palette(a, b, type, bc) {
        var c = {};
        bc = typeof bc !== "undefined" ? bc : { R: 255, G: 255, B: 255 };
        type = type || "closest";
        for (var idx1 = 0; idx1 < a.length; idx1 += 1) {
          var color1 = a[idx1];
          var best_color = void 0;
          var best_color_diff = void 0;
          for (var idx2 = 0; idx2 < b.length; idx2 += 1) {
            var color2 = b[idx2];
            var current_color_diff = diff(color1, color2, bc);
            if (best_color == void 0 || type === "closest" && current_color_diff < best_color_diff) {
              best_color = color2;
              best_color_diff = current_color_diff;
              continue;
            }
            if (type === "furthest" && current_color_diff > best_color_diff) {
              best_color = color2;
              best_color_diff = current_color_diff;
              continue;
            }
          }
          c[palette_map_key(color1)] = best_color;
        }
        return c;
      }
      function match_palette_lab(target_color, palette, find_furthest) {
        var color2, current_color_diff;
        var best_color = palette[0];
        var best_color_diff = ciede2000(target_color, best_color);
        for (var idx2 = 1, l = palette.length; idx2 < l; idx2 += 1) {
          color2 = palette[idx2];
          current_color_diff = ciede2000(target_color, color2);
          if (!find_furthest && current_color_diff < best_color_diff || find_furthest && current_color_diff > best_color_diff) {
            best_color = color2;
            best_color_diff = current_color_diff;
          }
        }
        return best_color;
      }
      function map_palette_lab(a, b, type) {
        var c = {};
        var find_furthest = type === "furthest";
        for (var idx1 = 0; idx1 < a.length; idx1 += 1) {
          var color1 = a[idx1];
          c[lab_palette_map_key(color1)] = match_palette_lab(color1, b, find_furthest);
        }
        return c;
      }
      function diff(c1, c2, bc) {
        var conv_c1 = color_convert.rgb_to_lab;
        var conv_c2 = color_convert.rgb_to_lab;
        var rgba_conv = function(x) {
          return color_convert.rgba_to_lab(x, bc);
        };
        if ("A" in c1) {
          conv_c1 = rgba_conv;
        }
        if ("A" in c2) {
          conv_c2 = rgba_conv;
        }
        c1 = conv_c1(c1);
        c2 = conv_c2(c2);
        return ciede2000(c1, c2);
      }
    }
  });

  // node_modules/color-diff/lib/index.js
  var require_lib = __commonJS({
    "node_modules/color-diff/lib/index.js"(exports, module) {
      "use strict";
      var diff = require_diff();
      var convert = require_convert();
      var palette = require_palette();
      var color2 = module.exports = {};
      color2.diff = diff.ciede2000;
      color2.rgb_to_lab = convert.rgb_to_lab;
      color2.rgba_to_lab = convert.rgba_to_lab;
      color2.map_palette = palette.map_palette;
      color2.palette_map_key = palette.palette_map_key;
      color2.map_palette_lab = palette.map_palette_lab;
      color2.lab_palette_map_key = palette.lab_palette_map_key;
      color2.match_palette_lab = palette.match_palette_lab;
      color2.closest = function(target, relative, bc) {
        var key = color2.palette_map_key(target);
        bc = typeof bc !== "undefined" ? bc : { R: 255, G: 255, B: 255 };
        var result = color2.map_palette([target], relative, "closest", bc);
        return result[key];
      };
      color2.furthest = function(target, relative, bc) {
        var key = color2.palette_map_key(target);
        bc = typeof bc !== "undefined" ? bc : { R: 255, G: 255, B: 255 };
        var result = color2.map_palette([target], relative, "furthest", bc);
        return result[key];
      };
      color2.closest_lab = function(target, relative) {
        return color2.match_palette_lab(target, relative, false);
      };
      color2.furthest_lab = function(target, relative) {
        return color2.match_palette_lab(target, relative, true);
      };
    }
  });

  // src/canvas.js
  function canvas_default(canvasElement) {
    const context = canvasElement.getContext("2d");
    let getMouseCoords = function(canvasCoords) {
      let bounds = canvasElement.getBoundingClientRect();
      return {
        x: canvasCoords.x * bounds.width / 800 + bounds.x,
        y: canvasCoords.y * bounds.height / 600 + bounds.y
      };
    };
    let createMouseEvent = function(name, coords) {
      return new PointerEvent(name, {
        pointerId: 1,
        pointerType: "mouse",
        bubbles: true,
        clientX: coords.x,
        clientY: coords.y,
        button: 0
        // Left click
      });
    };
    return {
      size: { width: 800, height: 600 },
      draw: function(coords) {
        let startMouseCoords = getMouseCoords(coords[0]);
        canvasElement.dispatchEvent(createMouseEvent("pointerdown", startMouseCoords));
        for (let i = 1; i < coords.length; i++) {
          let mouseCoords = getMouseCoords(coords[i]);
          canvasElement.dispatchEvent(createMouseEvent("pointermove", mouseCoords));
        }
        let endMouseCoords = getMouseCoords(coords[coords.length - 1]);
        canvasElement.dispatchEvent(createMouseEvent("pointerup", endMouseCoords));
      }
    };
  }

  // src/toolbar.js
  var toRgbObject = function(rgbString) {
    let parts = rgbString.substring(4, rgbString.length - 1).split(", ");
    return { r: parseInt(parts[0]), g: parseInt(parts[1]), b: parseInt(parts[2]) };
  };
  var toRgbString = function(rgbObject) {
    return `rgb(${rgbObject.r}, ${rgbObject.g}, ${rgbObject.b})`;
  };
  function toolbar_default(domHelper2) {
    let colorElements = Array.prototype.slice.call(domHelper2.getColorElements());
    let colors = colorElements.map((e) => toRgbObject(e.style.backgroundColor));
    let colorElementsLookup = new Map(colorElements.map((e) => [e.style.backgroundColor, e]));
    let sizeElements = domHelper2.getSizeElements();
    let sizeElementsLookup = {
      4: sizeElements[0],
      10: sizeElements[1],
      20: sizeElements[2],
      32: sizeElements[3],
      40: sizeElements[4]
    };
    return {
      getColors: () => colors,
      setColor: (color2) => {
        let rgbString = toRgbString(color2);
        let colorElement = colorElementsLookup.get(rgbString);
        colorElement.dispatchEvent(new PointerEvent("pointerdown"));
      },
      getPenDiameters: () => [4, 10, 20, 32, 40],
      setPenDiameter: (diameter) => {
        sizeElementsLookup[diameter].click();
      },
      clear: () => {
        domHelper2.getClearToolElement().click();
      },
      setPenTool: () => {
        domHelper2.getPenToolElement().click();
      },
      setFillTool: () => {
        domHelper2.getFillToolElement().click();
      },
      isEnabled: () => domHelper2.getToolbarElement().style.display !== "none"
    };
  }

  // src/color-palette.js
  var import_color_diff = __toESM(require_lib());
  function color_palette_default(rgbPalette) {
    let labPalette = rgbPalette.map((rgb) => import_color_diff.default.rgb_to_lab({ R: rgb.r, G: rgb.g, B: rgb.b }));
    return {
      getClosestColorIndex: function(rgb, cache) {
        let key = rgb.r << 16 | rgb.g << 8 | rgb.b;
        if (key in cache) return cache[key];
        let lab = import_color_diff.default.rgb_to_lab({ R: rgb.r, G: rgb.g, B: rgb.b });
        let minDelta = Number.MAX_VALUE;
        let closestIndex = 0;
        for (let i = 0; i < labPalette.length; i++) {
          let delta = import_color_diff.default.diff(lab, labPalette[i]);
          if (delta >= minDelta) continue;
          minDelta = delta;
          closestIndex = i;
        }
        cache[key] = closestIndex;
        return closestIndex;
      },
      getClosestColor: function(rgb, cache) {
        return rgbPalette[this.getClosestColorIndex(rgb, cache)];
      },
      getColor: (index) => rgbPalette[index]
    };
  }

  // src/log.js
  function log_default(message) {
    if (!loggingEnabled) return;
    console.log(`skribbl.io AutoDraw: ${message}`);
  }
  var setLoggingEnabled = function(enabled) {
    loggingEnabled = Boolean(enabled);
  };
  var loggingEnabled = false;

  // src/image-helper.js
  function fillImage(size, image) {
    let factor = Math.max(size.width / image.width, size.height / image.height);
    let dw = factor * image.width;
    let dh = factor * image.height;
    let dx = (size.width - dw) / 2;
    let dy = (size.height - dh) / 2;
    return scale(size, (ctx) => ctx.drawImage(image, dx, dy, dw, dh));
  }
  function fitImage(size, image) {
    let factor = Math.min(size.width / image.width, size.height / image.height);
    let dw = factor * image.width;
    let dh = factor * image.height;
    return scale({ width: dw, height: dh }, (ctx) => ctx.drawImage(image, 0, 0, dw, dh));
  }
  var scale = function(size, draw) {
    log_default(`Scaling image to ${size.width} x ${size.height}...`);
    let canvas2 = document.createElement("canvas");
    canvas2.width = size.width;
    canvas2.height = size.height;
    let context = canvas2.getContext("2d");
    context.imageSmoothingEnabled = false;
    draw(context);
    return context.getImageData(0, 0, canvas2.width, canvas2.height);
  };
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.onload = function() {
        const blockedByCors = image.height === 0 && image.width === 0;
        const executor = blockedByCors ? reject : resolve;
        executor(image);
      };
      image.onerror = reject;
      log_default(`Attempting to load image: ${url}...`);
      image.src = url;
    });
  }

  // src/artist.js
  var nominalPenDiameter = 4;
  var realPenDiameter = 2.9;
  var qualityScaleMap = [0.35, 0.6, 0.9, 1.2, 1.6];
  var minQualityScale = 0.2;
  var maxQualityScale = 2;
  var fillSettings = {
    minRatio: 0.45,
    edgeAgreementRatio: 0.75,
    lightBackgroundLuma: 190,
    darkBackgroundLuma: 65
  };
  var backgroundSampleStops = [0, 0.25, 0.5, 0.75, 1];
  var quantize = function(value, bits) {
    const shift = 8 - bits;
    if (shift <= 0) return value;
    const rounded = value + (1 << shift - 1) >> shift;
    return Math.max(0, Math.min(255, rounded << shift));
  };
  var pickPenDiameter = function(length, penMode) {
    if (penMode !== "fast") return nominalPenDiameter;
    if (length >= 200) return 40;
    if (length >= 120) return 32;
    if (length >= 60) return 20;
    if (length >= 30) return 10;
    return nominalPenDiameter;
  };
  var getLuma = function(color2) {
    return 0.2126 * color2.r + 0.7152 * color2.g + 0.0722 * color2.b;
  };
  function artist_default(canvas2, toolbar2) {
    const colorPalette = color_palette_default(toolbar2.getColors());
    const availablePenDiameters = toolbar2.getPenDiameters().slice().sort((a, b) => a - b);
    const clampQualityScale = function(scale2) {
      if (!Number.isFinite(scale2) || scale2 <= 0) return 1;
      return Math.max(minQualityScale, Math.min(maxQualityScale, scale2));
    };
    const snapPenDiameter = function(diameter) {
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
    const getMostCommonColorInfo = function(lines) {
      const counts = new Array(toolbar2.getColors().length).fill(0);
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
    const fillCanvas = function(color2) {
      return [
        function() {
          toolbar2.setFillTool();
          toolbar2.setColor(color2);
          canvas2.draw([
            { x: 0, y: 0 },
            { x: 0, y: 0 }
          ]);
        }
      ];
    };
    const getEdgeSampleCoordinates = function(width, height) {
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
      const unique = /* @__PURE__ */ new Map();
      for (const coord of coords) {
        const key = `${coord.x},${coord.y}`;
        if (!unique.has(key)) unique.set(key, coord);
      }
      return Array.from(unique.values());
    };
    const sampleColorIndexAt = function(image, x, y, options, colorCache) {
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
    const detectEdgeBackgroundIndex = function(image, options, colorCache) {
      const coords = getEdgeSampleCoordinates(image.width, image.height);
      if (!coords.length) return null;
      const counts = /* @__PURE__ */ new Map();
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
    const extractLines = function(image, options, colorCache) {
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
            lines.push({ y, startX: lineStartX, endX: x - 1, colorIndex: lineColorIndex });
            lineStartX = x;
            lineColorIndex = colorIndex;
          }
        }
        if (lineColorIndex !== null) {
          lines.push({ y, startX: lineStartX, endX: image.width - 1, colorIndex: lineColorIndex });
        }
      }
      return lines;
    };
    const drawLines = function(lines, offset, options, state, scale2) {
      const commands2 = [];
      const scaleX = scale2?.x ?? 1;
      const scaleY = scale2?.y ?? 1;
      const coverageScale = options.penMode === "fast" ? Math.max(scaleY, 0.25) : 1;
      for (const line of lines) {
        const length = (line.endX - line.startX + 1) * scaleX;
        const basePenDiameter = pickPenDiameter(length, options.penMode);
        const penDiameter = snapPenDiameter(basePenDiameter * coverageScale);
        const color2 = colorPalette.getColor(line.colorIndex);
        commands2.push(function() {
          if (state.tool !== "pen") {
            toolbar2.setPenTool();
            state.tool = "pen";
          }
          if (state.colorIndex !== line.colorIndex) {
            toolbar2.setColor(color2);
            state.colorIndex = line.colorIndex;
          }
          if (state.penDiameter !== penDiameter) {
            toolbar2.setPenDiameter(penDiameter);
            state.penDiameter = penDiameter;
          }
          const startX = (line.startX + offset.x) * scaleX;
          const endX = (line.endX + offset.x) * scaleX;
          const y = (line.y + offset.y) * scaleY;
          canvas2.draw([
            { x: startX * realPenDiameter, y: y * realPenDiameter },
            { x: endX * realPenDiameter, y: y * realPenDiameter }
          ]);
        });
      }
      return commands2;
    };
    return {
      draw: function(image, options) {
        const unclampedQualityScale = qualityScaleMap[options.quality - 1] || 0.7;
        const qualityScale = clampQualityScale(unclampedQualityScale);
        const maxDrawingSize = {
          width: canvas2.size.width / realPenDiameter,
          height: canvas2.size.height / realPenDiameter
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
        log_default("Generating draw commands...");
        let commands2 = [];
        const colorCache = {};
        const allLines = extractLines(scaledImage, options, colorCache);
        const edgeFillInfo = options.enableFill ? detectEdgeBackgroundIndex(scaledImage, options, colorCache) : null;
        const dominantFillInfo = getMostCommonColorInfo(allLines);
        const fillInfo = edgeFillInfo || dominantFillInfo;
        const fillColorIndex = fillInfo ? fillInfo.index : null;
        const fillColor = fillColorIndex != null ? colorPalette.getColor(fillColorIndex) : null;
        const fillLuma = fillColor ? getLuma(fillColor) : 0;
        const meetsRatioRequirement = fillInfo && (fillInfo.source === "edge" || fillInfo.ratio >= fillSettings.minRatio);
        const hasHighContrastBackground = fillColor && (fillLuma >= fillSettings.lightBackgroundLuma || fillLuma <= fillSettings.darkBackgroundLuma);
        const shouldFill = Boolean(options.enableFill && fillColor && meetsRatioRequirement && hasHighContrastBackground);
        if (shouldFill && fillColor) {
          commands2 = commands2.concat(fillCanvas(fillColor));
        }
        const filteredLines = shouldFill && fillColorIndex != null ? allLines.filter((line) => line.colorIndex !== fillColorIndex) : allLines;
        let sortedLines = filteredLines;
        if (options.colorBatching) {
          const buckets = /* @__PURE__ */ new Map();
          for (const line of filteredLines) {
            if (!buckets.has(line.colorIndex)) buckets.set(line.colorIndex, []);
            buckets.get(line.colorIndex).push(line);
          }
          const orderedBuckets = Array.from(buckets.values()).sort((a, b) => b.length - a.length);
          sortedLines = orderedBuckets.flatMap(
            (bucket) => bucket.sort((l1, l2) => l2.endX - l2.startX - (l1.endX - l1.startX))
          );
        } else {
          sortedLines = filteredLines.sort(() => 0.5 - Math.random()).sort((l1, l2) => {
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
        commands2 = commands2.concat(drawLines(sortedLines, drawingOffset, options, drawState, scaleMultiplier));
        log_default(`${commands2.length} commands generated.`);
        return commands2;
      }
    };
  }

  // src/data-transfer-helper.js
  function getImgFileUrl(dataTransfer) {
    if (!dataTransfer.files.length) return null;
    let file = dataTransfer.files[0];
    if (!file.type.startsWith("image/")) return null;
    return URL.createObjectURL(dataTransfer.files[0]);
  }
  function getClipboardImgUrl(clipboardData) {
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
  function getImgElementSrc(dataTransfer) {
    let html = dataTransfer.getData("text/html");
    if (!html) return null;
    let container = document.createElement("div");
    container.innerHTML = html;
    let imgs = container.getElementsByTagName("img");
    if (!imgs.length) return;
    return imgs[0].getAttribute("src");
  }

  // src/non-blocking-processor.js
  function non_blocking_processor_default(commands2, shouldStop, options = {}) {
    const batchSize = Math.max(1, options.batchSize || 150);
    const schedule = options.schedule || requestAnimationFrame;
    const onFinish = options.onFinish || null;
    const onStop = options.onStop || null;
    const maxCommandsPerSecond = Number.isFinite(options.maxCommandsPerSecond) && options.maxCommandsPerSecond > 0 ? options.maxCommandsPerSecond : null;
    let index = 0;
    let allowance = 0;
    let lastTimestamp = null;
    const process = function(timestamp) {
      const now = typeof timestamp === "number" ? timestamp : performance.now();
      if (maxCommandsPerSecond) {
        if (lastTimestamp === null) {
          lastTimestamp = now;
        }
        const deltaMs = Math.max(0, now - lastTimestamp);
        lastTimestamp = now;
        allowance = Math.min(maxCommandsPerSecond, allowance + maxCommandsPerSecond * deltaMs / 1e3);
        if (allowance < 1) {
          schedule(process);
          return;
        }
      }
      if (index >= commands2.length) {
        log_default("Processing finished.");
        if (onFinish) onFinish();
        return;
      }
      if (shouldStop && shouldStop()) {
        log_default("Processing stopped.");
        if (onStop) onStop();
        return;
      }
      const frameBudget = maxCommandsPerSecond ? Math.min(Math.floor(allowance), batchSize) : batchSize;
      if (frameBudget <= 0) {
        schedule(process);
        return;
      }
      const startIndex = index;
      const end = Math.min(index + frameBudget, commands2.length);
      for (; index < end; index++) {
        commands2[index]();
      }
      if (maxCommandsPerSecond) {
        const executed = end - startIndex;
        allowance = Math.max(0, allowance - executed);
      }
      if ((commands2.length - index) % 200 === 0 && commands2.length - index > 0) {
        log_default(`${commands2.length - index} commands remaining to process.`);
      }
      schedule(process);
    };
    log_default(`Processing ${commands2.length} commands...`);
    process(performance.now());
  }

  // src/drag-drop-event-listener.js
  function drag_drop_event_listener_default(element, onEnter, onLeave, onDrop) {
    let debouncer = 0;
    element.addEventListener("dragenter", function(event) {
      if (debouncer === 0) {
        onEnter(event);
      }
      debouncer++;
    });
    element.addEventListener("dragleave", function(event) {
      debouncer--;
      if (debouncer === 0) {
        onLeave(event);
      }
    });
    element.addEventListener("drop", function(event) {
      debouncer = 0;
      onDrop(event);
    });
    element.addEventListener("dragover", function(event) {
      event.preventDefault();
    });
  }

  // src/dom-helper.js
  function dom_helper_default(document2) {
    const overlay = document2.createElement("div");
    overlay.id = "autoDrawOverlay";
    document2.getElementById("game-canvas").appendChild(overlay);
    return {
      getCanvasContainerElement: () => document2.getElementById("game-canvas"),
      getCanvasElement: () => document2.querySelector("#game-canvas canvas"),
      getColorElements: () => document2.querySelectorAll("#game-toolbar .colors .color"),
      getSizeElements: () => document2.querySelectorAll("#game-toolbar .sizes .size"),
      getClearToolElement: () => document2.querySelector('#game-toolbar .tool[data-tooltip="Clear"]'),
      getPenToolElement: () => document2.querySelector('#game-toolbar .tool[data-tooltip="Brush"]'),
      getFillToolElement: () => document2.querySelector('#game-toolbar .tool[data-tooltip="Fill"]'),
      getToolbarElement: () => document2.getElementById("game-toolbar"),
      hideCanvasOverlay: (delay) => setTimeout(function() {
        document2.body.classList.remove("showingAutodrawOverlay");
      }, delay || 0),
      showCanvasOverlay: (text) => {
        overlay.innerText = text;
        document2.body.classList.add("showingAutodrawOverlay");
      }
    };
  }

  // src/settings-panel.js
  var STORAGE_KEY = "skribbl-autodraw-settings-v3";
  var DEFAULT_SETTINGS = {
    preset: "fast",
    quality: 3,
    // 1..5
    colorQuantization: 6,
    // bits 4..8
    colorBatching: true,
    penMode: "fast",
    // accurate | fast
    scaleMode: "fit",
    // fit | fill
    enableFill: true,
    useCorsProxy: true,
    showAdvanced: false,
    debugLogging: false,
    panelPosition: { right: 12, top: 120 }
  };
  var PRESETS = {
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
  var clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  var loadSettings = function() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { ...DEFAULT_SETTINGS, ...saved };
    } catch (error) {
      return { ...DEFAULT_SETTINGS };
    }
  };
  var saveSettings = function(settings2) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings2));
  };
  var createRange = function(id, min, max, value) {
    const input = document.createElement("input");
    input.type = "range";
    input.id = id;
    input.min = min;
    input.max = max;
    input.step = 1;
    input.value = value;
    return input;
  };
  var createCheckbox = function(id, checked) {
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
  var createRadioGroup = function(name, options, value) {
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
  var createSelect = function(id, options, value) {
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
  var createRow = function(labelText, input, valueEl, tooltipText) {
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
  function createSettingsPanel(doc) {
    const settings2 = loadSettings();
    const panel = doc.createElement("div");
    panel.id = "autoDrawPanel";
    panel.style.top = `${settings2.panelPosition.top}px`;
    const header = doc.createElement("div");
    header.className = "autoDrawHeader";
    header.textContent = "AutoDraw";
    const collapse = doc.createElement("button");
    collapse.className = "autoDrawCollapse";
    collapse.textContent = "\u2013";
    header.appendChild(collapse);
    const body = doc.createElement("div");
    body.className = "autoDrawBody";
    const presetInput = createRadioGroup("autoDrawPreset", [
      { value: "fast", label: "Fast" },
      { value: "balanced", label: "Balanced" },
      { value: "quality", label: "Quality" }
    ], settings2.preset);
    const advancedToggle = createCheckbox("autoDrawAdvanced", settings2.showAdvanced);
    const debugToggle = createCheckbox("autoDrawDebug", settings2.debugLogging);
    const qualityValue = doc.createElement("span");
    qualityValue.className = "autoDrawValue";
    qualityValue.textContent = String(settings2.quality);
    const qualityInput = createRange("autoDrawQuality", 1, 5, settings2.quality);
    const quantValue = doc.createElement("span");
    quantValue.className = "autoDrawValue";
    quantValue.textContent = String(settings2.colorQuantization);
    const quantInput = createRange("autoDrawQuant", 4, 8, settings2.colorQuantization);
    const batchingInput = createCheckbox("autoDrawBatching", settings2.colorBatching);
    const fillInput = createCheckbox("autoDrawFill", settings2.enableFill);
    const proxyInput = createCheckbox("autoDrawProxy", settings2.useCorsProxy);
    const penModeInput = createSelect("autoDrawPenMode", [
      { value: "accurate", label: "Accurate" },
      { value: "fast", label: "Fast" }
    ], settings2.penMode);
    const scaleModeInput = createSelect("autoDrawScaleMode", [
      { value: "fit", label: "Fit" },
      { value: "fill", label: "Fill" }
    ], settings2.scaleMode);
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
    panel.appendChild(header);
    panel.appendChild(body);
    doc.body.appendChild(panel);
    const placePanel = function() {
      const pw = panel.offsetWidth || 240;
      const ww = window.innerWidth;
      if (settings2.panelPosition.left != null) {
        const left = Math.max(8, Math.min(settings2.panelPosition.left, ww - pw - 8));
        panel.style.left = `${left}px`;
      } else {
        const right = settings2.panelPosition.right || 12;
        const left = Math.max(8, Math.min(ww - pw - right, ww - pw - 8));
        panel.style.left = `${left}px`;
      }
      const ph = panel.offsetHeight || 200;
      const top = Math.max(8, Math.min(settings2.panelPosition.top || 120, window.innerHeight - ph - 8));
      panel.style.top = `${top}px`;
    };
    placePanel();
    window.addEventListener("resize", placePanel);
    const listeners = [];
    const applyPreset = function(presetId) {
      const preset = PRESETS[presetId];
      if (!preset) return;
      settings2.preset = presetId;
      settings2.quality = preset.quality;
      settings2.colorQuantization = preset.colorQuantization;
      settings2.colorBatching = preset.colorBatching;
      settings2.penMode = preset.penMode;
      settings2.scaleMode = preset.scaleMode;
      settings2.enableFill = preset.enableFill;
      qualityInput.value = settings2.quality;
      quantInput.value = settings2.colorQuantization;
      batchingInput.checked = settings2.colorBatching;
      fillInput.checked = settings2.enableFill;
      penModeInput.value = settings2.penMode;
      scaleModeInput.value = settings2.scaleMode;
      presetInput.querySelectorAll("input[type=radio]").forEach((input) => {
        input.checked = input.value === presetId;
      });
    };
    const updateAdvancedVisibility = function() {
      advancedSection.style.display = settings2.showAdvanced ? "grid" : "none";
    };
    const updateSettings = function() {
      settings2.quality = clamp(parseInt(qualityInput.value, 10), 1, 5);
      settings2.colorQuantization = clamp(parseInt(quantInput.value, 10), 4, 8);
      settings2.colorBatching = batchingInput.checked;
      settings2.enableFill = fillInput.checked;
      settings2.useCorsProxy = proxyInput.checked;
      settings2.penMode = penModeInput.value;
      settings2.scaleMode = scaleModeInput.value;
      const presetChecked = presetInput.querySelector("input[type=radio]:checked");
      settings2.preset = presetChecked ? presetChecked.value : settings2.preset;
      settings2.showAdvanced = advancedToggle.checked;
      settings2.debugLogging = debugToggle.checked;
      qualityValue.textContent = String(settings2.quality);
      quantValue.textContent = String(settings2.colorQuantization);
      updateAdvancedVisibility();
      saveSettings(settings2);
      listeners.forEach((listener) => listener({ ...settings2 }));
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
    inputs.forEach((input) => input.addEventListener("input", updateSettings));
    inputs.forEach((input) => input.addEventListener("change", updateSettings));
    presetInput.querySelectorAll("input[type=radio]").forEach((input) => {
      input.addEventListener("change", () => {
        applyPreset(input.value);
        updateSettings();
      });
    });
    collapse.addEventListener("click", () => {
      const collapsed = panel.classList.toggle("collapsed");
      collapse.textContent = collapsed ? "+" : "\u2013";
    });
    const startDrag = function(event) {
      if (event.target !== header) return;
      event.preventDefault();
      const startX = event.clientX;
      const startY = event.clientY;
      const rect = panel.getBoundingClientRect();
      const startLeft = rect.left;
      const startTop = rect.top;
      const move = function(moveEvent) {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        const pw = panel.offsetWidth;
        const ph = panel.offsetHeight;
        const ww = window.innerWidth;
        const wh = window.innerHeight;
        let newLeft = Math.round(startLeft + dx);
        let newTop = Math.round(startTop + dy);
        newLeft = Math.max(8, Math.min(newLeft, ww - pw - 8));
        newTop = Math.max(8, Math.min(newTop, wh - ph - 8));
        panel.style.left = `${newLeft}px`;
        panel.style.top = `${newTop}px`;
      };
      const end = function() {
        settings2.panelPosition = {
          left: parseInt(panel.style.left, 10) || 12,
          top: parseInt(panel.style.top, 10) || 120
        };
        saveSettings(settings2);
        doc.removeEventListener("mousemove", move);
        doc.removeEventListener("mouseup", end);
      };
      doc.addEventListener("mousemove", move);
      doc.addEventListener("mouseup", end);
    };
    header.addEventListener("mousedown", startDrag);
    header.addEventListener("dblclick", () => {
      const pw = panel.offsetWidth || 240;
      const left = Math.max(8, window.innerWidth - pw - 12);
      const top = 120;
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      settings2.panelPosition = { left, top };
      saveSettings(settings2);
    });
    applyPreset(settings2.preset);
    updateAdvancedVisibility();
    updateSettings();
    return {
      getSettings: () => ({ ...settings2 }),
      onChange: (listener) => listeners.push(listener),
      setStatus: (text) => {
        status.textContent = text;
      },
      setEstimate: (text) => {
        estimate.textContent = text || "";
      },
      stopButton
    };
  }

  // src/index.js
  var domHelper = dom_helper_default(document);
  var clearToolElement = domHelper.getClearToolElement();
  var canvas = canvas_default(domHelper.getCanvasElement());
  var toolbar = toolbar_default(domHelper);
  var artist = artist_default(canvas, toolbar);
  var settingsPanel = createSettingsPanel(document);
  var settings = settingsPanel.getSettings();
  settingsPanel.onChange((newSettings) => {
    settings = newSettings;
    setLoggingEnabled(settings.debugLogging);
  });
  setLoggingEnabled(settings.debugLogging);
  var commands = [];
  var isDrawingActive = false;
  var activeJobId = 0;
  var pendingLoadId = 0;
  var suppressStopStatus = false;
  var corsProxyUrl = "https://skribbl-io-autodraw-cors-proxy.galehouse5.workers.dev?";
  var SERVER_COMMANDS_PER_SECOND = 180;
  var MAX_FRAME_BURST = 12;
  var estimateTime = function(commandCount) {
    if (!commandCount) return "";
    const seconds = commandCount / SERVER_COMMANDS_PER_SECOND;
    if (!Number.isFinite(seconds)) return "";
    return `Est. ${seconds.toFixed(1)}s`;
  };
  var loadImageWithFallback = function(imageUrl) {
    if (!settings.useCorsProxy) return loadImage(imageUrl);
    return loadImage(imageUrl).catch(() => loadImage(`${corsProxyUrl}${imageUrl}`));
  };
  var handleDragEnter = function() {
    if (!toolbar.isEnabled()) return;
    domHelper.showCanvasOverlay("Drop image here to auto draw!");
  };
  var performToolbarClear = function() {
    suppressStopStatus = true;
    toolbar.clear();
    suppressStopStatus = false;
  };
  var drawImage = function(image, loadId) {
    if (typeof loadId === "number" && loadId !== pendingLoadId) {
      log_default("Discarded draw request for a stale image load.");
      return;
    }
    stopDrawing({ silent: true });
    log_default("Clearing canvas...");
    performToolbarClear();
    const jobId = ++activeJobId;
    log_default(`Drawing ${image.width} x ${image.height} image...`);
    settingsPanel.setStatus("Drawing...");
    let nextCommands = [];
    try {
      nextCommands = artist.draw(image, settings);
    } catch (error) {
      log_default(`Failed to generate draw commands: ${error instanceof Error ? error.message : error}`);
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
    non_blocking_processor_default(commands, () => jobId !== activeJobId || !toolbar.isEnabled(), {
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
  var stopDrawing = function(options = {}) {
    const silentOption = Boolean(options.silent);
    const statusText = options.statusText || "Stopped";
    if (!isDrawingActive) return false;
    isDrawingActive = false;
    commands = [];
    activeJobId++;
    settingsPanel.setEstimate("");
    const shouldSilence = silentOption || suppressStopStatus;
    if (!shouldSilence) settingsPanel.setStatus(statusText);
    log_default("Drawing stopped.");
    return true;
  };
  var loadImageFromSource = function(imageUrl, { overlayText, statusText, errorLabel }) {
    stopDrawing({ silent: true });
    const loadId = ++pendingLoadId;
    settingsPanel.setEstimate("");
    settingsPanel.setStatus(statusText);
    domHelper.showCanvasOverlay(overlayText);
    const shouldRevoke = imageUrl.startsWith("blob:");
    let released = false;
    const releaseUrl = function() {
      if (released || !shouldRevoke) return;
      URL.revokeObjectURL(imageUrl);
      released = true;
    };
    loadImageWithFallback(imageUrl).then((image) => {
      releaseUrl();
      if (loadId !== pendingLoadId) {
        log_default("Discarded stale image load result.");
        return null;
      }
      return image;
    }).then((image) => {
      if (!image) return;
      drawImage(image, loadId);
    }).catch((error) => {
      releaseUrl();
      if (loadId !== pendingLoadId) return;
      settingsPanel.setStatus("Loading failed");
      domHelper.showCanvasOverlay("Auto draw couldn't load image :(");
      domHelper.hideCanvasOverlay(2500);
      log_default(`Couldn't load ${errorLabel}: ${imageUrl}. ${error?.message || error || ""}`);
    });
  };
  var handleDrop = function(event) {
    event.preventDefault();
    if (!domHelper.getCanvasContainerElement().contains(event.target))
      return domHelper.hideCanvasOverlay();
    if (!toolbar.isEnabled()) {
      log_default("Can't draw right now.");
      return domHelper.hideCanvasOverlay();
    }
    log_default("Processing dropped content...");
    const imageUrl = getImgFileUrl(event.dataTransfer) || getImgElementSrc(event.dataTransfer);
    if (!imageUrl) {
      domHelper.showCanvasOverlay("Auto draw couldn't load image :(");
      log_default("Dropped content not recognized.");
      return domHelper.hideCanvasOverlay(
        /* delay: */
        2500
      );
    }
    loadImageFromSource(imageUrl, {
      overlayText: "AutoDraw loading image...",
      statusText: "Loading image...",
      errorLabel: "image"
    });
  };
  var handlePaste = function(event) {
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
  drag_drop_event_listener_default(document, handleDragEnter, domHelper.hideCanvasOverlay, handleDrop);
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
})();
/*! Bundled license information:

color-diff/lib/diff.js:
  (**
   * @author Markus Ekholm
   * @copyright 2012-2016 (c) Markus Ekholm <markus at botten dot org >
   * @license Copyright (c) 2012-2016, Markus Ekholm
   * All rights reserved.
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *    * Redistributions of source code must retain the above copyright
   *      notice, this list of conditions and the following disclaimer.
   *    * Redistributions in binary form must reproduce the above copyright
   *      notice, this list of conditions and the following disclaimer in the
   *      documentation and/or other materials provided with the distribution.
   *    * Neither the name of the author nor the
   *      names of its contributors may be used to endorse or promote products
   *      derived from this software without specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
   * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
   * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
   * DISCLAIMED. IN NO EVENT SHALL MARKUS EKHOLM BE LIABLE FOR ANY
   * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
   * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
   * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
   * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
   * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   *)

color-diff/lib/convert.js:
  (**
   * @author Markus Ekholm
   * @copyright 2012-2016 (c) Markus Ekholm <markus at botten dot org >
   * @license Copyright (c) 2012-2016, Markus Ekholm
   * All rights reserved.
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *    * Redistributions of source code must retain the above copyright
   *      notice, this list of conditions and the following disclaimer.
   *    * Redistributions in binary form must reproduce the above copyright
   *      notice, this list of conditions and the following disclaimer in the
   *      documentation and/or other materials provided with the distribution.
   *    * Neither the name of the author nor the
   *      names of its contributors may be used to endorse or promote products
   *      derived from this software without specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
   * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
   * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
   * DISCLAIMED. IN NO EVENT SHALL MARKUS EKHOLM BE LIABLE FOR ANY
   * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
   * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
   * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
   * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
   * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   *)

color-diff/lib/palette.js:
  (**
   * @author Markus Ekholm
   * @copyright 2012-2016 (c) Markus Ekholm <markus at botten dot org >
   * @license Copyright (c) 2012-2016, Markus Ekholm
   * All rights reserved.
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *    * Redistributions of source code must retain the above copyright
   *      notice, this list of conditions and the following disclaimer.
   *    * Redistributions in binary form must reproduce the above copyright
   *      notice, this list of conditions and the following disclaimer in the
   *      documentation and/or other materials provided with the distribution.
   *    * Neither the name of the author nor the
   *      names of its contributors may be used to endorse or promote products
   *      derived from this software without specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
   * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
   * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
   * DISCLAIMED. IN NO EVENT SHALL MARKUS EKHOLM BE LIABLE FOR ANY
   * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
   * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
   * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
   * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
   * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   *)
*/
//# sourceMappingURL=main.js.map
