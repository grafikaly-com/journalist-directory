import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Autocomplete, Checkbox, FormControl, TextField } from '@mui/material';
import { ReactElement } from 'react';

interface Option {
  id?: string;
  name?: string;
  mediatype?: string;
}

interface FormControlAutocompleteMultiProps<T extends Option> {
  addClassName?: string;
  id: string;
  options: Array<T>;
  getOptionLabel?: (o: T) => string;
  value?: Array<T>;
  label: string;
  onChange: (_e: any, newValue: Array<T>) => void;
  onInputChange?: (_e: any, newValue: string) => void;
  renderOption?: (props: object, option: Option, { selected }: { selected: boolean }) => ReactElement;
}

const renderOptionDefault = (props: object, option: Option, { selected }: { selected: boolean }) => (
  <span {...props} key={option.id}>
    <Checkbox icon={<CheckBoxOutlineBlankIcon fontSize="small" />} checkedIcon={<CheckBoxIcon fontSize="small" />} checked={selected} />
    {option.name || option.mediatype}
  </span>
);

export function FormControlAutocompleteMulti<T extends Option>({
  addClassName,
  id,
  options,
  getOptionLabel,
  value,
  label,
  onChange,
  onInputChange,
  renderOption
}: FormControlAutocompleteMultiProps<T>) {
  return (
    <FormControl size="small" className={addClassName ?? 'w-full'}>
      <Autocomplete
        {...{
          id,
          options,
          // TODO: needs to be reset from the browser url query param
          value,
          onChange,
          onInputChange
        }}
        multiple
        disableCloseOnSelect
        disablePortal
        getOptionLabel={getOptionLabel ?? ((o) => o.name ?? '')}
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
        renderOption={renderOption || renderOptionDefault}
      />
    </FormControl>
  );
}
