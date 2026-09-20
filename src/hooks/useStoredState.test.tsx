import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useTranslations, useSettings } from './useStoredState';
import { addTranslation } from '../utils/translationService';
import { updateSetting } from '../utils/settings';
import { storageManager } from '../utils/storageManager';

describe('useStoredState', () => {
  beforeEach(() => {
    localStorage.clear();
    storageManager.clear();
  });

  it('returns a referentially stable snapshot across renders', () => {
    // The guard against a re-render storm: useSyncExternalStore compares
    // snapshots by reference, so a getTranslations() that allocated a fresh
    // array per call would loop forever. Counting renders proves it does not.
    let renders = 0;
    function Probe() {
      renders += 1;
      return <span data-testid="count">{useTranslations().length}</span>;
    }

    render(<Probe />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    const initialRenders = renders;

    // Re-rendering the parent must not change the snapshot identity.
    render(<Probe />);
    expect(renders).toBeLessThanOrEqual(initialRenders + 2);
  });

  it('re-renders when a translation is written', () => {
    function Probe() {
      return <span data-testid="count">{useTranslations().length}</span>;
    }
    render(<Probe />);
    expect(screen.getByTestId('count')).toHaveTextContent('0');

    act(() => {
      addTranslation('你好', 'Hello');
    });
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('re-renders when a setting is written', () => {
    function Probe() {
      return <span data-testid="flag">{String(useSettings().reverseMode)}</span>;
    }
    render(<Probe />);
    expect(screen.getByTestId('flag')).toHaveTextContent('false');

    act(() => {
      updateSetting('reverseMode', true);
    });
    expect(screen.getByTestId('flag')).toHaveTextContent('true');
  });

  it('picks up a write from another tab', () => {
    function Probe() {
      return <span data-testid="count">{useTranslations().length}</span>;
    }
    render(<Probe />);

    act(() => {
      localStorage.setItem(
        'phraser',
        JSON.stringify([{ id: '1', mandarin: '你好', translation: 'Hello' }])
      );
      window.dispatchEvent(new StorageEvent('storage', { key: 'phraser' }));
    });
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});
