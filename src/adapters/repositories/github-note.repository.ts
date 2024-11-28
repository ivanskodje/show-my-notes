import { GitHubRepoConfig } from "@/adapters/repositories/config/github.config";
import { NoteRepositoryPort } from "@/application/ports/repositories/note.repository.port";
import { Note } from "@/domain/models/note";
import matter from "gray-matter";
import slugify from "slugify";
import fs from "fs/promises";
import path from "path";
import DatabaseError from "@/domain/errors/common/database-error";
import { MetadataCache } from "@/infrastructure/cache/metadata-cache";

export class GitHubNoteRepository implements NoteRepositoryPort {
  private githubConfig: GitHubRepoConfig;
  private repoPath: string;
  private initializationPromise: Promise<void> | null = null;
  private metadataCache: MetadataCache = MetadataCache.getInstance();

  constructor(githubConfig: GitHubRepoConfig) {
    this.githubConfig = githubConfig;
    this.repoPath = path.join(githubConfig.repoStoragePath, githubConfig.repoName);
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initializeMetadataCache();
    }
    await this.initializationPromise;
  }

  private async initializeMetadataCache(): Promise<void> {
    console.time("[initializeMetadataCache] Caching metadata");
    try {
      const notesPath = path.join(this.repoPath, this.githubConfig.folderPath);
      const files = (await fs.readdir(notesPath)).filter((file) => file.endsWith(".md"));

      const foundIds = new Set<string>();

      await Promise.all(
        files.map(async (file) => {
          const content = await fs.readFile(path.join(notesPath, file), "utf-8");
          const { data } = matter(content);

          const id = data.id;
          const title = data.title || "Untitled";
          const slug = slugify(title, { lower: true, strict: true });

          if (id) {
            foundIds.add(id);
            this.metadataCache.set(id, {
              fileName: file,
              title,
              slug,
              isDirty: false,
            });
          } else {
            console.warn(`[initializeMetadataCache] Invalid ID in file: ${file}`);
          }
        })
      );

      const cachedIds = Array.from(this.metadataCache.getAll().keys());
      const oldIds = cachedIds.filter((id) => !foundIds.has(id));

      for (const oldId of oldIds) {
        console.warn(`[initializeMetadataCache] Deleting outdated metadata entry for ID: ${oldId}`);
        this.metadataCache.delete(oldId);
      }
    } catch (error) {
      console.error("[initializeMetadataCache] Failed to initialize metadata cache", error);
    } finally {
      console.timeEnd("[initializeMetadataCache] Caching metadata");
    }
  }

  public async getLatestNotes(limit: number): Promise<Note[]> {
    console.time(`[getLatestNotes] Fetching latest ${limit} notes`);
    try {
      await this.initializeMetadataCache();

      const notesPath = path.join(this.repoPath, this.githubConfig.folderPath);
      const files = (await fs.readdir(notesPath)).filter((file) => file.endsWith(".md"));

      const notes = await Promise.all(
        files.map(async (file) => {
          const content = await fs.readFile(path.join(notesPath, file), "utf-8");
          return this.parseNoteContent(content, file);
        })
      );

      const validNotes = notes.filter((note): note is Note => note !== null);
      const sortedNotes = validNotes.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      return sortedNotes.slice(0, limit);
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
      if (metadata) {
        if (metadata.isDirty) {
          console.warn(`[findNote] Metadata for ID: ${id} is dirty. Reloading note.`);
          const filePath = path.join(
            this.repoPath,
            this.githubConfig.folderPath,
            metadata.fileName
          );
          const content = await fs.readFile(filePath, "utf-8");
          const note = await this.parseNoteContent(content, metadata.fileName);

          if (note) {
            this.metadataCache.set(id, {
              fileName: metadata.fileName,
              title: note.title,
              slug: note.slug,
              isDirty: false,
            });
            return note;
          }
        } else {
          const filePath = path.join(
            this.repoPath,
            this.githubConfig.folderPath,
            metadata.fileName
          );
          const content = await fs.readFile(filePath, "utf-8");
          return this.parseNoteContent(content, metadata.fileName);
        }
      }

      console.warn(`[findNote] ID not found in cache. Reinitializing metadata cache.`);
      await this.initializeMetadataCache();

      const newMetadata = this.metadataCache.get(id);
      if (newMetadata) {
        const filePath = path.join(
          this.repoPath,
          this.githubConfig.folderPath,
          newMetadata.fileName
        );
        const content = await fs.readFile(filePath, "utf-8");
        return this.parseNoteContent(content, newMetadata.fileName);
      }

      console.warn(`[findNote] ID '${id}' not found, returning null`);
      return null;
    } catch (error) {
      console.error(`[findNote] Failed to find note with ID: ${id}`, error);
      return null;
    } finally {
      console.timeEnd(`[findNote] Searching for note with ID: ${id}`);
    }
  }

  private async fetchImageLocally(imagePath: string): Promise<string | null> {
    try {
      const absolutePath = path.join(this.repoPath, this.githubConfig.imageStoragePath, imagePath);
      const fileBuffer = await fs.readFile(absolutePath);
      const mimeType = this.getMimeTypeFromExtension(path.extname(imagePath));
      return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
    } catch (error) {
      console.warn(`[fetchImageLocally] Failed to read image: ${imagePath}`, error);
      return null;
    }
  }

  private getMimeTypeFromExtension(extension: string): string {
    switch (extension.toLowerCase()) {
      case ".jpg":
      case ".jpeg":
        return "image/jpeg";
      case ".png":
        return "image/png";
      case ".gif":
        return "image/gif";
      case ".webp":
        return "image/webp";
      default:
        console.warn(`[getMimeTypeFromExtension] Unknown extension: ${extension}`);
        return "application/octet-stream";
    }
  }

  private async replaceImagesAsync(content: string): Promise<string> {
    const regex = /!\[([^\]]*)\]\(<\.\.\/__data\/attachments\/([^)]+)>\)/g;
    const matches = [...content.matchAll(regex)];

    await Promise.all(
      matches.map(async (match) => {
        const alt = match[1];
        const imgPath = match[2];
        const base64Image = await this.fetchImageLocally(imgPath);

        if (base64Image) {
          console.log(`[replaceImagesAsync] Successfully loaded image: ${imgPath}`);
          content = content.replace(match[0], `![${alt}](${base64Image})`);
        } else {
          console.warn(`[replaceImagesAsync] Image not found or failed to load: ${imgPath}`);
        }
      })
    );

    return content;
  }

  private async parseNoteContent(content: string, fileName: string): Promise<Note | null> {
    try {
      const { data, content: noteContent } = matter(content);
      const id = data.id;
      const validIdPattern = /^[a-zA-Z0-9]+$/;

      if (!id || !validIdPattern.test(id)) {
        console.warn(`[parseNoteContent] Invalid ID in file: ${fileName}`);
        return null;
      }

      const title = data.title || "Untitled";
      const slug = slugify(title, { lower: true, strict: true });
      const createdAt = data["date-created"] ? new Date(data["date-created"]) : new Date();
      const updatedAt = data["date-modified"] ? new Date(data["date-modified"]) : new Date();

      const contentWithImages = await this.replaceImagesAsync(noteContent);

      const transformedContent = await (async () => {
        const regex = /\[([^\]]+)\]\(<\.\/([^)]+\.md)>\)/g;
        const matches = [...contentWithImages.matchAll(regex)];
        let updatedContent = contentWithImages;

        for (const match of matches) {
          const [fullMatch, linkText, linkFilename] = match;
          const notesPath = path.join(this.repoPath, this.githubConfig.folderPath);
          const files = (await fs.readdir(notesPath)).filter((file) => file.endsWith(".md"));

          let noteIdForLink: string | null = null;

          for (const file of files) {
            const filePath = path.join(notesPath, file);
            const fileContent = await fs.readFile(filePath, "utf-8");

            const { data } = matter(fileContent);
            if (data.id && file === linkFilename) {
              noteIdForLink = data.id;
              break;
            }
          }

          if (noteIdForLink) {
            const slugForLink = slugify(linkText, { lower: true, strict: true });
            const newLink = `[${linkText}](</notes/${noteIdForLink}/${slugForLink}>)`;
            updatedContent = updatedContent.replace(fullMatch, newLink);
          } else {
            console.warn(
              `[parseNoteContent] Link filename not found or ID not matched: ${linkFilename}`
            );
          }
        }

        return updatedContent;
      })();

      return {
        id,
        title,
        slug,
        excerpt: data.excerpt || "",
        tags: data.tags || [],
        createdAt,
        updatedAt,
        content: transformedContent,
      };
    } catch (error) {
      console.error(`[parseNoteContent] Failed to parse file: ${fileName}`, error);
      return null;
    }
  }
}
