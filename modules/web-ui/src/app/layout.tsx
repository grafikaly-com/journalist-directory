import NavBar from '@/components/mui/navbar';
import { theme } from '@/theme';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
import type { Metadata } from 'next';

import EmailIcon from '@mui/icons-material/Email';
import { AppBar, IconButton, Typography } from '@mui/material';
import { Open_Sans } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const open_sans = Open_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Journalist Directory',
  description: ''
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // TODO: interceptor for axios
  // const instance = axios.create({
  //   baseURL: process.env.MEDIAMINE_API_HOSTNAME,
  //   timeout: 1000,
  //   headers: { 'X-Custom-Header': 'foobar' }
  // });

  return (
    <html lang="en">
      <body className={open_sans.className}>
        <ThemeProvider theme={theme}>
          <NavBar />
          {children}
          <AppBar position="fixed" color="default" sx={{ top: 'auto', bottom: 0 }}>
            <div className="p-4 flex gap-2">
              <Typography variant="body2">{"Missing someone? Let us know here and we'll get hunting"}</Typography>
              <Link href="mailto:mohsin.khan@grafikaly.com" target="_blank" rel="noreferrer" className="flex gap-1">
                <IconButton size="small" className="p-0">
                  <EmailIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2">mailto:mohsin.khan@grafikaly.com</Typography>
              </Link>
            </div>
          </AppBar>
        </ThemeProvider>
      </body>
    </html>
  );
}
