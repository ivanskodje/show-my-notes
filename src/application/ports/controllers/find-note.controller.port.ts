import { Note } from "@/domain/models/note";

export interface FindNoteControllerPort {
  findNote(id: string): Promise<Note | null>;
}
