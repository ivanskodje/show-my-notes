import { Note } from "@/domain/models/note";
import { GetLatestNotesControllerPort as GetLatestNotesControllerPort } from "../../application/ports/controllers/get-latest-notes.controller.port";
import { GetLatestNotesUseCase } from "@/application/use-cases/get-latest-notes.use-case";
export class GetLatestNotesController implements GetLatestNotesControllerPort {
  private readonly getLatestNotesUseCase: GetLatestNotesUseCase;

  constructor(getLatestNotesUseCase: GetLatestNotesUseCase) {
    this.getLatestNotesUseCase = getLatestNotesUseCase;
  }

  async getLatestNotes(numberOfNotes: number): Promise<Note[]> {
    const notes = await this.getLatestNotesUseCase.execute(numberOfNotes);
    return notes;
  }
}
