import { Typography } from '@mui/material';
import { ReactNode } from 'react';

export default function Field({ name, children }: { name: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col py-4">
      <Typography variant="body2" className="!font-semibold" gutterBottom>
        {name}:
      </Typography>
      <Typography variant="body2">{children}</Typography>
    </div>
  );
}
