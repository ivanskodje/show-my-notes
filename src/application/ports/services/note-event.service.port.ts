import { NoteEvent } from "@/domain/models/note-event";

export interface NoteEventServicePort {
  onNoteDeleted(noteEvent: NoteEvent): unknown;
  onNoteChange(notePath: NoteEvent): Promise<void>;
}
