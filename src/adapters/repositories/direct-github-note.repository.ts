import { GitHubRepoConfig } from "@/adapters/repositories/config/github.config";
import { NoteRepositoryPort } from "@/application/ports/repositories/note.repository.port";
import DatabaseError from "@/domain/errors/common/database-error";
import { Note } from "@/domain/models/note";
import { MetadataCache } from "@/infrastructure/cache/metadata-cache";
import matter from "gray-matter";
import slugify from "slugify";

/**
 * UNUSED.
 * This implementation communicates directly with GitHub
 * instead of using local storage.
 */
export class DirectGitHubNoteRepository implements NoteRepositoryPort {
  private config: GitHubRepoConfig;
  private metadataCache: MetadataCache;
  private initializationPromise: Promise<void> | null = null;

  constructor(config: GitHubRepoConfig) {
    this.config = config;
    this.metadataCache = MetadataCache.getInstance();
  }

  public async getLatestNotes(limit: number): Promise<Note[]> {
    console.time(`[getLatestNotes] Fetching latest ${limit} notes`);
    try {
      const url = `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}/contents/${this.config.folderPath}?ref=${this.config.branch}`;
      const headers: HeadersInit = this.config.privateAccessToken
        ? { Authorization: `token ${this.config.privateAccessToken}` }
        : {};

      const response = await fetch(url, { headers });
      if (!response.ok) {
        console.error(`[getLatestNotes] Failed to fetch notes: ${response.statusText}`);
        throw new DatabaseError("Failed to fetch notes from GitHub.");
      }

      const files = (await response.json()).filter((file: { name: string }) =>
        file.name.endsWith(".md")
      );

      if (files.length === 0) {
        console.warn(`[getLatestNotes] No notes found in folder ${this.config.folderPath}`);
        return [];
      }

      const existingMetadata = new Map(this.metadataCache.getAll());

      const notesWithMetadata = await Promise.all(
        files.map(async (file: { name: string }) => {
          try {
            const content = await this.loadContent(file.name);
            const note = await this.parseNoteContent(content);

            this.metadataCache.set(note.id, {
              fileName: file.name,
              title: note.title,
              slug: note.slug,
              isDirty: false,
            });

            existingMetadata.delete(note.id);
            return note;
          } catch (error) {
            console.warn(`[getLatestNotes] Error processing file: ${file.name}`, error);
            return null;
          }
        })
      );

      existingMetadata.forEach((_value, id) => {
        console.warn(
          `[getLatestNotes] Note ${id} no longer exists in the GitHub repository, clearing from cache`
        );
        this.metadataCache.delete(id);
      });

      const validNotes = notesWithMetadata.filter((note) => note !== null) as Note[];

      const sortedNotes = validNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      const sortedNotesLimited = sortedNotes.slice(0, limit);
      return sortedNotesLimited;
    } catch (error) {
      console.error(`[getLatestNotes] Error while fetching latest notes:`, error);
      throw new DatabaseError("Error while fetching latest notes.");
    } finally {
      console.timeEnd(`[getLatestNotes] Fetching latest ${limit} notes`);
    }
  }

  public async findNote(id: string): Promise<Note | null> {
    if (!id) {
      return null;
    }

    console.time(`[findNote] Searching for note with ID: ${id}`);
    try {
      await this.ensureInitialized();

      const metadata = this.metadataCache.get(id);
      if (!metadata || metadata.isDirty) {
        return await this.searchNoteFromGitHub(id);
      }

      const content = await this.loadContent(metadata.fileName);
      return await this.parseNoteContent(content);
    } catch (error) {
      console.error(`[findNote] Failed to find note with ID: ${id}`, error);
      return null;
    } finally {
      console.timeEnd(`[findNote] Searching for note with ID: ${id}`);
    }
  }

  private async loadAllNotesMetadata(): Promise<void> {
    console.time("[loadAllNotesMetadata] Initializing metadata cache");
    try {
      const url = `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}/contents/${this.config.folderPath}?ref=${this.config.branch}`;
      const headers: HeadersInit = this.config.privateAccessToken
        ? { Authorization: `token ${this.config.privateAccessToken}` }
        : {};

      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new DatabaseError("Failed to fetch metadata from GitHub.");
      }

      const files = (await response.json()).filter((file: { name: string }) =>
        file.name.endsWith(".md")
      );

      const metadataPromises = files.map(async (file: { name: string }) => {
        try {
          const content = await this.loadContent(file.name);
          const metadata = await this.loadMetadataFromContent(content);
          this.metadataCache.set(metadata.id, {
            fileName: file.name,
            title: metadata.title,
            slug: metadata.slug,
            isDirty: false,
          });
        } catch (error) {
          console.warn(
            `[loadAllNotesMetadata] Error loading metadata for file: ${file.name}`,
            error
          );
        }
      });

      await Promise.all(metadataPromises);
    } catch (error) {
      console.error("[loadAllNotesMetadata] Error initializing metadata cache", error);
      throw error;
    } finally {
      console.timeEnd("[loadAllNotesMetadata] Initializing metadata cache");
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.loadAllNotesMetadata();
    }
    await this.initializationPromise;
  }

  private async searchNoteFromGitHub(id: string): Promise<Note | null> {
    const url = `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}/contents/${this.config.folderPath}?ref=${this.config.branch}`;
    const headers: HeadersInit = this.config.privateAccessToken
      ? { Authorization: `token ${this.config.privateAccessToken}` }
      : {};

    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error(
        `[searchNoteFromGitHub] Failed to load any notes from the GitHub folder ${this.config.folderPath}`
      );
      throw new DatabaseError(`Could not load notes from ${this.config.folderPath}`);
    }

    const markdownFiles = (await response.json()).filter((file: { name: string }) =>
      file.name.endsWith(".md")
    );

    const filteredMarkdownFiles = markdownFiles.filter((file: { name: string }) => {
      for (const [cachedId, meta] of this.metadataCache.getAll()) {
        if (meta.fileName === file.name) {
          if (cachedId === id) {
            return true;
          }
          if (meta.isDirty) {
            return true;
          }
          return false;
        }
      }
      return true;
    });

    console.log(
      `[searchNoteFromGitHub] Listed filtered markdown files in folder ${this.config.folderPath} (${filteredMarkdownFiles.length}): ${filteredMarkdownFiles}`
    );

    for (const file of filteredMarkdownFiles) {
      const content = await this.loadContent(file.name);
      const metadata = await this.loadMetadataFromContent(content);
      this.metadataCache.set(metadata.id, {
        fileName: file.name,
        title: metadata.title,
        slug: metadata.slug,
        isDirty: false,
      });

      if (metadata.id === id) {
        return await this.parseNoteContent(content);
      }
    }

    console.warn(`[searchNoteFromGitHub] Note with ID ${id} not found.`);
    return null;
  }

  private async loadMetadataFromContent(content: string) {
    const { data } = matter(content);
    const id = data.id;
    const validIdPattern = /^[a-zA-Z0-9]+$/; // Alphanumeric chars

    if (!id) {
      console.error(`[loadMetadataFromContent] Missing note ID while we attempt to load metadata`);
      throw new DatabaseError(`No ID found in note content`);
    }

    if (!validIdPattern.test(id)) {
      console.error(`[loadMetadataFromContent] Invalid ID in file: ${id}`);
      throw new DatabaseError(`Invalid ID: ${id}`);
    }

    const title = data.title || "Untitled";
    const slug = slugify(title, { lower: true, strict: true });

    return {
      id: id,
      title: title,
      slug: slug,
    };
  }

  private async loadContent(filePath: string): Promise<string> {
    const encodedFilePath = encodeURIComponent(filePath);
    const url = `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}/contents/${this.config.folderPath}/${encodedFilePath}?ref=${this.config.branch}`;

    const headers: HeadersInit = this.config.privateAccessToken
      ? { Authorization: `token ${this.config.privateAccessToken}` }
      : {};

    const response = await fetch(url, { headers });

    if (!response.ok) throw new DatabaseError(`Failed to fetch file ${filePath}`);

    const data = await response.json();

    if (data.content && data.encoding === "base64") {
      console.log(`Loaded (base64) content for file: ${filePath}`);
      return Buffer.from(data.content, "base64").toString("utf-8");
    }

    throw new DatabaseError(
      `Unexpected file content for ${filePath} while loading content from URL: ${url}`
    );
  }

  private async parseNoteContent(content: string): Promise<Note> {
    try {
      const { data, content: noteContent } = matter(content);
      const noteId = data.id;
      const validIdPattern = /^[a-zA-Z0-9]+$/; // Alphanumeric chars

      if (!noteId || !validIdPattern.test(noteId)) {
        console.warn(`Invalid id metadata: ${noteId}`);
        throw new DatabaseError(`Invalid id metadata: ${noteId}`);
      }

      const title = data.title || "Untitled";
      const slug = slugify(title, { lower: true, strict: true });

      const contentWithImages = await this.replaceImagesAsync(noteContent);

      const transformedContent = contentWithImages.replace(
        /\[([^\]]+)\]\(<\.\/([^)]+\.md)>\)/g,
        (match, linkText, linkFilename) => {
          let noteIdForLink = null;

          for (const [cachedId, meta] of this.metadataCache.getAll()) {
            if (meta.fileName === linkFilename) {
              noteIdForLink = cachedId;
              break;
            }
          }

          if (noteIdForLink) {
            const slugForLink = slugify(linkText, { lower: true, strict: true });
            return `[${linkText}](</notes/${noteIdForLink}/${slugForLink}>)`;
          }

          console.warn(`[parseNoteContent] Link filename not found in cache: ${linkFilename}`);
          return match;
        }
      );

      return {
        id: noteId,
        title,
        slug,
        excerpt: data.excerpt || "",
        tags: data.tags || [],
        createdAt: data["date-created"] ? new Date(data["date-created"]) : new Date(),
        updatedAt: data["date-modified"] ? new Date(data["date-modified"]) : new Date(),
        content: transformedContent,
      };
    } catch (error) {
      console.error(`[parseNoteContent] Failed to parse content:`, error);

      if (error instanceof Error) {
        throw new DatabaseError(`Failed to parse note content: ${error.message}`);
      }

      throw new DatabaseError(`Failed to parse note content: ${String(error)}`);
    }
  }
  private async replaceImagesAsync(content: string): Promise<string> {
    const regex = /!\[([^\]]*)\]\(<\.\.\/__data\/attachments\/([^)]+)>\)/g;
    const matches = [...content.matchAll(regex)];

    for (const match of matches) {
      const alt = match[1];
      const imgPath = match[2];
      const imageUrl = await this.fetchImageFromGitHub(`__data/attachments/${imgPath}`);
      if (imageUrl) {
        console.log(`Alt=${match[1]}, Path=${match[2]} imageUrl: ${imageUrl.slice(0, 80)}`);
        content = content.replace(match[0], `![${alt}](${imageUrl})`);
      }
    }
    return content;
  }

  private async fetchImageFromGitHub(path: string): Promise<string | null> {
    const encodedPath = encodeURIComponent(path);
    const url = `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}/contents/${encodedPath}?ref=${this.config.branch}`;
    const headers: HeadersInit = this.config.privateAccessToken
      ? { Authorization: `token ${this.config.privateAccessToken}` }
      : {};
    const response = await fetch(url, { headers });

    if (!response.ok) {
      console.error(`Error fetching image ${path}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (data.content && data.encoding === "base64") {
      const mimeType = path.endsWith(".jpg") || path.endsWith(".jpeg") ? "image/jpeg" : "image/png";
      return `data:${mimeType};base64,${data.content.replace(/\r?\n|\r/g, "")}`;
    }

    if (data.download_url) {
      const base64Content = await this.fetchImageAsBase64(data.download_url, headers);
      return base64Content ? `data:image/png;base64,${base64Content}` : null;
    }

    return null;
  }

  private async fetchImageAsBase64(
    downloadUrl: string,
    headers: HeadersInit
  ): Promise<string | null> {
    const response = await fetch(downloadUrl, { headers });

    if (!response.ok) {
      console.error(`Error fetching raw file from ${downloadUrl}: ${response.statusText}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  }
}
