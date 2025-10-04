'use client';

import { FormControlAutocompleteMulti } from '@/components/mui/formControls/autocomplete/multi';
import { FormControlAutocompleteSingle } from '@/components/mui/formControls/autocomplete/single';
import { FormControlTextField } from '@/components/mui/formControls/textField';
import { useToast } from '@/providers/ToastProvider';
import {
  FormatTypeProps,
  JournalistProps,
  NewsTypeProps,
  PublicationFeedProps,
  PublicationProps,
  RegionProps,
  RoleToFeedMapProps,
  RoleTypeProps
} from '@/types/journalist';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Box, Button, Chip, CircularProgress, Divider, IconButton, InputAdornment, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { debounce, isBoolean, uniqBy } from 'lodash';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;

interface EditJournalistProps {
  id?: string;
  setOpenEditDrawer: (value: boolean) => void;
}

export default function EditJournalist({ id, setOpenEditDrawer }: EditJournalistProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [title, setTitle] = useState<string>(id ? 'Edit Journalist' : 'Add Journalist');
  const [journalist, setJournalist] = useState<JournalistProps>();
  const [formatTypes, setFormatTypes] = useState<Array<FormatTypeProps>>([]);
  const [newsTypes, setNewsTypes] = useState<Array<NewsTypeProps>>([]);
  const [roleTypes, setRoleTypes] = useState<Array<RoleTypeProps>>([]);
  const [publications, setPublications] = useState<Array<PublicationProps>>([]);
  const [publicationsInput, setPublicationsInput] = useState<string>('');
  const [publicationFeeds, setPublicationFeeds] = useState<Array<PublicationFeedProps>>([]);
  const [regions, setRegions] = useState<Array<RegionProps>>([]);
  const [regionsInput, setRegionsInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNewValidated, setIsNewValidated] = useState<boolean>(false);
  const [isValidated, setIsValidated] = useState<boolean>();
  const [isUserApproved, setIsUserApproved] = useState<boolean>();
  const [roleToFeedMap, setRoleToFeedMap] = useState<RoleToFeedMapProps>({});

  const getPublications = useCallback(
    (ids?: Array<string>) => {
      if (ids) {
        Promise.all([axios.get(`${HOSTNAME}/publication`, { params: { ids } })])
          .then(([resp]) => {
            const publications = uniqBy([...resp.data.items], 'id');
            setPublications(publications);
            setPublicationFeeds(
              uniqBy(
                publications.flatMap((p) => p.feed ?? []),
                'id'
              )
            );
          })
          .catch((err) => {
            if (err.response.status === 401) {
              router.push('/login?referrer=/journalist');
            }
          });
      } else {
        Promise.all([axios.get(`${HOSTNAME}/publication`)])
          .then(([resp]) => {
            setPublications(uniqBy([...resp.data.items], 'id'));
          })
          .catch((err) => {
            if (err.response.status === 401) {
              router.push('/login?referrer=/journalist');
            }
          });
      }
    },
    [router]
  );

  const getRegions = (ids?: Array<string>) => {
    if (ids) {
      Promise.all([axios.get(`${HOSTNAME}/region`)])
        .then(([resp]) => {
          setRegions(uniqBy([...resp.data.items], 'id'));
        })
        .catch((err) => console.error(err));
    } else {
      Promise.all([axios.get(`${HOSTNAME}/region`)])
        .then(([resp]) => {
          setRegions(uniqBy([...resp.data.items], 'id'));
        })
        .catch((err) => console.error(err));
    }
  };

  const validateJournalistEmail = () => {
    if (journalist?.email) {
      axios
        .post(`${HOSTNAME}/journalist/validateEmails`, {
          emails: [journalist?.email]
        })
        .then((response) => {
          setIsNewValidated(response.data.items[0].mediamineIsValidEmail);
          setIsValidated(response.data.items[0].mediamineIsValidEmail);
        })
        .catch((err) => {
          console.error(err);
          setIsNewValidated(false);
          setIsValidated(false);
        });
    }
  };

  const validateJournalist = () =>
    axios
      .post(`${HOSTNAME}/journalist/validate`, {
        ids: [id]
      })
      .then((response) => {
        setIsValidated(response.data.items?.[0].mediamineIsValidEmail);
      })
      .catch((err) => {
        console.error(err);
        setIsValidated(false);
      });

  const userApproveJournalist = (isUserApproved: boolean) =>
    axios
      .post(`${HOSTNAME}/journalist/user-approve`, {
        ids: [id],
        isUserApproved
      })
      .then(() => {
        setIsValidated(isUserApproved || undefined); // TODO: what should be the end result here?
        setIsUserApproved(isUserApproved);
      })
      .catch((err) => {
        console.error(err);
      });

  useEffect(() => {
    axios
      .get(`${HOSTNAME}/format-type`)
      .then(({ data }) => {
        setFormatTypes(data.items);
      })
      .catch((err) => console.error(err));

    axios
      .get(`${HOSTNAME}/news-type`)
      .then(({ data }) => {
        setNewsTypes(data.items);
      })
      .catch((err) => console.error(err));

    axios
      .get(`${HOSTNAME}/role-type`)
      .then(({ data }) => {
        setRoleTypes(data.items);
      })
      .catch((err) => console.error(err));

    getPublications();
    getRegions();
  }, [getPublications]);

  useEffect(() => {
    const getJournalist = () => {
      setIsLoading(true);
      axios
        .get(`${HOSTNAME}/journalist/${id}`)
        .then(({ data }) => {
          setJournalist(data);
          setTitle(`Edit Journalist: ${data?.first_name} ${data?.last_name}`);
          getPublications(data.publications?.map((p: PublicationProps) => p.id));
          getRegions(data.regions?.map((r: RegionProps) => r.id));
          setRoleToFeedMap(data.roleToFeedMap);
          setIsLoading(false);
        })
        .catch((err) => console.error(err));
    };

    if (id) {
      getJournalist();
    }
  }, [id, getPublications]);

  const dPublicationsInput = useMemo(() => debounce((value) => setPublicationsInput(value), 500), []);
  useEffect(() => {
    if (publicationsInput) {
      axios
        .get(
          `${HOSTNAME}/publication?${new URLSearchParams({
            name: publicationsInput
          }).toString()}`
        )
        .then(({ data }) => {
          setPublications(uniqBy([...publications, ...data.items], 'id'));
        })
        .catch((err) => console.error(err));
    }
    // dependencies array can't add publications because it gets modified in the hook callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicationsInput]);

  const dRegionsInput = useMemo(() => debounce((value) => setRegionsInput(value), 500), []);
  useEffect(() => {
    if (regionsInput) {
      axios
        .get(
          `${HOSTNAME}/region?${new URLSearchParams({
            name: regionsInput
          }).toString()}`
        )
        .then(({ data }) => {
          setRegions([...regions, ...data.items]);
        })
        .catch((err) => console.error(err));
    }
    // dependencies array can't add regions because it gets modified in the hook callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionsInput]);

  const onArchiveJournalist = () => {
    axios
      .put(`${HOSTNAME}/journalist/${id}/archive`)
      .then(() => {
        toast('Journalist is archived successfully.');
      })
      .catch((err) => {
        if (err.response.status === 401) {
          router.push('/login?referrer=/journalist');
        }
      });
  };

  const onSaveJournalist = () => {
    const payload = {
      ...journalist,
      firstName: journalist?.first_name,
      lastName: journalist?.last_name,
      formatTypeIds: journalist?.format_types?.map((ft) => ft.id),
      newsTypeIds: journalist?.news_types?.map((nt) => nt.id),
      roleTypeIds: journalist?.role_types?.map((rt) => rt.id),
      roleToFeedMap,
      publicationIds: journalist?.publications?.map((p) => p.id),
      regionIds: journalist?.regions?.map((r) => r.id)
    };

    if (id) {
      axios
        .put(`${HOSTNAME}/journalist/${id}`, payload)
        .then(() => {
          toast('Journalist Details are saved successfully.');
          setOpenEditDrawer(false);
        })
        .catch((err) => console.error(err));
    } else {
      axios
        .post(`${HOSTNAME}/journalist`, payload)
        .then(() => {
          toast('Journalist Details are saved successfully.');
          setOpenEditDrawer(false);
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <>
      <Box className="h-screen">
        {isLoading ? (
          <Box className="h-screen flex justify-center items-center">
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Paper className="sticky top-0 px-8 py-4 rounded-none z-50 shadow-sm">
              <Typography variant="h4">{title}</Typography>
            </Paper>
            <Paper className="p-8 rounded-none flex flex-col gap-8">
              <FormControlTextField
                id="first-name"
                value={journalist?.first_name ?? ''}
                label={'First Name'}
                onChange={(e) => setJournalist({ ...journalist, first_name: e.target.value })}
              />

              <FormControlTextField
                id="last-name"
                value={journalist?.last_name ?? ''}
                label={'Last Name'}
                onChange={(e) => setJournalist({ ...journalist, last_name: e.target.value })}
              />

              <FormControlTextField
                id="email"
                value={journalist?.email ?? ''}
                label={'Email'}
                onChange={(e) => setJournalist({ ...journalist, email: e.target.value })}
                {...(isValidated ? { color: 'success' } : {})}
                focused={isBoolean(isValidated)}
                error={isBoolean(isValidated) && !isValidated}
                helperText={isBoolean(isValidated) && !isValidated ? 'Email is considered invalid' : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" className="flex gap-2">
                      <IconButton
                        color="primary"
                        aria-label="toggle password visibility"
                        edge="end"
                        onClick={() => {
                          if (id) {
                            validateJournalist();
                          } else {
                            validateJournalistEmail();
                          }
                        }}
                        disabled={!journalist?.email}
                      >
                        <VerifiedUserIcon
                          fontSize="small"
                          color={isValidated || isNewValidated || journalist?.valid_email ? 'success' : 'error'}
                        />
                      </IconButton>
                      {id && (
                        <IconButton
                          color="primary"
                          aria-label="toggle password visibility"
                          edge="end"
                          onClick={() => userApproveJournalist(!(isUserApproved || journalist?.user_approved))}
                          disabled={!journalist?.email}
                        >
                          <HowToRegIcon fontSize="small" color={isUserApproved || journalist?.user_approved ? 'success' : 'primary'} />
                        </IconButton>
                      )}
                    </InputAdornment>
                  )
                }}
              />

              <FormControlAutocompleteMulti
                id="format-types"
                options={formatTypes}
                value={formatTypes.filter((ft) => journalist?.format_types?.map((jrt: FormatTypeProps) => jrt.id).includes(ft.id))}
                label={'Format Types'}
                onChange={(_, newValue) => setJournalist({ ...journalist, format_types: newValue as Array<FormatTypeProps> })}
              />

              <FormControlAutocompleteMulti
                id="news-types"
                options={newsTypes}
                value={newsTypes.filter((nt) => journalist?.news_types?.map((jnt: NewsTypeProps) => jnt.id).includes(nt.id))}
                label={'News Types'}
                onChange={(_, newValue) => setJournalist({ ...journalist, news_types: newValue as Array<NewsTypeProps> })}
              />

              <FormControlAutocompleteMulti
                id="publications"
                options={publications}
                value={journalist?.publications}
                label={'Publications'}
                onInputChange={(_, newValue) => {
                  if (newValue !== '') dPublicationsInput(newValue);
                }}
                onChange={(_, newValue) => {
                  const jPublications = newValue as Array<PublicationProps>;
                  setJournalist({ ...journalist, publications: jPublications });

                  const pIds = jPublications.map((p) => p.id);
                  setPublicationFeeds(
                    uniqBy(
                      publications.filter((p) => pIds.includes(p.id)).flatMap((p) => p.feed ?? []),
                      'id'
                    )
                  );
                }}
              />

              <FormControlAutocompleteMulti
                id="role-types"
                options={roleTypes}
                value={roleTypes.filter((rt) => journalist?.role_types?.map((jrt: RoleTypeProps) => jrt.id).includes(rt.id))}
                label={'Job Titles'}
                onChange={(_, newValue) => {
                  const role_types = newValue as Array<NewsTypeProps>;
                  setRoleToFeedMap(
                    role_types.reduce((memo: { [key: string]: string | null }, rt) => {
                      memo[rt.id] = roleToFeedMap[rt.id] ?? null;
                      return memo;
                    }, {})
                  );
                  setJournalist({ ...journalist, role_types });
                }}
              />

              {publicationFeeds.length > 0 && (
                <>
                  <Divider textAlign="left">
                    <Chip label="Feeds for Job Titles" size="small" />
                  </Divider>
                  {Object.keys(roleToFeedMap).map((rfid) => (
                    <FormControlAutocompleteSingle
                      key={rfid}
                      id={`rfid-${rfid}`}
                      options={publicationFeeds}
                      value={publicationFeeds.find((pf) => pf.id === roleToFeedMap[rfid])}
                      label={`Feed for Job Title ${journalist?.role_types?.find((rt) => rt.id === rfid)?.name}`}
                      onChange={(_e, newValue) => {
                        if (newValue) {
                          setRoleToFeedMap({ ...roleToFeedMap, [rfid]: newValue.id });
                        } else {
                          setRoleToFeedMap({ ...roleToFeedMap, [rfid]: null });
                        }
                      }}
                    />
                  ))}
                  <Divider />
                </>
              )}

              <FormControlAutocompleteMulti
                id="regions"
                options={regions}
                value={journalist?.regions}
                label={'Regions'}
                onInputChange={(_, newValue): void => dRegionsInput(newValue)}
                onChange={(_, newValue) => setJournalist({ ...journalist, regions: newValue as Array<RegionProps> })}
              />

              <FormControlTextField
                id="phone"
                value={journalist?.phone ?? ''}
                label={'Phone'}
                onChange={(e) => setJournalist({ ...journalist, phone: e.target.value })}
              />

              <FormControlTextField
                id="ddi"
                value={journalist?.ddi ?? ''}
                label={'DDI'}
                onChange={(e) => setJournalist({ ...journalist, ddi: e.target.value })}
              />

              <FormControlTextField
                id="mobile"
                value={journalist?.mobile ?? ''}
                label={'Mobile'}
                onChange={(e) => setJournalist({ ...journalist, mobile: e.target.value })}
              />

              <FormControlTextField
                id="linked-in"
                value={journalist?.linkedin ?? ''}
                label={'LinkedIn Profile'}
                onChange={(e) => setJournalist({ ...journalist, linkedin: e.target.value })}
                onClick={() => window.open(journalist?.linkedin, '_blank')}
                disabled={!journalist?.linkedin}
              />

              <FormControlTextField
                id="twitter"
                value={journalist?.twitter ?? ''}
                label={'Twitter Profile'}
                onChange={(e) => setJournalist({ ...journalist, twitter: e.target.value })}
                onClick={() => window.open(journalist?.twitter, '_blank')}
                disabled={!journalist?.twitter}
              />

              <FormControlTextField
                id="data-source"
                value={journalist?.datasource ?? ''}
                label={'Data Source'}
                onChange={(e) => setJournalist({ ...journalist, datasource: e.target.value })}
                onClick={() => window.open(journalist?.datasource, '_blank')}
                disabled={!journalist?.datasource}
              />
            </Paper>
            <Paper className="sticky bottom-0 px-8 py-4 rounded-none z-50 shadow-sm flex justify-between">
              <div className="flex gap-2 justify-end">
                {id && (
                  <Button variant="contained" color="error" onClick={onArchiveJournalist}>
                    Archive
                  </Button>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outlined" onClick={() => setOpenEditDrawer(false)}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={onSaveJournalist}>
                  Save
                </Button>
              </div>
            </Paper>
          </>
        )}
      </Box>
    </>
  );
}
