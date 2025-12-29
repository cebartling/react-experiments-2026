import { useCallback, useState, useEffect } from 'react';

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchFilter({
  value,
  onChange,
  placeholder = 'Search stocks...',
  debounceMs = 300,
}: SearchFilterProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, debounceMs]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

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
