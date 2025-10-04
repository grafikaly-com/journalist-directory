'use client';

import { Typography } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import { Box } from '@mui/system';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const pages = [{ id: 'journalist', label: 'Journalist Directory' }];

export default function NavBar() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed">
      <Box className="bg-black px-8 py-3 h-16 flex justify-between">
        <Image src="" alt="Logo" width={180} height={40} />
        <Typography variant="h4"></Typography>
      </Box>
    </AppBar>
  );
}
