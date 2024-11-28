import { GetLatestNotesControllerPort } from "@/application/ports/controllers/get-latest-notes.controller.port";
import "../style/globals.css";
import LatestNotes from "@/app/shared/components/latest-notes/LatestNotes";
import { Note } from "@/domain/models/note";
import { dependencyRegistry } from "@/infrastructure/dependency-injection/dependency-registry";
import { GitRepoSync } from "@/adapters/repositories/github/github-repo-sync";

export default async function Home() {
  const getLatestNotesController: GetLatestNotesControllerPort = dependencyRegistry.resolve(
    "GetLatestNotesController"
  );
  console.time("getLatestNotes");
  await GitRepoSync.getInstance().syncRepo();
  const latestNotes: Note[] = await getLatestNotesController.getLatestNotes(9999);
  console.timeEnd("getLatestNotes");
  return (
    <div>
      <LatestNotes latestNotes={latestNotes} />
    </div>
  );
}
