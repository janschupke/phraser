import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders input without label', () => {
    render(<Input id="test-input" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input id="test-input" label="Test Label" />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('updates value when typed', async () => {
    const user = userEvent.setup();
    render(<Input id="test-input" />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');

    expect(input).toHaveValue('Hello');
  });

  it('shows error message when error prop is provided', () => {
    render(<Input id="test-input" error="This is an error" />);
    expect(screen.getByText('This is an error')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    const { container } = render(<Input id="test-input" error="Error" />);
    const input = container.querySelector('input');
    expect(input?.className).toContain('border-error-500');
  });

  it('forwards ref', () => {
    const ref = { current: null };
    render(<Input id="test-input" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
