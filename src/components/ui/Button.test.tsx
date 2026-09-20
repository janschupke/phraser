import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies primary variant by default', () => {
    const { container } = render(<Button>Click me</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-primary-600');
  });

  it('applies success variant', () => {
    const { container } = render(<Button variant="success">Click me</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-success-600');
  });

  it('applies neutral variant', () => {
    const { container } = render(<Button variant="neutral">Click me</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('bg-neutral-300');
  });

  it('gives every variant a visible focus ring, icon included', () => {
    // The icon variant previously had no ring at all, which made every edit,
    // delete and cog button in the app invisible to a keyboard user.
    const variants = ['primary', 'success', 'neutral', 'danger', 'icon'] as const;
    for (const variant of variants) {
      const { container, unmount } = render(<Button variant={variant}>Click me</Button>);
      const button = container.querySelector('button');
      expect(button?.className, variant).toContain('focus-visible:ring-2');
      expect(button?.className, variant).toMatch(/focus-visible:ring-\w+-\d+/);
      unmount();
    }
  });

  it('passes through additional props', () => {
    render(
      <Button type="submit" disabled>
        Click me
      </Button>
    );
    const button = screen.getByText('Click me');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeDisabled();
  });
});
