interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

/**
 * A labelled switch.
 *
 * One <label> wraps both the text and the control, which is what makes the
 * whole row -- text and switch alike -- a click target, with no htmlFor/id
 * plumbing and without the two-labels-for-one-input problem the previous markup
 * had. The visible track is decorative; the real control is the sr-only
 * checkbox that drives it through peer- variants.
 */
export function ToggleSetting({ label, description, checked, onChange }: ToggleSettingProps) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer">
      <span className="flex-1">
        <span className="block text-base font-medium text-neutral-800">{label}</span>
        <span className="block text-sm text-neutral-600 mt-1">{description}</span>
      </span>
      <span className="relative inline-flex shrink-0 items-center">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <span className="block w-11 h-6 bg-neutral-300 peer-focus-visible:ring-4 peer-focus-visible:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></span>
      </span>
    </label>
  );
}
