import slugify from "slugify";
import { RevalidateServicePort } from "@/application/ports/services/revalidate-note.service.port";
import { NoteEventServicePort } from "@/application/ports/services/note-event.service.port";
import { NoteEvent } from "@/domain/models/note-event";
import { MetadataCache } from "@/infrastructure/cache/metadata-cache";
import { GitRepoSync } from "@/adapters/repositories/github/github-repo-sync";

export class NoteChangeService implements NoteEventServicePort {
  private revalidateNoteService: RevalidateServicePort;
  private metadataCache: MetadataCache;
  private gitRepoSync: GitRepoSync;

  constructor(revalidateNoteService: RevalidateServicePort) {
    this.gitRepoSync = GitRepoSync.getInstance();
    this.revalidateNoteService = revalidateNoteService;
    this.metadataCache = MetadataCache.getInstance();
  }

  public async onNoteDeleted(noteEvent: NoteEvent): Promise<void> {
    const id = noteEvent.id;
    const slug = slugify(noteEvent.title, { lower: true, strict: true });

    this.metadataCache.delete(id);
    await this.gitRepoSync.syncRepo();

    const pathsToRevalidate = [`/notes/${id}`, `/notes/${id}/${slug}`];
    await this.revalidateNoteService.revalidatePaths(pathsToRevalidate);

    console.log(`Processed note event deletion for ${id} with slug ${slug}`);
  }

  public async onNoteChange(noteEvent: NoteEvent): Promise<void> {
    const id = noteEvent.id;
    const slug = slugify(noteEvent.title, { lower: true, strict: true });

    this.metadataCache.makeDirty(id);
    await this.gitRepoSync.syncRepo();

    const pathsToRevalidate = [`/notes/${id}`, `/notes/${id}/${slug}`];
    await this.revalidateNoteService.revalidatePaths(pathsToRevalidate);

    console.log(`Processed note event changed for ${id} with slug ${slug}`);
  }
}
