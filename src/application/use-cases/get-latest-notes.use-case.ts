import { Note } from "@/domain/models/note";
import { NoteRepositoryPort } from "@/application/ports/repositories/note.repository.port";

export class GetLatestNotesUseCase {
  private readonly noteRepository: NoteRepositoryPort;

  constructor(noteRepository: NoteRepositoryPort) {
    this.noteRepository = noteRepository;
  }

  public async execute(numberOfNotes: number): Promise<Note[]> {
    const notes = await this.noteRepository.getLatestNotes(numberOfNotes);
    return notes;
  }
}
