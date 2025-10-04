import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Fade } from '@mui/material';
import { Dispatch, FC, ReactElement, SetStateAction } from 'react';

interface DialogFormProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  title: string;
  children?: ReactElement | null;
  onCancel: () => void;
  moreActions: ReactElement;
}

export const DialogForm: FC<DialogFormProps> = ({ open, setOpen, title, children, onCancel, moreActions }): ReactElement => {
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" TransitionComponent={Fade} keepMounted>
      <DialogTitle className="p-4">{title}</DialogTitle>
      <DialogContent>
        <div className="pt-4">{children}</div>
      </DialogContent>
      <DialogActions className="p-4">
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        {moreActions}
      </DialogActions>
    </Dialog>
  );
};
