import '../../index.css';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import axe, { type Result } from 'axe-core';
import { ToastProvider } from '../../contexts/ToastContext';
import { AppLayout } from '../../components/layout/AppLayout';
import { ROUTES } from '../../routes';
import { addTranslation } from '../../utils/translationService';
import { storageManager } from '../../utils/storageManager';
import { contrast, deltaE, effectiveBackground, formatColor, parseColor } from './color';

/**
 * What src/test/axe.ts cannot check in jsdom: contrast, measured on the real
 * stylesheet, at rest and under a real pointer hover.
 */

/**
 * Smallest OKLab distance that reads as "this changed" on hover. neutral-50 on
 * white -- the old row hover -- is ~0.015; neutral-100 is ~0.03.
 */
const HOVER_FLOOR = 0.05;
const TEXT_MIN = 4.5;
const ICON_MIN = 3;

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844 };

// Hover states must read instantly; a 200ms colour transition would otherwise
// be sampled mid-flight.
const freeze = document.createElement('style');
freeze.textContent =
  '*, *::before, *::after { transition: none !important; animation: none !important; }';
document.head.append(freeze);

const renderApp = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <AppLayout>
          <Routes>
            {ROUTES.map(route => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </AppLayout>
      </ToastProvider>
    </MemoryRouter>
  );

const formatViolations = (violations: Result[]) =>
  violations
    .map(
      v =>
        `${v.id}: ${v.help}\n${v.nodes.map(n => `  ${n.html}\n  ${n.failureSummary ?? ''}`).join('\n')}`
    )
    .join('\n\n');

async function expectAxeClean(root: Element = document.body) {
  const { violations } = await axe.run(root, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
    },
    resultTypes: ['violations'],
  });
  expect(violations, formatViolations(violations)).toEqual([]);
}

// More than a 1px box: sr-only content (the skip link) is clipped to 1px and
// cannot be hovered.
const isVisible = (el: Element) => {
  const rect = el.getBoundingClientRect();
  return rect.width > 1 && rect.height > 1 && getComputedStyle(el).visibility !== 'hidden';
};

/** Nothing else is painted over the element's centre (an open menu, a modal). */
const isUncovered = (el: Element) => {
  const rect = el.getBoundingClientRect();
  const top = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
  return top !== null && el.contains(top);
};

// unhover() parks the pointer at the centre of <body>, which can be over a
// row -- so the "rest" sample would already be a hover. Park it in a corner.
const parking = document.createElement('div');
parking.style.cssText = 'position:fixed;right:0;bottom:0;width:4px;height:4px;z-index:2147483647';
document.body.append(parking);
const parkPointer = () => userEvent.hover(parking);

const isIconOnly = (el: Element) =>
  el.querySelector('svg') !== null && el.textContent.trim() === '';

const describeEl = (el: Element) =>
  el.getAttribute('aria-label') ?? (el.textContent.trim().slice(0, 40) || el.tagName);

const interactive = (root: ParentNode) =>
  [...root.querySelectorAll<HTMLElement>('button, a[href]')].filter(
    el =>
      isVisible(el) &&
      isUncovered(el) &&
      !(el instanceof HTMLButtonElement && el.disabled) &&
      // The current page's link and the active tab have nowhere to go; they
      // keep their selected look.
      el.getAttribute('aria-current') !== 'page' &&
      el.getAttribute('aria-pressed') !== 'true'
  );

/** Elements whose hover must change the background, not just the ink. */
const needsBackgroundHover = (el: HTMLElement) => isIconOnly(el) || el.closest('nav ul') !== null;

interface HoverReport {
  element: string;
  problem: string;
}

/**
 * Hovers every interactive element under `root` and reports each one whose
 * hover state is invisible or drops below contrast minimums.
 */
async function auditHovers(root: ParentNode): Promise<HoverReport[]> {
  const problems: HoverReport[] = [];
  const controls = interactive(root);
  // A selector or visibility change that matched nothing would pass vacuously.
  if (controls.length === 0) throw new Error('auditHovers found no controls to hover');
  for (const el of controls) {
    await parkPointer();
    const restBg = effectiveBackground(el);
    const restFg = parseColor(getComputedStyle(el).color);

    const name = describeEl(el);
    try {
      await userEvent.hover(el, { timeout: 2000 });
    } catch (error) {
      problems.push({ element: name, problem: `could not be hovered: ${String(error)}` });
      continue;
    }
    const hoverBg = effectiveBackground(el);
    const hoverFg = parseColor(getComputedStyle(el).color);
    // Text inside the hovered region, not only the control's own ink: a row's
    // muted pinyin sits on the row's hover background.
    const { violations } = await axe.run(el.closest('[data-row]') ?? el, {
      runOnly: ['color-contrast'],
      resultTypes: ['violations'],
    });
    if (violations.length > 0) {
      problems.push({ element: name, problem: `on hover: ${formatViolations(violations)}` });
    }

    const bgShift = deltaE(restBg, hoverBg);
    const shift = Math.max(bgShift, deltaE(restFg, hoverFg));
    if (needsBackgroundHover(el) && bgShift < HOVER_FLOOR) {
      problems.push({
        element: name,
        problem: `hover background ${formatColor(hoverBg)} vs ${formatColor(restBg)}: ΔE ${bgShift.toFixed(3)} < ${HOVER_FLOOR}`,
      });
    } else if (shift < HOVER_FLOOR) {
      problems.push({
        element: name,
        problem: `hover barely changes anything: ΔE ${shift.toFixed(3)} < ${HOVER_FLOOR}`,
      });
    }

    const min = isIconOnly(el) ? ICON_MIN : TEXT_MIN;
    const ratio = contrast(hoverFg, hoverBg);
    if (ratio < min) {
      problems.push({
        element: name,
        problem: `hover contrast ${ratio.toFixed(2)}:1 < ${min}:1 (${formatColor(hoverFg)} on ${formatColor(hoverBg)})`,
      });
    }
  }
  return problems;
}

const formatProblems = (problems: HoverReport[]) =>
  problems.map(p => `${p.element}: ${p.problem}`).join('\n');

describe('contrast in a real browser', () => {
  beforeEach(async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    await addTranslation('你好', 'Hello');
    await addTranslation('謝謝', 'Thank you');
  });

  afterEach(() => {
    cleanup();
    storageManager.clear();
    localStorage.clear();
  });

  describe.each(['/', '/flashcards', '/list', '/settings'])('%s', path => {
    it('passes axe, colour contrast included', async () => {
      renderApp(path);
      await expectAxeClean();
    });

    it('has a visible, legible hover on every control', async () => {
      renderApp(path);
      const problems = await auditHovers(document.body);
      expect(problems, formatProblems(problems)).toEqual([]);
    });
  });

  it('Add Translation batch tab passes axe and hover', async () => {
    renderApp('/');
    await userEvent.click(screen.getByRole('button', { name: /batch import/i }));
    await expectAxeClean();
    const problems = await auditHovers(document.body);
    expect(problems, formatProblems(problems)).toEqual([]);
  });

  it('a revealed flashcard passes axe', async () => {
    renderApp('/flashcards');
    await userEvent.click(screen.getByRole('button', { name: /reveal answer/i }));
    await expectAxeClean();
  });

  it('an expanded list row passes axe and hover', async () => {
    renderApp('/list');
    const disclosure = screen
      .getAllByRole('button')
      .find(button => button.hasAttribute('aria-expanded'));
    if (!disclosure) throw new Error('no disclosure button');
    await userEvent.click(disclosure);
    await expectAxeClean();
    const problems = await auditHovers(document.body);
    expect(problems, formatProblems(problems)).toEqual([]);
  });

  it('a list row stays highlighted while the pointer is on its action icons', async () => {
    renderApp('/list');
    const edit = screen.getAllByRole('button', { name: /^edit /i })[0];
    if (!edit) throw new Error('no edit button');
    const row = edit.closest('[data-row]');
    if (!row) throw new Error('row wrapper not marked with data-row');

    const rest = effectiveBackground(row);
    await userEvent.hover(edit);
    const hovered = effectiveBackground(row);

    expect(deltaE(rest, hovered)).toBeGreaterThanOrEqual(HOVER_FLOOR);
  });

  it('the mobile menu passes axe and hover', async () => {
    await page.viewport(MOBILE.width, MOBILE.height);
    renderApp('/');
    await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
    await expectAxeClean();
    const problems = await auditHovers(document.body);
    expect(problems, formatProblems(problems)).toEqual([]);
  });
});
