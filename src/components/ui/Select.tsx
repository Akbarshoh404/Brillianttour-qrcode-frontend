import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
  onAddNew,
  addNewLabel = "Add new",
  disabled,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-black/10 bg-white px-4 py-3.5 text-left text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-wait disabled:opacity-60 dark:border-white/10 dark:bg-gray-800 dark:text-gray-100"
      >
        <span className="min-w-0 flex-1 truncate">
          {selected ? (
            <>
              <span className="text-gray-800 dark:text-gray-100">{selected.label}</span>
              {selected.sublabel && <span className="ml-1.5 text-gray-400">{selected.sublabel}</span>}
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="glass-border absolute z-30 mt-1.5 w-full overflow-hidden rounded-2xl bg-white py-1.5 shadow-card dark:bg-gray-800 dark:shadow-card-dark"
          >
            <div className="max-h-64 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition hover:bg-black/[0.04] dark:hover:bg-white/10"
                >
                  <span className="min-w-0 flex-1 truncate">
                    <span className="text-gray-800 dark:text-gray-100">{option.label}</span>
                    {option.sublabel && <span className="ml-1.5 truncate text-xs text-gray-400">{option.sublabel}</span>}
                  </span>
                  {option.value === value && <Check className="h-3.5 w-3.5 shrink-0 text-indigo-500" />}
                </button>
              ))}
            </div>

            {onAddNew && (
              <>
                <div className="mx-4 my-1 h-px bg-black/[0.06] dark:bg-white/10" />
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onAddNew();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-indigo-600 transition hover:bg-indigo-500/10 dark:text-indigo-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {addNewLabel}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
