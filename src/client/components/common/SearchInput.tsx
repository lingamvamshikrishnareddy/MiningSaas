'use client';
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../lib/utils';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  defaultValue?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({ placeholder = 'Search...', onSearch, defaultValue = '', debounceMs = 300, className }: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => setValue('')}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
