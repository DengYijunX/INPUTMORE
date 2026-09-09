type CapabilityIconName = 'text' | 'translation' | 'retrieval';

type CapabilityIconProps = {
  name: CapabilityIconName;
};

export function CapabilityIcon({ name }: CapabilityIconProps) {
  return (
    <svg
      data-testid={`capability-icon-${name}`}
      aria-hidden="true"
      className="capability-icon"
      viewBox="0 0 24 24"
      focusable="false"
    >
      {name === 'text' && <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>}
      {name === 'translation' && <><path d="M4 6h8M8 3v3M6 6c.7 3 2.2 5.1 4.5 6.5M5 13l5-5M13 14h6M16 11v3M14 18l2-5 2 5M14.8 16h2.4" /></>}
      {name === 'retrieval' && <><circle cx="10.5" cy="10.5" r="5.5" /><path d="m15 15 5 5" /></>}
    </svg>
  );
}
