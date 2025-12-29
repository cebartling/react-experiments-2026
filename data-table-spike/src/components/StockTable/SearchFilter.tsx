import { useCallback, useState, useEffect, useRef } from 'react';

/**
 * Props for the SearchFilter component.
 */
interface SearchFilterProps {
  /** The current filter value (controlled component) */
  value: string;
  /** Callback invoked with the new filter value after debounce delay */
  onChange: (value: string) => void;
  /** Placeholder text for the search input. Defaults to "Search stocks..." */
  placeholder?: string;
  /** Debounce delay in milliseconds before onChange is called. Defaults to 300ms. */
  debounceMs?: number;
}

export function SearchFilter({
  value,
  onChange,
  placeholder = 'Search stocks...',
  debounceMs = 300,
}: SearchFilterProps) {
  const [localValue, setLocalValue] = useState(value);
  const onChangeRef = useRef(onChange);

  // Keep ref up to date without triggering effects
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChangeRef.current(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, debounceMs]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChangeRef.current('');
  }, []);

  return (
    <div className="search-filter">
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="search-input"
        aria-label="Search stocks"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="search-clear"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
