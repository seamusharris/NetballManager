
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface SmartSelectOption {
  id: number | string;
  name: string;
  displayName?: string;
  disabled?: boolean;
  [key: string]: any;
}

export interface SmartSelectProps {
  value?: string | number;
  onValueChange: (value: string) => void;
  options: SmartSelectOption[];
  placeholder?: string;
  emptyMessage?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  disabled?: boolean;
  className?: string;
}

export function SmartSelect({
  value,
  onValueChange,
  options = [],
  placeholder = "Select an option",
  emptyMessage = "No options available",
  allowEmpty = false,
  emptyLabel = "None",
  isLoading = false,
  error = null,
  onRetry,
  disabled = false,
  className
}: SmartSelectProps) {
  // Convert value to string for Select component
  const stringValue = value?.toString() || (allowEmpty ? "empty" : "");

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="h-10 flex items-center">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex-1 ml-2">
          Failed to load options
        </AlertDescription>
        {onRetry && (
          <RefreshCw 
            className="h-4 w-4 cursor-pointer hover:text-red-600" 
            onClick={onRetry}
          />
        )}
      </Alert>
    );
  }

  return (
    <Select 
      value={stringValue} 
      onValueChange={(val) => {
        if (val === "empty") {
          onValueChange("");
        } else {
          onValueChange(val);
        }
      }}
      disabled={disabled || isLoading}
    >
      <FormControl>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {allowEmpty && (
          <SelectItem value="empty">{emptyLabel}</SelectItem>
        )}
        {options.length === 0 ? (
          <SelectItem value="disabled" disabled>
            {emptyMessage}
          </SelectItem>
        ) : (
          options.map((option) => (
            <SelectItem 
              key={option.id} 
              value={option.id.toString()}
              disabled={option.disabled}
            >
              {option.displayName || option.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

// Specialized select components for common use cases
export interface SeasonSelectProps extends Omit<SmartSelectProps, 'options' | 'isLoading' | 'error'> {
  seasons: SmartSelectOption[];
  isLoading?: boolean;
  error?: Error | null;
}

export function SeasonSelect({ seasons, isLoading, error, ...props }: SeasonSelectProps) {
  return (
    <SmartSelect
      options={seasons}
      isLoading={isLoading}
      error={error}
      placeholder="Select a season"
      emptyMessage="No seasons available"
      {...props}
    />
  );
}

export interface SectionSelectProps extends Omit<SmartSelectProps, 'options' | 'isLoading' | 'error'> {
  sections: SmartSelectOption[];
  isLoading?: boolean;
  error?: Error | null;
}

export function SectionSelect({ sections, isLoading, error, ...props }: SectionSelectProps) {
  return (
    <SmartSelect
      options={sections}
      isLoading={isLoading}
      error={error}
      placeholder="Select a section"
      emptyMessage="No sections available"
      allowEmpty={true}
      emptyLabel="No section"
      {...props}
    />
  );
}

export interface TeamSelectProps extends Omit<SmartSelectProps, 'options' | 'isLoading' | 'error'> {
  teams: SmartSelectOption[];
  isLoading?: boolean;
  error?: Error | null;
}

export function TeamSelect({ teams, isLoading, error, ...props }: TeamSelectProps) {
  return (
    <SmartSelect
      options={teams}
      isLoading={isLoading}
      error={error}
      placeholder="Select a team"
      emptyMessage="No teams available"
      {...props}
    />
  );
}
