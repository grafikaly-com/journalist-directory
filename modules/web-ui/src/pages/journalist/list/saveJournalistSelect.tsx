import { DialogForm } from '@/components/mui/dialog';
import { useToast } from '@/providers/ToastProvider';
import { JournalistSearchProps } from '@/types/journalist';
import { Button } from '@mui/material';
import axios from 'axios';
import uniq from 'lodash/uniq';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useState } from 'react';
import ListJournalistSearch from './listJournalistSearch';

const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;

interface SaveJournalistSelectProps {
  selected: Array<string>;
  showConfirmSaveSearchDialog: boolean;
  setShowConfirmSaveSearchDialog: Dispatch<SetStateAction<boolean>>;
  resetSearch: () => void;
}

export default function SaveJournalistSelect({
  selected,
  showConfirmSaveSearchDialog,
  setShowConfirmSaveSearchDialog,
  resetSearch
}: SaveJournalistSelectProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [journalistSearch, setJournalistSearch] = useState<JournalistSearchProps>();

  const onSaveJournalistSearch = () => {
    const searchName = journalistSearch?.inputValue;
    const journalists = JSON.parse(journalistSearch?.journalists ?? '[]');
    const payload = {
      name: searchName,
      description: searchName,
      search: journalistSearch?.search,
      journalists: JSON.stringify(uniq(journalists.concat(selected)))
    };

    if (journalistSearch?.uuid) {
      axios
        .put(`${HOSTNAME}/journalist-search/${journalistSearch?.uuid}`, payload)
        .then(() => {
          toast('Journalist Search Details are saved successfully.');
          resetSearch();
          setJournalistSearch(undefined);
        })
        .catch((err) => {
          if (err.response.status === 401) {
            router.push('/login?referrer=/journalist');
          }
        })
        .finally(() => setShowConfirmSaveSearchDialog(false));
    } else {
      axios
        .post(`${HOSTNAME}/journalist-search`, payload)
        .then(() => {
          toast('Journalist Search Details are saved successfully.');
          resetSearch();
          setJournalistSearch(undefined);
        })
        .catch((err) => {
          if (err.response.status === 401) {
            router.push('/login?referrer=/journalist');
          }
        })
        .finally(() => setShowConfirmSaveSearchDialog(false));
    }
  };

  return (
    <DialogForm
      open={showConfirmSaveSearchDialog}
      setOpen={setShowConfirmSaveSearchDialog}
      title={'Save List'}
      onCancel={() => setShowConfirmSaveSearchDialog(false)}
      moreActions={
        <Button variant="contained" color="primary" onClick={onSaveJournalistSearch}>
          Save
        </Button>
      }
    >
      {selected?.length > 0 ? <ListJournalistSearch {...{ journalistSearch, setJournalistSearch }} /> : null}
    </DialogForm>
  );
}
