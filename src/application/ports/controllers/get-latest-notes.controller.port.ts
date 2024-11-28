import { Note } from "@/domain/models/note";

export interface GetLatestNotesControllerPort {
  getLatestNotes(numberOfNotes: number): Promise<Note[]>;
}
