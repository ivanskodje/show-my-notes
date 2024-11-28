import { NoteEventServicePort } from "@/application/ports/services/note-event.service.port";
import { RevalidateServicePort } from "@/application/ports/services/revalidate-note.service.port";
import InvalidInputError from "@/domain/errors/common/invalid-input-error";
import { NoteEvent } from "@/domain/models/note-event";

export class HandleNoteChangeUseCase {
  private noteEventService: NoteEventServicePort;
  private revalidateService: RevalidateServicePort;

  constructor(noteEventService: NoteEventServicePort, revalidateService: RevalidateServicePort) {
    this.noteEventService = noteEventService;
    this.revalidateService = revalidateService;
  }

  /**
   *
   * @throws {InvalidInputError} If notePaths are missing or empty
   */
  public async execute(noteEvents: NoteEvent[]): Promise<void> {
    if (!noteEvents || noteEvents.length === 0) {
      throw new InvalidInputError("HandleNoteChangeUseCase: notePaths cannot be missing or empty");
    }

    for (const noteEvent of noteEvents) {
      if (noteEvent.type === "UPDATED") {
        console.log(`HandleNoteChangeUseCase: Handling note change for ${noteEvent}`);
        await this.noteEventService.onNoteChange(noteEvent);
      } else if (noteEvent.type === "DELETED") {
        console.log(`HandleNoteChangeUseCase: Handling note deletion for ${noteEvent}`);
        await this.noteEventService.onNoteDeleted(noteEvent);
      } else {
        console.warn(`HandleNoteChangeUseCase: Unsupported NoteEvent: ${noteEvent}`);
      }
    }

    await this.revalidateService.revalidatePath("/");
  }
}
