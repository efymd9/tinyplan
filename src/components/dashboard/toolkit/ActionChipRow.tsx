"use client";

interface ActionChip {
  id: string;
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
}

interface ActionChipRowProps {
  chips: ActionChip[];
  onSelect?: (id: string) => void;
  multiSelect?: boolean;
}

export function ActionChipRow({ chips, onSelect, multiSelect = false }: ActionChipRowProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role={multiSelect ? "group" : undefined}
    >
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onSelect?.(chip.id)}
          aria-pressed={chip.selected}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150 ${
            chip.selected
              ? "bg-primary text-white border-primary shadow-button"
              : "bg-white text-foreground border-border hover:border-primary/40 hover:bg-primary-light/40"
          }`}
        >
          {chip.icon && <span className="w-4 h-4">{chip.icon}</span>}
          {chip.label}
        </button>
      ))}
    </div>
  );
}
