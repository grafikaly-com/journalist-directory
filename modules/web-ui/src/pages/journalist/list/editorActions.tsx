'use client';

import { usePermissions } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import {
  FormatTypeProps,
  NewsTypeProps,
  PublicationMediaTypeProps,
  PublicationProps,
  PublicationTierProps,
  RegionProps,
  RoleTypeProps
} from '@/types/journalist';
import AddIcon from '@mui/icons-material/Add';
import ArchiveIcon from '@mui/icons-material/Archive';
import PersonIcon from '@mui/icons-material/Person';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Badge, Button, Tooltip } from '@mui/material';
import axios from 'axios';
import { isEmpty } from 'lodash';
import { Dispatch, SetStateAction } from 'react';

const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;

interface EditorActionsProps {
  setJournalistId: Dispatch<SetStateAction<string | undefined>>;
  setOpenEditDrawer: Dispatch<SetStateAction<boolean>>;
  getJournalists: () => void;
  total: number;
  filterByNameDebounced: string;
  filterByPublications: Array<PublicationProps>;
  filterByPublicationMediatypes: Array<PublicationMediaTypeProps>;
  filterByPublicationTiers: Array<PublicationTierProps>;
  filterByFormatTypes: Array<FormatTypeProps>;
  filterByNewsTypes: Array<NewsTypeProps>;
  filterByRoleTypes: Array<RoleTypeProps>;
  filterByRegions: Array<RegionProps>;
  journalistsWithFailedEmailValidation: number;
  showFailedEmailValidation: boolean;
  setShowFailedEmailValidation: Dispatch<SetStateAction<boolean>>;
  selected: Array<string>;
  setSelected: Dispatch<SetStateAction<Array<string>>>;
  selectAll: boolean;
}

export default function EditorActions({
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
}: EditorActionsProps) {
  const { isEditor } = usePermissions();
  const { toast } = useToast();

  const onArchiveJournalists = () =>
    axios
      .put(`${HOSTNAME}/journalist/batch`, {
        enabled: false,
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
      .then(() => {
        toast('Journalists are archived successfully.');
        setSelected([]);
        getJournalists();
      })
      .catch((err) => console.error(err));

  const onValidateJournalists = () =>
    axios
      .post(`${HOSTNAME}/journalist/validate`, {
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
      .then(() => {
        toast('Journalists are validated successfully.');
        setSelected([]);
        getJournalists();
      })
      .catch((err) => console.error(err));

  return (
    <>
      {isEditor && (
        <div className="flex gap-8">
          <Tooltip title="Add Journalist" arrow>
            <Button
              variant="contained"
              aria-label="add"
              onClick={() => {
                // TODO: router.push(`publications/add`);
                setOpenEditDrawer(true);
                setJournalistId(undefined);
              }}
            >
              <AddIcon fontSize="small" />
            </Button>
          </Tooltip>

          <Badge {...(journalistsWithFailedEmailValidation > 0 && { color: 'error' })} badgeContent={journalistsWithFailedEmailValidation}>
            <Tooltip arrow {...{ title: `Show Journalists with ${showFailedEmailValidation ? 'Passed' : 'Failed'} Email Validation` }}>
              <Button variant="contained" onClick={() => setShowFailedEmailValidation(!showFailedEmailValidation)}>
                {showFailedEmailValidation ? <PersonIcon fontSize="small" /> : <PersonOffIcon fontSize="small" />}
              </Button>
            </Tooltip>
          </Badge>

          <Badge color="error" badgeContent={selectAll ? total : selected.length}>
            <Tooltip title="Validate Journalists" arrow>
              <Button variant="contained" aria-label="validate" onClick={() => onValidateJournalists()} disabled={selected.length === 0}>
                <VerifiedUserIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Badge>

          <Badge color="error" badgeContent={selectAll ? total : selected.length}>
            <Tooltip title="Archive Journalists" arrow>
              <Button
                variant="contained"
                color="error"
                aria-label="archive"
                onClick={() => onArchiveJournalists()}
                disabled={selected.length === 0}
              >
                <ArchiveIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Badge>
        </div>
      )}
    </>
  );
}
