import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { FormControl, IconButton, InputAdornment, TextField } from '@mui/material';
import { ReactElement } from 'react';

interface FormControlTextFieldProps {
  addClassName?: string;
  id: string;
  value: string;
  label: string;
  onChange: (e: any) => void;
  onClick?: (e: any) => void;
  disabled?: boolean;
  InputProps?: { endAdornment: ReactElement };
  color?: string;
  focused?: boolean;
  error?: boolean;
  helperText?: string;
}

export function FormControlTextField({
  addClassName,
  id,
  value,
  label,
  onChange,
  onClick,
  disabled,
  InputProps,
  color,
  focused,
  error,
  helperText
}: FormControlTextFieldProps) {
  return (
    <FormControl size="small" className={addClassName ?? 'w-full'}>
      <TextField
        {...{
          id,
          label,
          // TODO: needs to be reset from the browser url query param
          value,
          onChange,
          color,
          focused,
          error,
          helperText,
          ...((onClick || disabled) && {
            InputProps: {
              endAdornment: (
                <InputAdornment position="end" className="flex gap-2">
                  <IconButton color="primary" edge="end" {...{ onClick, disabled }}>
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }
          }),
          ...(InputProps && { InputProps })
        }}
        variant="outlined"
        color="primary"
        size="small"
      />
    </FormControl>
  );
}
