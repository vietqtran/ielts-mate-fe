// Reading passage utility functions

export const getIeltsTypeLabel = (type: string | number): string => {
  const typeNumber = typeof type === 'string' ? parseInt(type) : type;

  switch (typeNumber) {
    case 0:
      return 'Unknown';
    case 1:
      return 'Academic';
    case 2:
      return 'General Training';
    default:
      return 'Unknown';
  }
};

export const getPassageStatusLabel = (status: number): string => {
  switch (status) {
    case 1:
      return 'Draft';
    case 2:
      return 'Published';
    case 3:
      return 'Archived';
    default:
      return 'Unknown';
  }
};
