export type NoteEventType = "UPDATED" | "DELETED";

export type NoteEvent = {
  id: string;
  title: string;
  type: NoteEventType;
};
