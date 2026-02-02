# AutoDraw for skribbl.io

Chrome extension that automatically draws images in pictionary game, [skribbl.io](https://skribbl.io/). Simply drag and drop an image on the canvas to initiate auto draw. [Download from Chrome Web Store](https://chrome.google.com/webstore/detail/autodraw-for-skribblio/bpnefockcbbpkbahgkkacjmebfheacjb).

![Drawing a Starfish](/drawing-a-starfish.gif)

## Usage

- Drag & drop an image onto the canvas.
- Or paste an image from the clipboard (Ctrl/Cmd + V).

Use the AutoDraw panel on the right to tune speed/quality:

- **Quality**: Lower for faster drawing, higher for detail.
- **Speed**: Higher processes more commands per frame.
- **Color bits**: Lower reduces color variety to speed up matching.
- **Batch by color**: Reduces color switching for faster results.
- **Pen mode**: *Fast* uses larger brushes for long strokes.
- **Scale**: *Fit* preserves aspect ratio; *Fill* crops to fill.
- **CORS proxy**: Optional fallback if image host blocks CORS.

## Development

Install dependencies and build:

```bash
npm install
npm run build
```

For development builds:

```bash
npm run build:dev
```

Watch mode:

```bash
npm run watch
```
