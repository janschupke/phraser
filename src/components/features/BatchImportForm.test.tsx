import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../../contexts/ToastContext';
import { BatchImportForm } from './BatchImportForm';

const renderForm = (onImport = vi.fn()) => {
  render(
    <ToastProvider>
      <BatchImportForm onImport={onImport} />
    </ToastProvider>
  );
  return onImport;
};

const paste = async (text: string) => {
  const user = userEvent.setup();
  const textarea = screen.getByLabelText(/paste csv data/i);
  await user.clear(textarea);
  await user.click(textarea);
  // fireEvent-style direct set: typing a long CSV char by char is slow and the
  // newlines matter more than the keystrokes.
  await user.paste(text);
  await user.click(screen.getByRole('button', { name: /import from text/i }));
};

describe('BatchImportForm', () => {
  let onImport: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onImport = renderForm();
  });

  describe('parsing pasted CSV', () => {
    it('imports one entry per line', async () => {
      await paste('你好,Hello\n謝謝,Thank you');
      expect(onImport).toHaveBeenCalledWith([
        { mandarin: '你好', translation: 'Hello' },
        { mandarin: '謝謝', translation: 'Thank you' },
      ]);
    });

    it.each(['mandarin,translation', 'Mandarin,English', 'foo,translation'])(
      'skips a header row like %s',
      async header => {
        await paste(`${header}\n你好,Hello`);
        expect(onImport).toHaveBeenCalledWith([{ mandarin: '你好', translation: 'Hello' }]);
      }
    );

    it('keeps a first row that does not look like a header', async () => {
      await paste('你好,Hello\n貓,Cat');
      expect(onImport).toHaveBeenCalledWith([
        { mandarin: '你好', translation: 'Hello' },
        { mandarin: '貓', translation: 'Cat' },
      ]);
    });

    it('keeps commas inside a quoted field', async () => {
      await paste('"你好,世界",Hello');
      expect(onImport).toHaveBeenCalledWith([{ mandarin: '你好,世界', translation: 'Hello' }]);
    });

    it('rejoins extra columns into the translation', async () => {
      await paste('你好,Hello, world');
      expect(onImport).toHaveBeenCalledWith([{ mandarin: '你好', translation: 'Hello, world' }]);
    });

    it('skips rows with fewer than two columns', async () => {
      await paste('你好\n貓,Cat');
      expect(onImport).toHaveBeenCalledWith([{ mandarin: '貓', translation: 'Cat' }]);
    });

    it('skips rows missing either side', async () => {
      await paste('你好,\n,Cat\n貓,Cat');
      expect(onImport).toHaveBeenCalledWith([{ mandarin: '貓', translation: 'Cat' }]);
    });

    it('skips blank lines', async () => {
      await paste('你好,Hello\n\n\n貓,Cat');
      expect(onImport).toHaveBeenCalledWith([
        { mandarin: '你好', translation: 'Hello' },
        { mandarin: '貓', translation: 'Cat' },
      ]);
    });

    it('clears the textarea after a successful import', async () => {
      await paste('你好,Hello');
      expect(screen.getByLabelText(/paste csv data/i)).toHaveValue('');
    });
  });

  describe('rejections', () => {
    it('disables the import button while the textarea is empty', () => {
      expect(screen.getByRole('button', { name: /import from text/i })).toBeDisabled();
    });

    it('warns when nothing parses', async () => {
      await paste('no-comma-here');
      expect(onImport).not.toHaveBeenCalled();
      expect(await screen.findByText(/no valid entries found in csv text/i)).toBeInTheDocument();
    });
  });

  describe('file input', () => {
    const csvFile = (name: string, body: string) => new File([body], name, { type: 'text/csv' });

    it('imports a dropped-in .csv file', async () => {
      const user = userEvent.setup();
      const input = document.querySelector<HTMLInputElement>('#csv-file-input');
      expect(input).not.toBeNull();

      await user.upload(input!, csvFile('x.csv', '你好,Hello'));

      await waitFor(() => {
        expect(onImport).toHaveBeenCalledWith([{ mandarin: '你好', translation: 'Hello' }]);
      });
    });

    it('rejects a non-csv file', async () => {
      // fireEvent rather than user.upload: userEvent honours the accept=".csv"
      // attribute and never fires change, so the guard under test never runs.
      const { fireEvent } = await import('@testing-library/react');
      const input = document.querySelector<HTMLInputElement>('#csv-file-input');
      fireEvent.change(input!, {
        target: { files: [csvFile('notes.txt', '你好,Hello')] },
      });

      expect(await screen.findByText(/please select a csv file/i)).toBeInTheDocument();
      expect(onImport).not.toHaveBeenCalled();
    });

    it('warns when the file parses to nothing', async () => {
      const user = userEvent.setup();
      const input = document.querySelector<HTMLInputElement>('#csv-file-input');
      await user.upload(input!, csvFile('x.csv', 'nope'));

      expect(await screen.findByText(/no valid entries found in csv file/i)).toBeInTheDocument();
    });

    it('opens the picker from the browse button', async () => {
      const user = userEvent.setup();
      const input = document.querySelector<HTMLInputElement>('#csv-file-input');
      const click = vi.spyOn(input!, 'click');
      await user.click(screen.getByRole('button', { name: /browse/i }));
      expect(click).toHaveBeenCalled();
    });
  });

  describe('drag and drop', () => {
    const dropZone = (): HTMLElement => {
      const zone = screen.getByText(/drag and drop a csv file here/i).closest('div')?.parentElement;
      if (!zone) throw new Error('drop zone not found');
      return zone;
    };

    it('imports a dropped csv', async () => {
      const file = new File(['你好,Hello'], 'x.csv', { type: 'text/csv' });
      const dataTransfer = { files: [file] };

      const { fireEvent } = await import('@testing-library/react');
      fireEvent.drop(dropZone(), { dataTransfer });

      await waitFor(() => {
        expect(onImport).toHaveBeenCalledWith([{ mandarin: '你好', translation: 'Hello' }]);
      });
    });

    it('rejects a dropped non-csv', async () => {
      const file = new File(['x'], 'notes.txt', { type: 'text/plain' });
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.drop(dropZone(), { dataTransfer: { files: [file] } });

      expect(await screen.findByText(/please drop a csv file/i)).toBeInTheDocument();
    });

    it('highlights while dragging over and clears on leave', async () => {
      const { fireEvent } = await import('@testing-library/react');
      const zone = dropZone();

      fireEvent.dragOver(zone, { dataTransfer: { files: [] } });
      expect(zone.className).toContain('border-primary-500');

      fireEvent.dragLeave(zone, { dataTransfer: { files: [] } });
      expect(zone.className).not.toContain('border-primary-500');
    });
  });
});
