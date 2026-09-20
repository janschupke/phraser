import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Modal } from './Modal';

function Harness({ onClose = vi.fn() }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        open
      </button>
      <Modal
        isOpen={open}
        title="Delete thing"
        onClose={() => {
          setOpen(false);
          onClose();
        }}
        footer={
          <>
            <button type="button">Cancel</button>
            <button type="button">Confirm</button>
          </>
        }
      >
        Are you sure?
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(<Harness />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('exposes a labelled, modal dialog', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'open' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Delete thing');
    expect(dialog).toHaveAccessibleDescription(/are you sure/i);
  });

  it('moves focus into the dialog on open', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'open' }));
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
  });

  it('restores focus to the trigger on close', async () => {
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'open' });
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
  });

  it('closes on Escape', async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await userEvent.click(screen.getByRole('button', { name: 'open' }));
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('keeps Tab inside the dialog', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'open' }));

    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const confirm = screen.getByRole('button', { name: 'Confirm' });

    cancel.focus();
    await userEvent.tab();
    expect(confirm).toHaveFocus();
    // Wrapping forward from the last control returns to the first, rather than
    // escaping to the page behind.
    await userEvent.tab();
    expect(cancel).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(confirm).toHaveFocus();
  });

  it('renders outside the React tree so a transformed ancestor cannot clip it', async () => {
    render(
      <div className="transform-gpu" data-testid="transformed">
        <Harness />
      </div>
    );
    await userEvent.click(screen.getByRole('button', { name: 'open' }));
    const dialog = screen.getByRole('dialog');
    expect(screen.getByTestId('transformed')).not.toContainElement(dialog);
    expect(document.body).toContainElement(dialog);
  });

  it('locks background scrolling while open and releases it after', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'open' }));
    expect(document.body.style.overflow).toBe('hidden');
    await userEvent.keyboard('{Escape}');
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
