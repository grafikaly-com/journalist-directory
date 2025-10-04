import { Autocomplete, FormControl, TextField } from '@mui/material';

interface Option {
  id?: string;
  name?: string;
}

interface FormControlAutocompleteSingleProps<T extends Option> {
  addClassName?: string;
  id: string;
  options: Array<T>;
  value: T | undefined;
  label: string;
  onChange: (_e: any, newValue: T | null) => void;
  onInputChange?: (_e: any, newValue: string) => void;
  disablePortal?: boolean;
}

export function FormControlAutocompleteSingle<T extends Option>({
  addClassName,
  id,
  options,
  value,
  label,
  onChange,
  onInputChange,
  disablePortal = true
}: FormControlAutocompleteSingleProps<T>) {
  return (
    <FormControl size="small" className={addClassName ?? 'w-full'}>
      <Autocomplete
        {...{
          id,
          options,
          // TODO: needs to be reset from the browser url query param
          value,
          onChange,
          onInputChange,
          disablePortal
        }}
        getOptionLabel={(o) => o.name ?? ''}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            label={label}
            // TODO: needs to be reset from the browser url query param
            // value={value}
          />
        )}
        size="small"
      />
    </FormControl>
  );
}
