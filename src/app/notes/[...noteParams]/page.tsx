import { notFound, redirect } from "next/navigation";
import React from "react";
import NoteContent from "@/app/notes/[...noteParams]/components/NoteContent";
import { dependencyRegistry } from "@/infrastructure/dependency-injection/dependency-registry";
import { GetLatestNotesControllerPort } from "@/application/ports/controllers/get-latest-notes.controller.port";
import { FindNoteControllerPort } from "@/application/ports/controllers/find-note.controller.port";
import { Note } from "@/domain/models/note";
import { GitRepoSync } from "@/adapters/repositories/github/github-repo-sync";

export async function generateStaticParams() {
  const getLatestNotesController: GetLatestNotesControllerPort = dependencyRegistry.resolve(
    "GetLatestNotesController"
  );

  await GitRepoSync.getInstance().syncRepo();
  const latestNotes: Note[] = await getLatestNotesController.getLatestNotes(9999);
  console.log(
    `Generating static params for ${latestNotes.length} notes with IDs: ${latestNotes.map((note) => note.id)}`
  );
  return latestNotes.map((note: Note) => ({
    noteParams: [note.id],
  }));
}

type NotePageProps = {
  params: Promise<{ noteParams: string[] }>;
};

const NotePage = async ({ params }: NotePageProps) => {
  const { noteParams } = await params;

  if (!noteParams || noteParams.length === 0) {
    notFound();
  }

  const noteId = noteParams[0];
  const noteSlug = noteParams[1];

  const findNoteController: FindNoteControllerPort =
    dependencyRegistry.resolve("FindNoteController");
  const note = await findNoteController.findNote(noteId);

  if (!note) {
    console.log("Could not find note with id: " + noteId);
    notFound();
  }

  if (!noteSlug || noteSlug !== note.slug) {
    const correctPath = `/notes/${noteId}/${note.slug}`;
    console.log(`Redirecting to correct slug: ${correctPath}`);
    redirect(correctPath);
  }

  return (
    <div className="mt-8 w-full">
      <NoteContent note={note} />
    </div>
  );
};

export default NotePage;
