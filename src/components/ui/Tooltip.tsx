import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ReactElement } from 'react';

interface TooltipProps {
  label: string;
  /** A single focusable element; it becomes the trigger. */
  children: ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

/**
 * Replaces native title attributes, which never show on keyboard focus or
 * touch, wait over a second on hover, and cannot be styled.
 *
 * Each tooltip brings its own Provider: components here are rendered
 * standalone in tests, and a shared app-level Provider would have to be
 * threaded through every one of those renders.
 */
export function Tooltip({ label, children, side = 'top' }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className="z-60 rounded-md bg-neutral-800 px-2 py-1 text-xs font-medium text-white shadow-md animate-fade-in"
          >
            {label}
            <TooltipPrimitive.Arrow className="fill-neutral-800" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
