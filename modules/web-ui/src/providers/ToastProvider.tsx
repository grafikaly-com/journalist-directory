import { Fade, Snackbar } from '@mui/material';
import { ReactElement, createContext, useContext, useState } from 'react';

const ToastContext = createContext({ setToastMessage: (s: string) => {} });

export const ToastProvider = ({ children }: { children: ReactElement }) => {
  const [toastMessage, setToastMessage] = useState<string | null>();

  return (
    <ToastContext.Provider value={{ setToastMessage }}>
      {children}
      <Snackbar
        open={!!toastMessage}
        message={toastMessage}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={2000}
        TransitionComponent={Fade}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const { setToastMessage: toast } = useContext(ToastContext);
  return { toast };
};
