export interface Artwork {
    id: string;
    url: string;
    category: string;
    project?: string;
    title?: string;
    description?: string;
    createdAt: any;
    ownerUid: string;
  }