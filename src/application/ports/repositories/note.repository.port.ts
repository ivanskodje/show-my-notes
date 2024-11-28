import { Note } from "@/domain/models/note";

export interface NoteRepositoryPort {
  getLatestNotes(limit: number): Promise<Note[]>;
  findNote(id: string): Promise<Note | null>;
}
