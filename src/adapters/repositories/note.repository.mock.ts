import fs from "node:fs/promises";
import path from "node:path";
import { Note } from "@/domain/models/note";
import { NoteRepositoryPort } from "@/application/ports/repositories/note.repository.port";
import matter from "gray-matter";
import slugify from "slugify";

const MOCK_DATA_PATH = path.join(process.cwd(), "mock-notes.json");

export class MockNoteRepository implements NoteRepositoryPort {
  private notes: Note[] = [];

  constructor() {
    this.loadNotesFromFile();
  }

  private async loadNotesFromFile() {
    try {
      const data = await fs.readFile(MOCK_DATA_PATH, "utf-8");
      const parsedNotes: Note[] = JSON.parse(data);

      this.notes = parsedNotes.map((note) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));

      console.log("Notes successfully loaded from mock-notes.json");
    } catch (error) {
      console.error("Error loading notes from file:", error);
      this.notes = [];
    }
  }

  private async saveNotesToFile() {
    try {
      await fs.writeFile(MOCK_DATA_PATH, JSON.stringify(this.notes, null, 2));
      console.log("Notes successfully saved to mock-notes.json");
    } catch (error) {
      console.error("Error saving notes to file:", error);
    }
  }

  async findNote(id: string): Promise<Note | null> {
    if (!this.notes.length) {
      await this.loadNotesFromFile();
    }

    const decodedId = decodeURIComponent(id);

    const note = this.notes.find((note) => note.id === decodedId);
    return note || null;
  }

  async getLatestNotes(limit: number): Promise<Note[]> {
    if (!this.notes.length) {
      await this.loadNotesFromFile();
    }
    return this.notes.slice(0, limit);
  }

  async addNote(content: string, filename: string): Promise<void> {
    const { data, content: noteContent } = matter(content);
    const newNote: Note = {
      id: filename,
      title: data.title || "Untitled",
      slug: slugify(data.title, { lower: true, strict: true }),
      excerpt: data.excerpt || "",
      tags: data.tags || [],
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      content: noteContent,
    };
    this.notes.push(newNote);
    await this.saveNotesToFile();
  }
}
