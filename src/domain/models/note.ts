export type Note = {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  content: string;
  excerpt?: string;
};
