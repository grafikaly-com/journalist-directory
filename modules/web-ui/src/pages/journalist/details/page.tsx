'use client';

import { JournalistProps } from '@/types/journalist';

import EmailIcon from '@mui/icons-material/Email';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, IconButton, Link, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { flatMap, uniq } from 'lodash';
import { useRouter } from 'next/navigation';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import { classes, stylesheet } from 'typestyle';
import Field from './field';

const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;

interface JournalistDetailsProps {
  id?: string;
}

export const JournalistDetails = ({ id }: JournalistDetailsProps): ReactElement => {
  const router = useRouter();
  const [journalist, setJournalist] = useState<JournalistProps>();

  const getJournalist = useCallback(() => {
    axios
      .get(`${HOSTNAME}/journalist/${id}`)
      .then(({ data }) => {
        setJournalist(data);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          router.push('/login?referrer=/journalist');
        }
      });
  }, [id, router]);

  useEffect(() => {
    if (id) getJournalist();
  }, [id, getJournalist]);

  return (
    <Box className="h-screen p-8 flex flex-col gap-2">
      <Paper className="rounded-none !shadow-none">
        <Typography variant="h5" className="pb-8">{`${journalist?.first_name} ${journalist?.last_name}`}</Typography>
        <div className={classes(styles.fields, 'overflow-y-scroll')}>
          <Field name={'Email'}>{journalist?.email}</Field>
          <Field name={'News Types'}>{journalist?.news_types?.map((nt) => nt.name).join(', ')}</Field>
          <Field name={'Job Titles'}>{journalist?.role_types?.map((rt) => rt.name).join(', ')}</Field>
          <Field name={'Format Types'}>{journalist?.format_types?.map((rt) => rt.name).join(', ')}</Field>
          <Field name={'Publications'}>{journalist?.publications?.map((p) => p.name).join(', ')}</Field>
          <Field name={'Publication Mediatypes'}>{uniq(flatMap(journalist?.publications?.map((p) => p.mediatypes))).join(', ')}</Field>
          <Field name={'Publication Tiers'}>{uniq(flatMap(journalist?.publications?.map((p) => p.tiers))).join(', ')}</Field>
          <Field name={'Regions'}>{journalist?.regions?.map((p) => p.name).join(', ')}</Field>
          <Field name={'Phone'}>{journalist?.phone}</Field>
          <Field name={'DDI'}>{journalist?.ddi}</Field>
          <Field name={'Mobile'}>{journalist?.mobile}</Field>
          <Field name={'Twitter'}>
            <Link href={journalist?.twitter} underline="none" target="_blank" rel="noreferrer" className="flex gap-1">
              {journalist?.twitter}
              {journalist?.twitter && (
                <IconButton size="small" className="p-0">
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              )}
            </Link>
          </Field>
          <Field name={'Profile'}>
            <Link href={journalist?.datasource} underline="none" target="_blank" rel="noreferrer" className="flex gap-1">
              {journalist?.datasource}
              <IconButton size="small" className="p-0">
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Link>
          </Field>
        </div>
      </Paper>
      <Paper className="rounded-none !shadow-none">
        <div className="flex flex-col gap-2 py-2">
          <Typography variant="body2">{"Something need updating, let us know here and we'll get it sorted."}</Typography>
          <Link href="mailto:mohsin.khan@grafikaly.com" underline="none" target="_blank" rel="noreferrer" className="flex gap-1">
            <IconButton size="small" className="p-0">
              <EmailIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2">{'mailto:mohsin.khan@grafikaly.com'}</Typography>
          </Link>
        </div>
      </Paper>
    </Box>
  );
};

const styles = stylesheet({
  fields: {
    maxHeight: 'calc(100vh - 200px)'
  }
});

export default JournalistDetails;
