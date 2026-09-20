import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('links to the repository safely', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /view on github/i });
    expect(link).toHaveAttribute('href', 'https://github.com/janschupke/phraser');
    expect(link).toHaveAttribute('target', '_blank');
    // noopener matters on a target=_blank link.
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('is hidden on short screens for the viewport-fit route', () => {
    const { container } = render(<Footer fit />);
    expect(container.querySelector('footer')?.className).toContain('hidden');
  });
});
