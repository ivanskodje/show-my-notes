import { GitHubNoteRepository } from "@/adapters/repositories/github-note.repository";
import { RevalidateService } from "@/adapters/services/github-revalidate-note.service";
import { GetLatestNotesController } from "@/adapters/controllers/get-latest-notes.controller";
import { FindNoteController } from "@/adapters/controllers/find-note.controller";
import { GetLatestNotesUseCase } from "@/application/use-cases/get-latest-notes.use-case";
import { FindNoteUseCase } from "@/application/use-cases/find-note.use-case";
import githubConfig from "@/adapters/repositories/config/github.config";
import { dependencyRegistry } from "@/infrastructure/dependency-injection/dependency-registry";
import { NoteChangeService } from "@/adapters/services/github-note-change.service";
import { NoteEventController } from "@/adapters/controllers/note-event.controller";
import { HandleNoteChangeUseCase } from "@/application/use-cases/handle-note-change.use-case";

let isRegistered = false;

export function registerDependencies() {
  if (isRegistered) {
    console.log("Skipping Registering Dependencies... already registered!");
    return;
  }

  isRegistered = true;

  console.log("Registering Dependencies... starting");

  // REPOSITORIES
  const noteRepository = new GitHubNoteRepository(githubConfig);
  dependencyRegistry.register("NoteRepository", noteRepository);

  // SERVICES
  const revalidateNoteService = new RevalidateService();
  dependencyRegistry.register("RevalidateNoteService", revalidateNoteService);

  const noteEventService = new NoteChangeService(revalidateNoteService);
  dependencyRegistry.register("NoteEventService", noteEventService);

  // CONTROLLERS
  dependencyRegistry.register(
    "NoteEventController",
    new NoteEventController(new HandleNoteChangeUseCase(noteEventService, revalidateNoteService))
  );

  dependencyRegistry.register(
    "GetLatestNotesController",
    new GetLatestNotesController(new GetLatestNotesUseCase(noteRepository))
  );

  dependencyRegistry.register(
    "FindNoteController",
    new FindNoteController(new FindNoteUseCase(noteRepository))
  );

  console.log("Registering Dependencies... were successfully completed!");
}
