import axe, { type Result, type RunOptions } from 'axe-core';

/**
 * What jsdom can and cannot tell us.
 *
 * Real signal here is anything computed from the DOM and ARIA: roles, accessible
 * names, required attributes and parents, heading order, nested interactives.
 *
 * The rules disabled below are not skipped because they are inconvenient -- they
 * are skipped because in jsdom they cannot fail honestly. There is no layout and
 * no canvas, so getBoundingClientRect is all zeros and colour cannot be sampled;
 * axe returns "incomplete" rather than a violation, which reads as a pass.
 *
 * The subtler limit, which no config can fix: no stylesheet is loaded, so
 * Tailwind classes are inert. An element with `hidden` or `sr-only` is fully
 * visible to axe here. Treat a green run as a statement about semantics only.
 * Contrast, focus order and hit targets need a real browser.
 */
const OPTIONS: RunOptions = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
  },
  rules: {
    'color-contrast': { enabled: false },
    'color-contrast-enhanced': { enabled: false },
    'target-size': { enabled: false },
    'scrollable-region-focusable': { enabled: false },
  },
  resultTypes: ['violations'],
};

const format = (violations: Result[]): string =>
  violations
    .map(violation => {
      const nodes = violation.nodes
        .map(node => `      ${node.html}\n      ${node.failureSummary ?? ''}`)
        .join('\n');
      return `  [${violation.impact ?? 'unknown'}] ${violation.id}: ${violation.help}\n    ${violation.helpUrl}\n${nodes}`;
    })
    .join('\n\n');

export async function expectNoA11yViolations(container: HTMLElement): Promise<void> {
  const { violations } = await axe.run(container, OPTIONS);
  if (violations.length > 0) {
    throw new Error(`${violations.length} accessibility violation(s):\n\n${format(violations)}`);
  }
}
