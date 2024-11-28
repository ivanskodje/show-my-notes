import { Note } from "@/domain/models/note";
import { NoteRepositoryPort } from "@/application/ports/repositories/note.repository.port";

export class FindNoteUseCase {
  private readonly noteRepository: NoteRepositoryPort;
  constructor(noteRepository: NoteRepositoryPort) {
    this.noteRepository = noteRepository;
  }

  public async execute(id: string): Promise<Note | null> {
    return this.noteRepository.findNote(id);
  }
}
