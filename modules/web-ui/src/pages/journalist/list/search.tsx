import { FormControlAutocompleteMulti } from '@/components/mui/formControls/autocomplete/multi';
import { FormControlAutocompleteSingle } from '@/components/mui/formControls/autocomplete/single';
import { FormControlTextField } from '@/components/mui/formControls/textField';
import {
  FormatTypeProps,
  JournalistSearchProps,
  NewsTypeProps,
  PublicationMediaTypeProps,
  PublicationProps,
  PublicationTierProps,
  RegionProps,
  RoleTypeProps
} from '@/types/journalist';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Button, Checkbox, Divider, Paper } from '@mui/material';
import axios from 'axios';
import { debounce, isEmpty, uniqBy } from 'lodash';
import { useRouter } from 'next/navigation';
import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react';
import DeleteJournalistSearch from './deleteJournalistSearch';
import SaveJournalistSearch from './saveJournalistSearch';

const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;

interface AdvancedSearchProps {
  setOpenSearchDrawer: Dispatch<SetStateAction<boolean>>;
  filterByName: string;
  setFilterByName: Dispatch<SetStateAction<string>>;
  filterByNameDebounced: string;
  publications: Array<PublicationProps>;
  filterByPublications: Array<PublicationProps>;
  setFilterByPublications: Dispatch<SetStateAction<Array<PublicationProps>>>;
  dPublications: (name: string) => void;
  publicationMediatypes: Array<PublicationMediaTypeProps>;
  filterByPublicationMediatypes: Array<PublicationMediaTypeProps>;
  setFilterByPublicationMediatypes: Dispatch<SetStateAction<Array<PublicationMediaTypeProps>>>;
  publicationTiers: Array<PublicationTierProps>;
  filterByPublicationTiers: Array<PublicationTierProps>;
  setFilterByPublicationTiers: Dispatch<SetStateAction<Array<PublicationTierProps>>>;
  formatTypes: Array<FormatTypeProps>;
  filterByFormatTypes: Array<FormatTypeProps>;
  setFilterByFormatTypes: Dispatch<SetStateAction<Array<FormatTypeProps>>>;
  newsTypes: Array<NewsTypeProps>;
  filterByNewsTypes: Array<NewsTypeProps>;
  setFilterByNewsTypes: Dispatch<SetStateAction<Array<NewsTypeProps>>>;
  roleTypes: Array<RoleTypeProps>;
  filterByRoleTypes: Array<RoleTypeProps>;
  setFilterByRoleType: Dispatch<SetStateAction<Array<RoleTypeProps>>>;
  regions: Array<RegionProps>;
  filterByRegions: Array<RegionProps>;
  setFilterByRegions: Dispatch<SetStateAction<Array<RegionProps>>>;
  setFilterByJournalistIds: Dispatch<SetStateAction<Array<string>>>;
  setPage: Dispatch<SetStateAction<number>>;
  setSelected: Dispatch<SetStateAction<Array<string>>>;
  resetSearch: () => void;
  // TODO: remove
  // setSelectedByJournalistSearch: Dispatch<SetStateAction<JournalistSearchProps | undefined>>;
}

export const AdvancedSearch: FC<AdvancedSearchProps> = ({
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
}) => {
  const router = useRouter();
  // TODO: remove
  // const { toast } = useToast();
  const [journalistSearches, setJournalistSearches] = useState<Array<JournalistSearchProps>>([]);
  const [journalistSearchesInput, setJournalistSearchesInput] = useState<string | null>();
  const [filterByJournalistSearch, setFilterByJournalistSearch] = useState<JournalistSearchProps>();
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  // TODO: remove
  // const [searchName, setSearchName] = useState<string | null>();
  const [showConfirmSaveSearchDialog, setShowConfirmSaveSearchDialog] = useState(false);
  const [showConfirmDeleteSearchDialog, setShowConfirmDeleteSearchDialog] = useState(false);

  useEffect(() => {
    axios
      .get(`${HOSTNAME}/journalist-search`)
      .then(({ data }) => {
        setJournalistSearches(data.items);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          router.push('/login?referrer=/journalist');
        }
      });
  }, [router]);

  const dJournalistSearches = useMemo(() => debounce((value) => setJournalistSearchesInput(value), 500), []);
  useEffect(() => {
    if (journalistSearchesInput) {
      axios
        .get(
          `${HOSTNAME}/journalist-search?${new URLSearchParams({
            name: journalistSearchesInput
          }).toString()}`
        )
        .then(({ data }) => {
          setJournalistSearches(data.items);
        })
        .catch((err) => console.error(err));
    }
  }, [journalistSearchesInput]);

  useEffect(() => {
    if (filterByJournalistSearch?.search) {
      try {
        const d = JSON.parse(filterByJournalistSearch?.search as unknown as string);
        if (d.filterByNameDebounced) setFilterByName(d.filterByNameDebounced);
        if (d.filterByPublications) setFilterByPublications(d.filterByPublications);
        if (d.filterByPublicationMediatypes) setFilterByPublicationMediatypes(d.filterByPublicationMediatypes);
        if (d.filterByPublicationTiers) setFilterByPublicationTiers(d.filterByPublicationTiers);
        if (d.filterByRegions) setFilterByRegions(d.filterByRegions);
        if (d.filterByFormatTypes) setFilterByFormatTypes(d.filterByFormatTypes);
        if (d.filterByNewsTypes) setFilterByNewsTypes(d.filterByNewsTypes);
        if (d.filterByRoleTypes) setFilterByRoleType(d.filterByRoleTypes);
      } catch (error) {
        console.error('Unable to parse the filterByJournalistSearches string');
      }
    }

    if (filterByJournalistSearch?.journalists) {
      try {
        const d = JSON.parse(filterByJournalistSearch?.journalists);
        if (d) setFilterByJournalistIds(d);
      } catch (error) {
        console.error('Unable to parse the filterByJournalistSearches string');
      }
    }
  }, [
    filterByJournalistSearch,
    setFilterByName,
    setFilterByPublications,
    setFilterByPublicationMediatypes,
    setFilterByPublicationTiers,
    setFilterByRegions,
    setFilterByFormatTypes,
    setFilterByNewsTypes,
    setFilterByRoleType,
    setFilterByJournalistIds
  ]);

  return (
    <>
      <Paper className="h-full p-8 flex flex-col gap-8">
        <FormControlAutocompleteSingle
          id="journalist-searches"
          options={journalistSearches}
          value={filterByJournalistSearch}
          label={'Load Saved List'}
          onInputChange={(_e, newValue): void => dJournalistSearches(newValue)}
          onChange={(_e, newValue) => {
            if (newValue) setFilterByJournalistSearch(newValue);
          }}
        />

        <Divider />

        <FormControlTextField
          id={'journalist-name'}
          value={filterByName}
          label={'Journalist Name'}
          onChange={(e) => {
            setFilterByName(e.target.value);
            setIsSaveEnabled(true);
          }}
        />

        <FormControlAutocompleteMulti
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
          onInputChange={(_e, newValue): void => dPublications(newValue)}
          onChange={(_e, newValue) => {
            setFilterByPublications(uniqBy(newValue, 'id'));
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />

        <FormControlAutocompleteMulti
          id={'publication-mediatypes'}
          options={publicationMediatypes}
          getOptionLabel={(o) => o.mediatype}
          value={filterByPublicationMediatypes}
          label={'Publication Media Types'}
          onChange={(_e, newValue) => {
            setFilterByPublicationMediatypes(newValue);
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />

        <FormControlAutocompleteMulti
          id={'publication-tiers'}
          options={publicationTiers}
          value={filterByPublicationTiers}
          label={'Publication Tiers'}
          onChange={(_e, newValue) => {
            setFilterByPublicationTiers(newValue);
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />

        <FormControlAutocompleteMulti
          id={'regions'}
          options={regions}
          value={filterByRegions}
          label={'Regions'}
          onChange={(_e, newValue) => {
            setFilterByRegions(newValue);
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />

        <FormControlAutocompleteMulti
          id={'format-types'}
          options={formatTypes}
          value={filterByFormatTypes}
          label={'Format Types'}
          onChange={(_e, newValue) => {
            setFilterByFormatTypes(newValue);
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />

        <FormControlAutocompleteMulti
          id={'news-types'}
          options={newsTypes}
          value={filterByNewsTypes}
          label={'News Types'}
          onChange={(_e, newValue) => {
            setFilterByNewsTypes(newValue);
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />

        <FormControlAutocompleteMulti
          id={'role-types'}
          options={roleTypes}
          value={filterByRoleTypes}
          label={'Job Titles'}
          onChange={(_e, newValue) => {
            setFilterByRoleType(newValue);
            setIsSaveEnabled(true);
            setPage(0);
          }}
        />
      </Paper>

      <Paper className="sticky bottom-0 px-8 py-4 rounded-none z-50 shadow-sm flex justify-between">
        <div className="flex gap-2 justify-end">
          <Button
            variant="contained"
            color="error"
            onClick={() => setShowConfirmDeleteSearchDialog(true)}
            disabled={!filterByJournalistSearch}
          >
            Delete
          </Button>
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outlined"
            onClick={() => {
              resetSearch();
              setOpenSearchDrawer(false);
            }}
          >
            Reset Filters
          </Button>
          <Button variant="contained" onClick={() => setShowConfirmSaveSearchDialog(true)} disabled={!isSaveEnabled}>
            Save
          </Button>
        </div>
      </Paper>

      <SaveJournalistSearch
        {...{
          search: JSON.stringify({
            ...(!isEmpty(filterByNameDebounced) && { filterByNameDebounced }),
            ...(!isEmpty(filterByPublications) && { filterByPublications }),
            ...(!isEmpty(filterByPublicationMediatypes) && { filterByPublicationMediatypes }),
            ...(!isEmpty(filterByPublicationTiers) && { filterByPublicationTiers }),
            ...(!isEmpty(filterByRegions) && { filterByRegions }),
            ...(!isEmpty(filterByFormatTypes) && { filterByFormatTypes }),
            ...(!isEmpty(filterByNewsTypes) && { filterByNewsTypes }),
            ...(!isEmpty(filterByRoleTypes) && { filterByRoleTypes })
          }),
          filterByJournalistSearch,
          showConfirmSaveSearchDialog,
          setShowConfirmSaveSearchDialog,
          setOpenSearchDrawer,
          resetSearch
        }}
      />

      <DeleteJournalistSearch
        {...{
          filterByJournalistSearch,
          showConfirmDeleteSearchDialog,
          setShowConfirmDeleteSearchDialog,
          setOpenSearchDrawer,
          resetSearch
        }}
      />
    </>
  );
};

export default AdvancedSearch;
