import { FindNoteControllerPort as FindNoteControllerPort } from "@/application/ports/controllers/find-note.controller.port";
import { Note } from "@/domain/models/note";
import { FindNoteUseCase } from "@/application/use-cases/find-note.use-case";

export class FindNoteController implements FindNoteControllerPort {
  private readonly findNoteUseCase: FindNoteUseCase;

  constructor(findNoteUseCase: FindNoteUseCase) {
    this.findNoteUseCase = findNoteUseCase;
  }

  async findNote(id: string): Promise<Note | null> {
    const note = await this.findNoteUseCase.execute(id);
    return note;
  }
}
