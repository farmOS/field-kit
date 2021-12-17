export interface TaskStateInterface {
  filter: Record<string, never>,
  pass: {
    localIDs: string;
  },
  showDeleteDialog: boolean,
  logIDToDelete: string,
  logDisplayFilters: {
    date: 'ALL_TIME',
    excludedTypes: Array<string>,
    excludedCategories: Array<string>,
  },
  isOnline: boolean
}

function state(): TaskStateInterface {
  return {
    filter: {},
    pass: {
      localIDs: ''
    },
    showDeleteDialog: false,
    logIDToDelete: '',
    logDisplayFilters: {
      date: 'ALL_TIME',
      excludedTypes: [],
      excludedCategories: [],
    },
    isOnline: false
    // isOnline: reactive(false)
  };
}

export default state;
