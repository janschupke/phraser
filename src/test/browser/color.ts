/**
 * Colour measurement for the browser suite.
 *
 * Two axes, because WCAG contrast alone cannot answer "is this hover visible":
 * it is a ratio of luminance only, so a hover background that differs from the
 * surface by a whisker of lightness passes every text-contrast check while
 * being invisible. OKLab distance measures the perceived difference itself.
 */

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Parses the `rgb()`/`rgba()` form getComputedStyle returns. */
export function parseColor(css: string): Rgba {
  const match = /rgba?\(([^)]+)\)/.exec(css);
  if (!match?.[1]) throw new Error(`Unparseable colour: ${css}`);
  const parts = match[1]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map(Number);
  const [r = 0, g = 0, b = 0, a = 1] = parts;
  return { r, g, b, a };
}

/** Composites `top` over an opaque `bottom`. */
const over = (top: Rgba, bottom: Rgba): Rgba => ({
  r: top.r * top.a + bottom.r * (1 - top.a),
  g: top.g * top.a + bottom.g * (1 - top.a),
  b: top.b * top.a + bottom.b * (1 - top.a),
  a: 1,
});

/**
 * The colour actually painted behind `el`: its own background composited over
 * each ancestor's until an opaque one is reached (white if none is).
 */
export function effectiveBackground(el: Element): Rgba {
  const layers: Rgba[] = [];
  for (let node: Element | null = el; node; node = node.parentElement) {
    const color = parseColor(getComputedStyle(node).backgroundColor);
    if (color.a > 0) layers.push(color);
    if (color.a >= 1) break;
  }
  return layers.reduceRight<Rgba>((below, layer) => over(layer, below), {
    r: 255,
    g: 255,
    b: 255,
    a: 1,
  });
}

const linear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminance = ({ r, g, b }: Rgba): number =>
  0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);

/** WCAG 2.x contrast ratio, 1 to 21. */
export function contrast(a: Rgba, b: Rgba): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const toOklab = ({ r, g, b }: Rgba): [number, number, number] => {
  const [lr, lg, lb] = [linear(r), linear(g), linear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

/** Euclidean distance in OKLab: 0 is identical, ~0.02 is barely perceptible. */
export function deltaE(a: Rgba, b: Rgba): number {
  const [l1, a1, b1] = toOklab(a);
  const [l2, a2, b2] = toOklab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

export const formatColor = ({ r, g, b }: Rgba): string =>
  `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
