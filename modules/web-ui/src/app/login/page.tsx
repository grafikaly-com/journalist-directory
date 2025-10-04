'use client';

import { Alert, AlertColor, Box, Button, FormControl, Paper, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function Login() {
  const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<{ username?: string; password?: string }>({});
  const [alert, setAlert] = useState<{ type: AlertColor; message: string }>();

  const referrer = searchParams?.get('referrer');

  async function onSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!(form.username && form.password)) return;

    // axios
    //   .post(`${HOSTNAME}/auth/validateSession`, form)
    //   .then(({ data }) => {
    //     return axios.post(`${HOSTNAME}/auth/login`, form);
    //   })
    //   .then(({ data }) => {
    //     setAlert(undefined);
    //     localStorage.setItem('token', data.token);
    //     localStorage.setItem('editor', data.editor);
    //     localStorage.setItem('username', data.username);
    //     if (referrer) {
    //       router.push(referrer);
    //     } else {
    //       // TODO: remove after more pages are added
    //       router.push('/journalist');
    //     }
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     setAlert({ type: 'error', message: err.response.data.message });
    //   });

    axios
      .post(`${HOSTNAME}/auth/login`, form)
      .then(({ data }) => {
        setAlert(undefined);
        localStorage.setItem('token', data.token);
        localStorage.setItem('editor', data.editor);
        localStorage.setItem('username', data.username);
        if (referrer) {
          router.push(referrer);
        } else {
          // TODO: remove after more pages are added
          router.push('/journalist');
        }
      })
      .catch((err) => {
        console.error(err);
        setAlert({ type: 'error', message: err.response.data.message });
      });
  }

  return (
    <Paper className="flex justify-center p-16 h-screen">
      <form onClick={onSubmit} className="content-center">
        <Box className="flex flex-col gap-4 p-4">
          <Typography variant="h4" gutterBottom>
            Login
          </Typography>
          <FormControl size="small" className="w-full">
            <TextField
              id="username"
              variant="outlined"
              color="primary"
              size="small"
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </FormControl>
          <FormControl size="small" className="w-full">
            <TextField
              id="password"
              variant="outlined"
              color="primary"
              size="small"
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </FormControl>
          <Button type="submit" variant="contained" onClick={onSubmit}>
            Log In
          </Button>
        </Box>
        {alert ? <Alert severity={alert?.type}>{alert?.message}</Alert> : null}
      </form>
    </Paper>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
