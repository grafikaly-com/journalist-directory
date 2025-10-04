import { Autocomplete, createFilterOptions, FilterOptionsState, FormControl, TextField } from '@mui/material';

interface Option {
  id?: string;
  name?: string;
  // title?: string;
  inputValue?: string;
}

interface FormControlAutocompleteSingleWithCreateProps<T extends Option> {
  addClassName?: string;
  id: string;
  options: Array<T>;
  value: T | undefined;
  label: string;
  onChange: (_e: any, newValue: string | T | null) => void;
  onInputChange?: (_e: any, newValue: string) => void;
  disablePortal?: boolean;
}

const filter = createFilterOptions<Option>();

const renderOptionDefault = (props: object, option: Option, { selected }: { selected: boolean }) => (
  <span {...props} key={option.id}>
    {option.name}
  </span>
);

export function FormControlAutocompleteSingleWithCreate<T extends Option>({
  addClassName,
  id,
  options,
  value,
  label,
  onChange,
  onInputChange,
  disablePortal = true
}: FormControlAutocompleteSingleWithCreateProps<T>) {
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
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        freeSolo
        filterOptions={(options, params) => {
          const filtered = filter(options, params as FilterOptionsState<Option>);

          const { inputValue } = params;

          // Suggest the creation of a new value
          const isExisting = options.some((option) => inputValue === option.name);
          if (inputValue !== '' && !isExisting) {
            const newFilterOption = {
              inputValue,
              name: `Create: "${inputValue}"`
            };
            filtered.push(newFilterOption);
          }

          return filtered as T[];
        }}
        getOptionLabel={(option) => {
          // Value selected with enter, right from the input
          if (typeof option === 'string') {
            return option;
          }

          // Add option created dynamically
          if (option.inputValue) {
            return option.inputValue;
          }

          // Regular option
          return option.name ?? '';
        }}
        renderOption={renderOptionDefault}
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
