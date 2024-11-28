import { NoteEvent } from "@/domain/models/note-event";

export interface NoteEventControllerPort {
  onNoteEvent(noteEvents: NoteEvent[]): Promise<void>;
}
