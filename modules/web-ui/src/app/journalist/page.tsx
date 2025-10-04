'use client';

import { FormControlAutocompleteMulti } from '@/components/mui/formControls/autocomplete/multi';
import { FormControlTextField } from '@/components/mui/formControls/textField';
import { JournalistDetails } from '@/pages/journalist/details/page';
import EditJournalist from '@/pages/journalist/edit/page';
import EditorActions from '@/pages/journalist/list/editorActions';
import SaveJournalistSelect from '@/pages/journalist/list/saveJournalistSelect';
import { AdvancedSearch } from '@/pages/journalist/list/search';
import JournalistListTable from '@/pages/journalist/list/table';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider, useToast } from '@/providers/ToastProvider';
import { AsyncState } from '@/types/asyncState';
import {
  FormatTypeProps,
  JournalistProps,
  NewsTypeProps,
  PublicationMediaTypeProps,
  PublicationProps,
  PublicationTierProps,
  RegionProps,
  RoleTypeProps
} from '@/types/journalist';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Checkbox,
  ClickAwayListener,
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popover,
  Switch,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import axios from 'axios';
import { debounce, isEmpty } from 'lodash';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { stylesheet } from 'typestyle';

const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function Journalists() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState<string | null>();

  const [openUserAccountActions, setOpenUserAccountActions] = useState(false);
  const anchorRefUserAccountActions = useRef<HTMLButtonElement>(null);

  const [journalists, setJournalists] = useState<AsyncState<Array<JournalistProps>>>({
    isLoading: true,
    hasError: false,
    value: []
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  const [filterByName, setFilterByName] = useState<string>('');
  const [filterByNameDebounced, setFilterByNameDebounced] = useState<string>('');
  const [publications, setPublications] = useState<Array<PublicationProps>>([]);
  const [publicationsInput, setPublicationsInput] = useState<string | null>();
  const [filterByPublications, setFilterByPublications] = useState<Array<PublicationProps>>([]);
  const [publicationMediatypes, setPublicationMediatypes] = useState<Array<PublicationMediaTypeProps>>([]);
  const [filterByPublicationMediatypes, setFilterByPublicationMediatypes] = useState<Array<PublicationMediaTypeProps>>([]);
  const [publicationTiers, setPublicationTiers] = useState<Array<PublicationTierProps>>([]);
  const [filterByPublicationTiers, setFilterByPublicationTiers] = useState<Array<PublicationTierProps>>([]);
  const [formatTypes, setFormatTypes] = useState<Array<FormatTypeProps>>([]);
  const [filterByFormatTypes, setFilterByFormatTypes] = useState<Array<FormatTypeProps>>([]);
  const [newsTypes, setNewsTypes] = useState<Array<NewsTypeProps>>([]);
  const [filterByNewsTypes, setFilterByNewsTypes] = useState<Array<NewsTypeProps>>([]);
  const [roleTypes, setRoleTypes] = useState<Array<RoleTypeProps>>([]);
  const [filterByRoleTypes, setFilterByRoleType] = useState<Array<RoleTypeProps>>([]);
  const [regions, setRegions] = useState<Array<RegionProps>>([]);
  const [filterByRegions, setFilterByRegions] = useState<Array<RegionProps>>([]);
  const [filterByJournalistIds, setFilterByJournalistIds] = useState<Array<string>>([]);

  const [orderBy, setOrderBy] = useState<{ columnId: string; direction: 'asc' | 'desc' }>({ columnId: 'first_name', direction: 'asc' });

  const [isTableTextWrap, setIsTableTextWrap] = useState<boolean>(false);

  const [journalistsWithFailedEmailValidation, setJournalistsWithFailedEmailValidation] = useState(0);
  const [showFailedEmailValidation, setShowFailedEmailValidation] = useState<boolean>(false);

  const [selected, setSelected] = useState<Array<string>>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [openDetailsDrawer, setOpenDetailsDrawer] = useState<boolean>(false);
  const [openEditDrawer, setOpenEditDrawer] = useState<boolean>(false);
  const [openSearchDrawer, setOpenSearchDrawer] = useState<boolean>(false);
  const [journalistId, setJournalistId] = useState<string | undefined>();

  // TODO: remove
  // const [selectedByJournalistSearch, setSelectedByJournalistSearch] = useState<JournalistSearchProps>();
  const [showConfirmSaveSearchDialog, setShowConfirmSaveSearchDialog] = useState(false);

  const getJournalists = useCallback(() => {
    setJournalists((prev) => ({ ...prev, isLoading: true }));

    axios
      .get(`${HOSTNAME}/journalist`, {
        params: {
          marker: String(page * rowsPerPage),
          limit: String(rowsPerPage),
          sort: `${orderBy.columnId}:${orderBy.direction}`,
          name: filterByNameDebounced,
          ...(!isEmpty(filterByPublications) && { publicationIds: filterByPublications.map((p) => p.id) }),
          ...(!isEmpty(filterByPublicationMediatypes) && {
            publicationMediatypes: filterByPublicationMediatypes.map((p) => p.mediatype)
          }),
          ...(!isEmpty(filterByPublicationTiers) && { publicationTiers: filterByPublicationTiers.map((p) => p.name) }),
          ...(!isEmpty(filterByRegions) && { regionIds: filterByRegions.map((r) => r.id) }),
          ...(!isEmpty(filterByFormatTypes) && { formatTypeIds: filterByFormatTypes.map((ft) => ft.id) }),
          ...(!isEmpty(filterByNewsTypes) && { newsTypeIds: filterByNewsTypes.map((nt) => nt.id) }),
          ...(!isEmpty(filterByRoleTypes) && { roleTypeIds: filterByRoleTypes.map((rt) => rt.id) }),
          ...(!isEmpty(filterByJournalistIds) && { journalistIds: filterByJournalistIds }),
          validEmail: !showFailedEmailValidation
        }
      })
      .then(({ data }) => {
        setJournalists({ isLoading: false, hasError: false, value: data.items });
        setTotal(data.total);
      })
      .catch((err) => {
        setJournalists({ isLoading: false, hasError: true, value: null });
        if (err.response.status === 401) {
          router.push('/login?referrer=/journalist');
        }
      });

    axios
      .get(`${HOSTNAME}/journalist`, {
        params: {
          validEmail: showFailedEmailValidation
        }
      })
      .then(({ data }) => {
        setJournalistsWithFailedEmailValidation(data.total);
      });
  }, [
    filterByFormatTypes,
    filterByJournalistIds,
    filterByNameDebounced,
    filterByNewsTypes,
    filterByPublicationMediatypes,
    filterByPublicationTiers,
    filterByPublications,
    filterByRegions,
    filterByRoleTypes,
    orderBy.columnId,
    orderBy.direction,
    page,
    router,
    rowsPerPage,
    showFailedEmailValidation
  ]);

  const getPublications = () =>
    axios
      .get(
        `${HOSTNAME}/publication?${new URLSearchParams({
          hasJournalist: 'true',
          limit: '500'
        }).toString()}`
      )
      .then(({ data }) => {
        setPublications(data.items);
      })
      .catch((err) => console.error(err));

  const getPublicationMediaTypes = useCallback(
    () =>
      axios
        .get(`${HOSTNAME}/publication-media-type`, {
          params: {
            ...(!isEmpty(filterByPublications) && { publicationIds: filterByPublications.map((p) => p.id) })
          }
        })
        .then(({ data }) => {
          setPublicationMediatypes(data.items);
        })
        .catch((err) => console.error(err)),
    [filterByPublications]
  );

  const exportJournalists = () =>
    axios
      .post(`${HOSTNAME}/journalist/export`, {
        ids: selected,
        selectAll,
        sort: 'name:asc',
        name: filterByNameDebounced,
        ...(!isEmpty(filterByPublications) && { publicationIds: filterByPublications.map((p) => p.id) }),
        ...(!isEmpty(filterByPublicationMediatypes) && {
          publicationMediatypes: filterByPublicationMediatypes.map((p) => p.mediatype)
        }),
        ...(!isEmpty(filterByPublicationTiers) && { publicationTiers: filterByPublicationTiers.map((p) => p.name) }),
        ...(!isEmpty(filterByRegions) && { regionIds: filterByRegions.map((r) => r.id) }),
        ...(!isEmpty(filterByFormatTypes) && { formatTypeIds: filterByFormatTypes.map((ft) => ft.id) }),
        ...(!isEmpty(filterByNewsTypes) && { newsTypeIds: filterByNewsTypes.map((nt) => nt.id) }),
        ...(!isEmpty(filterByRoleTypes) && { roleTypeIds: filterByRoleTypes.map((rt) => rt.id) }),
        validEmail: !showFailedEmailValidation
      })
      .then((resp) => {
        const url = window.URL.createObjectURL(new Blob([resp.data], { type: 'text/csv' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `journalist.csv`);

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);
      });

  useEffect(() => {
    setUsername(localStorage?.getItem('username'));

    getPublications();

    getPublicationMediaTypes();

    axios
      .get(`${HOSTNAME}/publication-tier`)
      .then(({ data }) => {
        setPublicationTiers(data.items);
      })
      .catch((err) => console.error(err));

    axios
      .get(`${HOSTNAME}/format-type`)
      .then(({ data }) => {
        setFormatTypes(data.items);
      })
      .catch((err) => console.error(err));

    axios
      .get(`${HOSTNAME}/news-type`)
      .then(({ data }) => setNewsTypes(data.items))
      .catch((err) => console.error(err));

    axios
      .get(`${HOSTNAME}/role-type`)
      .then(({ data }) => setRoleTypes(data.items))
      .catch((err) => console.error(err));

    axios
      .get(
        `${HOSTNAME}/region?${new URLSearchParams({
          hasJournalist: 'true'
        }).toString()}`
      )
      .then(({ data }) => {
        setRegions(data.items);
      })
      .catch((err) => console.error(err));
  }, [getPublicationMediaTypes]);

  const dPublications = useMemo(() => debounce((value) => setPublicationsInput(value), 500), []);
  useEffect(() => {
    if (publicationsInput && (publicationsInput.length === 0 || publicationsInput.length > 2)) {
      axios
        .get(
          `${HOSTNAME}/publication?${new URLSearchParams({
            name: publicationsInput,
            hasJournalist: 'true',
            limit: '500'
          }).toString()}`
        )
        .then(({ data }) => {
          // setPublications(uniqBy([...publications, ...data.items], 'id'));
          setPublications(data.items);
        })
        .catch((err) => console.error(err));
    }
  }, [publicationsInput]);

  const dFilterByName = useMemo(() => debounce((value) => setFilterByNameDebounced(value), 500), []);
  useEffect(() => {
    if (filterByName.length === 0 || filterByName.length > 2) {
      dFilterByName(filterByName);
      setPage(0);
    }
  }, [dFilterByName, filterByName]);

  useEffect(() => {
    if (!(openEditDrawer || openDetailsDrawer)) {
      getJournalists();
      getPublications();
      getPublicationMediaTypes();
    }
  }, [
    filterByNameDebounced,
    filterByPublications,
    filterByPublicationMediatypes,
    filterByPublicationTiers,
    filterByRegions,
    filterByFormatTypes,
    filterByNewsTypes,
    filterByRoleTypes,
    filterByJournalistIds,
    showFailedEmailValidation,
    page,
    rowsPerPage,
    openEditDrawer,
    openDetailsDrawer,
    getJournalists,
    getPublicationMediaTypes
  ]);

  const resetSearch = () => {
    setFilterByName('');
    setFilterByPublications([]);
    setFilterByPublicationMediatypes([]);
    setFilterByPublicationTiers([]);
    setFilterByFormatTypes([]);
    setFilterByNewsTypes([]);
    setFilterByRoleType([]);
    setFilterByRegions([]);
    setFilterByJournalistIds([]);
    setSelectAll(false);
    setSelected([]);
  };

  return (
    <AuthProvider>
      <ToastProvider>
        <div className="mt-16 mb-8">
          <AppBar position="relative" className="px-8">
            <Toolbar disableGutters className="flex justify-between">
              <Box className="flex gap-8">
                <Typography variant="h6">Journalist Directory</Typography>
              </Box>

              <Box className="flex gap-8">
                <Badge color="error" badgeContent={selected.length}>
                  <Tooltip title="Save Journalists" arrow>
                    <Button
                      variant="contained"
                      color="inherit"
                      aria-label="save"
                      onClick={() => setShowConfirmSaveSearchDialog(true)}
                      disabled={selected.length === 0}
                    >
                      <SaveIcon fontSize="small" color="primary" />
                    </Button>
                  </Tooltip>
                </Badge>

                <Badge color="error" badgeContent={selected.length}>
                  <Tooltip title="Email Journalists" arrow>
                    <Button
                      variant="contained"
                      color="inherit"
                      aria-label="email"
                      href={`mailto:?bcc=${journalists.value
                        ?.filter((j) => selected.includes(j.uuid ?? ''))
                        .map((j) => j.email)
                        .join(';')}`}
                      disabled={selected.length === 0}
                    >
                      <EmailIcon fontSize="small" color="primary" />
                    </Button>
                  </Tooltip>
                </Badge>

                <Badge color="error" badgeContent={selectAll ? total : selected.length}>
                  <Tooltip title="Export Journalists" arrow>
                    <Button
                      variant="contained"
                      color="inherit"
                      aria-label="export"
                      onClick={() => exportJournalists()}
                      disabled={selected.length === 0}
                    >
                      <DownloadIcon fontSize="small" color="primary" />
                    </Button>
                  </Tooltip>
                </Badge>

                <IconButton
                  ref={anchorRefUserAccountActions}
                  id="composition-button"
                  aria-controls={openUserAccountActions ? 'composition-menu' : undefined}
                  aria-expanded={openUserAccountActions ? 'true' : undefined}
                  aria-haspopup="true"
                  color="inherit"
                  onClick={() => setOpenUserAccountActions((prevOpen) => !prevOpen)}
                >
                  <PersonIcon />
                </IconButton>

                <Popover
                  open={openUserAccountActions}
                  anchorEl={anchorRefUserAccountActions.current}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                  }}
                >
                  <Paper>
                    <ClickAwayListener
                      onClickAway={(event: Event | React.SyntheticEvent) => {
                        if (
                          anchorRefUserAccountActions.current &&
                          anchorRefUserAccountActions.current.contains(event.target as HTMLElement)
                        )
                          return;
                        setOpenUserAccountActions(false);
                      }}
                    >
                      <MenuList
                        autoFocusItem={openUserAccountActions}
                        id="composition-menu"
                        aria-labelledby="composition-button"
                        onKeyDown={(event: React.KeyboardEvent) => {
                          if (event.key === 'Tab') {
                            event.preventDefault();
                            setOpenUserAccountActions(false);
                          } else if (event.key === 'Escape') {
                            setOpenUserAccountActions(false);
                          }
                        }}
                      >
                        <MenuItem className="flex gap-4 p-4">
                          <Typography>{username}</Typography>
                        </MenuItem>
                        <Divider />
                        <MenuItem
                          className="flex gap-4 p-4"
                          onClick={() => {
                            axios
                              .post(`${HOSTNAME}/auth/logout`)
                              .then(() => {
                                localStorage.removeItem('token');
                                toast('Logged out successfully');
                                setTimeout(() => router.push('/login?referrer=/journalist'), 1000);
                              })
                              .catch((err) => console.error(err));
                          }}
                        >
                          <LogoutIcon fontSize="small" color="primary" />
                          <Typography>Logout</Typography>
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Popover>
              </Box>
            </Toolbar>
          </AppBar>

          {/* {journalists.isLoading ? (
            <Box className={classes('flex justify-center items-center min-h-max')}>
              <CircularProgress />
            </Box>
          ) : ( */}
          <Paper className="px-8 py-2 rounded-none">
            <div className="py-2 flex justify-between">
              <div className="flex gap-4">
                <FormControlTextField
                  addClassName="w-60"
                  id={'journalist-name'}
                  value={filterByName}
                  label={'Journalist Name'}
                  onChange={(e) => setFilterByName(e.target.value)}
                />

                <FormControlAutocompleteMulti
                  addClassName="w-72"
                  id={'publications'}
                  options={publications}
                  renderOption={(props, option, { selected }) => (
                    <span {...props} key={option.id}>
                      <Checkbox
                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                        checked={selected || filterByPublications?.map((p) => p.id).includes(option.id!)}
                      />
                      {option.name}
                    </span>
                  )}
                  value={filterByPublications}
                  label={'Publications'}
                  onInputChange={(_, newValue) => dPublications(newValue)}
                  onChange={(_, newValue) => {
                    setFilterByPublications(newValue as Array<PublicationProps>);
                    setPage(0);
                  }}
                />

                <Badge
                  variant="dot"
                  {...((filterByNameDebounced ||
                    !isEmpty(filterByPublications) ||
                    !isEmpty(filterByPublicationMediatypes) ||
                    !isEmpty(filterByPublicationTiers) ||
                    !isEmpty(filterByFormatTypes) ||
                    !isEmpty(filterByNewsTypes) ||
                    !isEmpty(filterByRoleTypes) ||
                    !isEmpty(filterByRegions)) && { color: 'primary' })}
                >
                  <Button variant="outlined" onClick={() => setOpenSearchDrawer(true)}>
                    Filters
                  </Button>
                </Badge>

                <Divider orientation="vertical" flexItem />

                <Button
                  variant="text"
                  onClick={() => {
                    resetSearch();
                    setOpenSearchDrawer(false);
                  }}
                >
                  Reset Filters
                </Button>
              </div>

              <FormGroup>
                <FormControlLabel
                  control={<Switch checked={isTableTextWrap} onChange={() => setIsTableTextWrap(!isTableTextWrap)} />}
                  label={<Typography variant="body2">{'Wrap Text'}</Typography>}
                />
              </FormGroup>

              <EditorActions
                {...{
                  setOpenEditDrawer,
                  setJournalistId,
                  getJournalists,
                  total,
                  filterByNameDebounced,
                  filterByPublications,
                  filterByPublicationMediatypes,
                  filterByPublicationTiers,
                  filterByFormatTypes,
                  filterByNewsTypes,
                  filterByRoleTypes,
                  filterByRegions,
                  journalistsWithFailedEmailValidation,
                  showFailedEmailValidation,
                  setShowFailedEmailValidation,
                  selected,
                  setSelected,
                  selectAll
                }}
              />
            </div>

            <JournalistListTable
              {...{
                journalists,
                publications,
                orderBy,
                setOrderBy,
                page,
                setPage,
                rowsPerPage,
                setRowsPerPage,
                total,
                selected,
                setSelected,
                selectAll,
                setSelectAll,
                setJournalistId,
                setOpenEditDrawer,
                setOpenDetailsDrawer,
                isTableTextWrap
              }}
            />
          </Paper>
          {/* )} */}

          <Drawer
            anchor={'right'}
            open={openEditDrawer}
            onClose={() => {
              setJournalistId(undefined);
              setOpenEditDrawer(false);
            }}
            PaperProps={{ classes: { root: 'w-2/5' } }}
          >
            <EditJournalist {...{ id: journalistId, setOpenEditDrawer }} />
          </Drawer>

          <Drawer
            anchor={'right'}
            open={openDetailsDrawer}
            onClose={() => {
              setJournalistId(undefined);
              setOpenDetailsDrawer(false);
            }}
            PaperProps={{ classes: { root: 'w-2/5' } }}
          >
            <JournalistDetails {...{ id: journalistId, setOpenDetailsDrawer }} />
          </Drawer>

          <Drawer
            anchor={'right'}
            open={openSearchDrawer}
            onClose={() => {
              setOpenSearchDrawer(false);
            }}
            PaperProps={{ classes: { root: 'w-2/5' } }}
          >
            <AdvancedSearch
              {...{
                setOpenSearchDrawer,
                filterByName,
                setFilterByName,
                filterByNameDebounced,
                publications,
                filterByPublications,
                setFilterByPublications,
                dPublications,
                publicationMediatypes,
                filterByPublicationMediatypes,
                setFilterByPublicationMediatypes,
                publicationTiers,
                filterByPublicationTiers,
                setFilterByPublicationTiers,
                formatTypes,
                filterByFormatTypes,
                setFilterByFormatTypes,
                newsTypes,
                filterByNewsTypes,
                setFilterByNewsTypes,
                roleTypes,
                filterByRoleTypes,
                setFilterByRoleType,
                regions,
                filterByRegions,
                setFilterByRegions,
                setFilterByJournalistIds,
                setPage,
                setSelected,
                resetSearch
                // TODO: remove
                // setSelectedByJournalistSearch
              }}
            />
          </Drawer>

          <SaveJournalistSelect
            {...{
              selected,
              showConfirmSaveSearchDialog,
              setShowConfirmSaveSearchDialog,
              resetSearch
            }}
          />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

const styles = stylesheet({
  loader: {
    minHeight: 'calc(100vh - 50px)'
  }
});
