import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useIncrementalList } from './useIncrementalList';

/** Records every observer so a test can play the browser and fire it. */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  disconnected = false;
  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }
  observe() {
    /* driven by intersect() */
  }
  disconnect() {
    this.disconnected = true;
  }
  intersect(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

const live = () => FakeIntersectionObserver.instances.filter(o => !o.disconnected);

function Harness({ items, resetKey = '' }: { items: number[]; resetKey?: string }) {
  const { visible, hasMore, remaining, sentinelRef } = useIncrementalList(items, {
    pageSize: 10,
    resetKey,
  });
  return (
    <>
      <p data-testid="count">{visible.length}</p>
      {hasMore && <div ref={sentinelRef}>{remaining} remaining</div>}
    </>
  );
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const count = () => Number(screen.getByTestId('count').textContent);

describe('useIncrementalList', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders one page and loads the next when the sentinel intersects', () => {
    render(<Harness items={range(25)} />);
    expect(count()).toBe(10);

    act(() => live()[0]!.intersect(true));
    expect(count()).toBe(20);
    expect(screen.getByText('5 remaining')).toBeInTheDocument();
  });

  it('ignores the sentinel leaving the viewport', () => {
    render(<Harness items={range(25)} />);
    act(() => live()[0]!.intersect(false));
    expect(count()).toBe(10);
  });

  it('observes afresh after each page, so a still-visible sentinel keeps loading', () => {
    render(<Harness items={range(25)} />);
    const first = live()[0]!;
    act(() => first.intersect(true));

    expect(first.disconnected).toBe(true);
    expect(live()).toHaveLength(1);
    act(() => live()[0]!.intersect(true));
    expect(count()).toBe(25);
  });

  it('stops observing once everything is rendered', () => {
    render(<Harness items={range(15)} />);
    act(() => live()[0]!.intersect(true));
    expect(count()).toBe(15);
    expect(live()).toHaveLength(0);
  });

  it('never observes a list that fits on one page', () => {
    render(<Harness items={range(10)} />);
    expect(count()).toBe(10);
    expect(FakeIntersectionObserver.instances).toHaveLength(0);
  });

  it('starts over at one page when the reset key changes', () => {
    const { rerender } = render(<Harness items={range(25)} resetKey="a" />);
    act(() => live()[0]!.intersect(true));
    expect(count()).toBe(20);

    rerender(<Harness items={range(25)} resetKey="b" />);
    expect(count()).toBe(10);
  });
});
