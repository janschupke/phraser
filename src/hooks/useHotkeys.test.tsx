import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useHotkeys } from './useHotkeys';

function Probe({
  onSpace,
  onEscape,
  enabled = true,
  allowInEditable = false,
  withInput = false,
  withButton = false,
}: {
  onSpace?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
  allowInEditable?: boolean;
  withInput?: boolean;
  withButton?: boolean;
}) {
  useHotkeys(
    {
      ...(onSpace ? { Space: onSpace } : {}),
      ...(onEscape ? { Escape: onEscape } : {}),
    },
    { enabled, allowInEditable }
  );
  return (
    <div>
      {withInput && <input aria-label="field" />}
      {withButton && (
        <button type="button" onClick={onSpace}>
          activate
        </button>
      )}
    </div>
  );
}

describe('useHotkeys', () => {
  it('runs the handler for a bound key', async () => {
    const onSpace = vi.fn();
    render(<Probe onSpace={onSpace} />);
    await userEvent.keyboard(' ');
    expect(onSpace).toHaveBeenCalledOnce();
  });

  it('does nothing while disabled', async () => {
    const onSpace = vi.fn();
    render(<Probe onSpace={onSpace} enabled={false} />);
    await userEvent.keyboard(' ');
    expect(onSpace).not.toHaveBeenCalled();
  });

  it('lets Space type a literal space inside a text field', async () => {
    const onSpace = vi.fn();
    render(<Probe onSpace={onSpace} withInput />);
    const field = screen.getByLabelText('field');
    await userEvent.click(field);
    await userEvent.type(field, 'a b');

    expect(onSpace).not.toHaveBeenCalled();
    expect(field).toHaveValue('a b');
  });

  it('still handles Escape inside a text field when allowInEditable', async () => {
    const onEscape = vi.fn();
    render(<Probe onEscape={onEscape} allowInEditable withInput />);
    await userEvent.click(screen.getByLabelText('field'));
    await userEvent.keyboard('{Escape}');
    expect(onEscape).toHaveBeenCalledOnce();
  });

  it('fires once, not twice, when a button has focus', async () => {
    // The browser already activates a focused button on Space. Without the
    // native-activation guard the hotkey would fire alongside the click.
    const onSpace = vi.fn();
    render(<Probe onSpace={onSpace} withButton />);
    screen.getByRole('button').focus();
    await userEvent.keyboard(' ');
    expect(onSpace).toHaveBeenCalledOnce();
  });

  it('ignores a key held down to auto-repeat', () => {
    const onSpace = vi.fn();
    render(<Probe onSpace={onSpace} />);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', repeat: true }));
    expect(onSpace).not.toHaveBeenCalled();
  });

  it('ignores keys while an IME is composing', () => {
    // Pinyin input commits the highlighted candidate with Space.
    const onSpace = vi.fn();
    render(<Probe onSpace={onSpace} />);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', isComposing: true }));
    expect(onSpace).not.toHaveBeenCalled();
  });

  it('ignores modified key presses', () => {
    const onSpace = vi.fn();
    render(<Probe onSpace={onSpace} />);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', metaKey: true }));
    expect(onSpace).not.toHaveBeenCalled();
  });

  it('gives the most recently mounted consumer the key', async () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <>
        <Probe onEscape={outer} />
        <Probe onEscape={inner} />
      </>
    );
    await userEvent.keyboard('{Escape}');
    expect(inner).toHaveBeenCalledOnce();
    expect(outer).not.toHaveBeenCalled();
  });

  it('suppresses the default action so Space does not scroll the page', () => {
    render(<Probe onSpace={vi.fn()} />);
    const event = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
