// import { FormControlAutocompleteSingle } from '@/components/mui/formControls/autocomplete/single';
import { FormControlAutocompleteSingleWithCreate } from '@/components/mui/formControls/autocomplete/singleWithCreate';
import { JournalistSearchProps } from '@/types/journalist';
import axios from 'axios';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from 'react';

const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;

interface ListJournalistSearchProps {
  journalistSearch?: JournalistSearchProps;
  setJournalistSearch: Dispatch<SetStateAction<JournalistSearchProps | undefined>>;
}

export const ListJournalistSearch: FC<ListJournalistSearchProps> = ({ journalistSearch, setJournalistSearch }) => {
  const router = useRouter();
  const [journalistSearches, setJournalistSearches] = useState<Array<JournalistSearchProps>>([]);
  const [journalistSearchesInput, setJournalistSearchesInput] = useState<string | null>();

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

  return (
    <FormControlAutocompleteSingleWithCreate
      id="journalist-searches"
      options={journalistSearches}
      value={journalistSearch}
      label={'Add to Saved List or Create New'}
      onInputChange={(_e, newValue): void => dJournalistSearches(newValue)}
      onChange={(_e, newValue) => {
        if (newValue) setJournalistSearch(newValue as JournalistSearchProps);
      }}
      disablePortal={false}
    />
  );
};

export default ListJournalistSearch;
