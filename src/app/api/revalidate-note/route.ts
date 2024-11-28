import InvalidInputError from "@/domain/errors/common/invalid-input-error";
import { NoteEventControllerPort } from "../../../application/ports/controllers/note-event.controller.port";
import appConfig from "@/infrastructure/config/appConfig";
import { dependencyRegistry } from "@/infrastructure/dependency-injection/dependency-registry";
import { NextRequest, NextResponse } from "next/server";
import { secureCompare } from "@/lib/utils";
import { NoteEvent } from "@/domain/models/note-event";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") || "";

  if (!secureCompare(secret, appConfig.revalidateSecret)) {
    return NextResponse.json({ message: "Unauthorized request" }, { status: 401 });
  }

  try {
    const { note_events } = await req.json();

    const isValidNoteArray = (notes: NoteEvent[]): boolean =>
      Array.isArray(notes) &&
      notes.every((note) => typeof note.id === "string" && typeof note.title === "string");

    if (!isValidNoteArray(note_events)) {
      return NextResponse.json(
        { message: "Invalid request format: expected arrays of objects with id and title" },
        { status: 400 }
      );
    }
    const noteEventController =
      dependencyRegistry.resolve<NoteEventControllerPort>("NoteEventController");

    await noteEventController.onNoteEvent(note_events);

    return NextResponse.json({
      message: "Revalidation successful",
    });
  } catch (error) {
    if (error instanceof InvalidInputError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("Internal Server Error: Error processing revalidation request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
