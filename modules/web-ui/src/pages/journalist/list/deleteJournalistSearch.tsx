import { DialogForm } from '@/components/mui/dialog';
import { useToast } from '@/providers/ToastProvider';
import { JournalistSearchProps } from '@/types/journalist';
import { Button } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

const HOSTNAME = process.env.NEXT_PUBLIC_MEDIAMINE_API_HOSTNAME;

interface DeleteJournalistsProps {
  filterByJournalistSearch?: JournalistSearchProps;
  showConfirmDeleteSearchDialog: boolean;
  setShowConfirmDeleteSearchDialog: Dispatch<SetStateAction<boolean>>;
  setOpenSearchDrawer: Dispatch<SetStateAction<boolean>>;
  resetSearch: () => void;
}

export default function DeleteJournalistSearch({
  filterByJournalistSearch,
  showConfirmDeleteSearchDialog,
  setShowConfirmDeleteSearchDialog,
  setOpenSearchDrawer,
  resetSearch
}: DeleteJournalistsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const onDeleteJournalistSearch = () => {
    if (filterByJournalistSearch?.uuid) {
      axios
        .delete(`${HOSTNAME}/journalist-search/${filterByJournalistSearch?.uuid}`)
        .then(() => {
          toast('Journalist Search Details are deleted successfully.');
          setShowConfirmDeleteSearchDialog(false);
          setOpenSearchDrawer(false);
          resetSearch();
        })
        .catch((err) => {
          if (err.response.status === 401) {
            router.push('/login?referrer=/journalist');
          }
        });
    }
  };

  return (
    <DialogForm
      open={showConfirmDeleteSearchDialog}
      setOpen={setShowConfirmDeleteSearchDialog}
      title={'Are you sure you want to delete the Saved List?'}
      onCancel={() => setShowConfirmDeleteSearchDialog(false)}
      moreActions={
        <Button variant="contained" color="error" onClick={onDeleteJournalistSearch}>
          Delete
        </Button>
      }
    />
  );
}
