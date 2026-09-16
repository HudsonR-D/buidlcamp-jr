import { FORGE_TEMPLATES } from "../data/templates.ts";
import type { ForgeTemplate } from "../types";
const painter: ForgeTemplate = {
  id: "pixel-painter",
  name: "Pixel painter",
  icon: "",
  tagline: "Build a drawing tool with a little JavaScript.",
  minTier: "Bronze",
  remixQuests: [
    {
      title: "Change the brush colour",
      hint: "Find BRUSH_COLOR and choose another colour.",
    },
    {
      title: "Add a clear button",
      hint: "Give every square a white background when your button is clicked.",
    },
    {
      title: "Explain what you changed",
      hint: "Write about one change in your project reflection.",
    },
  ],
  code: `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pixel painter</title>
<style>
body { font: 16px system-ui; padding: 10px; margin: 0; color: #12253a; }
#grid { display: grid; grid-template-columns: repeat(16, 1fr); width: min(100%, 280px); margin: 12px auto; touch-action: none; border: 1px solid #b3c1ca; }
.pixel { aspect-ratio: 1; background: white; border: 1px solid #e5e7eb; padding: 0; min-width: 0; }
.palette { display: flex; justify-content: center; gap: 12px; }
.swatch { width: 44px; height: 44px; border: 2px solid #a8bdc8; border-radius: 6px; }
</style>

<p style="text-align:center;font-size:13px;margin:6px 0">Choose a colour. Tap or drag to draw.</p>
<div id="grid" aria-label="Drawing grid"></div>
<div class="palette" id="palette"></div>
<script>
// Change this colour, then run your preview.
const BRUSH_COLOR = '#006273';
let colour = BRUSH_COLOR;
const grid = document.getElementById('grid');
for (let i = 0; i < 256; i++) {
  const pixel = document.createElement('button');
  pixel.className = 'pixel';
  pixel.setAttribute('aria-label', 'Paint square ' + (i + 1));
  pixel.onclick = () => pixel.style.background = colour;
  grid.append(pixel);
}
for (const hex of [BRUSH_COLOR, '#e88b32', '#ffffff']) {
  const swatch = document.createElement('button');
  swatch.className = 'swatch';
  swatch.style.background = hex;
  swatch.setAttribute('aria-label', 'Brush ' + hex);
  swatch.onclick = () => colour = hex;
  document.getElementById('palette').append(swatch);
}
grid.onpointermove = event => {
  if (!event.buttons) return;
  const pixel = document.elementFromPoint(event.clientX, event.clientY);
  if (pixel && pixel.className === 'pixel') pixel.style.background = colour;
};
</script>
</html>`,
};
export const STARTERS = [painter, ...FORGE_TEMPLATES];
