export const resolveSort = (field: string, value: string): { [key: string]: 'asc' | 'desc' } | Array<{ [key: string]: 'asc' | 'desc' }> => {
  if (!validateSort(value)) {
    // default to sorting by first_name and last_name in ascending order
    return [{ name: 'asc' }];
  }

  const direction = value?.toLowerCase() === 'desc' ? 'desc' : 'asc';

  if (['name'].includes(field)) {
    return [{ first_name: direction }, { last_name: direction }];
  }

  return { [field]: direction };
};

export const validateSort = (value: string): boolean => {
  if (!['asc', 'desc'].includes(value?.toLowerCase())) {
    return false;
  }
  return true;
};
