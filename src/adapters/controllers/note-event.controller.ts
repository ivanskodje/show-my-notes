import { NoteEventControllerPort } from "@/application/ports/controllers/note-event.controller.port";
import { HandleNoteChangeUseCase } from "@/application/use-cases/handle-note-change.use-case";
import { NoteEvent } from "@/domain/models/note-event";

export class NoteEventController implements NoteEventControllerPort {
  private readonly handleNoteChangeUseCase: HandleNoteChangeUseCase;

  constructor(handleNoteChangeUseCase: HandleNoteChangeUseCase) {
    this.handleNoteChangeUseCase = handleNoteChangeUseCase;
  }

  public async onNoteEvent(noteEvents: NoteEvent[]): Promise<void> {
    await this.handleNoteChangeUseCase.execute(noteEvents);
  }
}
