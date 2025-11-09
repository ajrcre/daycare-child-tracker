
export interface Status {
  id: string;
  label: string;
  color: string;
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  statusId: string;
  notes?: string;
  lastUpdated: string | null;
}
