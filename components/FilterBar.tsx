"use client";

type FilterBarProps = {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
};

export default function FilterBar({ categories, active, onSelect }: FilterBarProps) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 pt-1">
      {categories.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            aria-pressed={isActive}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
              isActive
                ? "bg-sofia-purple text-white"
                : "bg-white text-sofia-choco ring-1 ring-sofia-rose/30"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
