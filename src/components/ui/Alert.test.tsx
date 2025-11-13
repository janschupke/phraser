import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders children', () => {
    render(<Alert type="success">Success message</Alert>);
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('applies success styling', () => {
    const { container } = render(<Alert type="success">Success</Alert>);
    const alert = container.querySelector('[role="alert"]');
    expect(alert?.className).toContain('bg-success-100');
  });

  it('applies error styling', () => {
    const { container } = render(<Alert type="error">Error</Alert>);
    const alert = container.querySelector('[role="alert"]');
    expect(alert?.className).toContain('bg-error-100');
  });

  it('shows dismiss button when onDismiss is provided', () => {
    const handleDismiss = vi.fn();
    render(
      <Alert type="success" onDismiss={handleDismiss}>
        Message
      </Alert>
    );

    expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const handleDismiss = vi.fn();
    const user = userEvent.setup();
    render(
      <Alert type="success" onDismiss={handleDismiss}>
        Message
      </Alert>
    );

    await user.click(screen.getByLabelText('Dismiss'));
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not show dismiss button when onDismiss is not provided', () => {
    render(<Alert type="success">Message</Alert>);
    expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument();
  });
});
