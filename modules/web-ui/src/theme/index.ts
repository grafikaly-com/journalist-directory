'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    }
  },
  palette: {
    /* switch to 'dark' for dark mode */
    mode: 'light'
    // primary: {
    //   main: '#0288d1'
    // },
    // secondary: {
    //   main: blue[500]
    // }
  }
});
