export class MetadataCache {
  private static instance: MetadataCache;
  private metadata: Map<
    string,
    { fileName: string; title: string; slug: string; isDirty: boolean }
  >;

  private constructor() {
    this.metadata = new Map();
  }

  public static getInstance(): MetadataCache {
    if (!MetadataCache.instance) {
      MetadataCache.instance = new MetadataCache();
    }
    return MetadataCache.instance;
  }

  public get(id: string) {
    return this.metadata.get(id);
  }

  public set(
    id: string,
    data: { fileName: string; title: string; slug: string; isDirty: boolean }
  ) {
    this.metadata.set(id, data);
  }

  public has(id: string): boolean {
    return this.metadata.has(id);
  }

  public delete(id: string): boolean {
    if (!this.metadata.has(id)) {
      console.warn(`[MetadataCache] Attempted to delete an unknown ID: ${id}`);
      return false;
    }
    this.metadata.delete(id);
    console.log(`[MetadataCache] Deleted metadata entry with ID: ${id}`);
    return true;
  }

  public makeDirty(id: string): boolean {
    const entry = this.metadata.get(id);
    if (!entry) {
      console.warn(`[MetadataCache] Attempted to makeDirty an unknown ID: ${id}`);
      return false;
    }
    entry.isDirty = true;
    this.metadata.set(id, entry);
    console.log(`[MetadataCache] Marked entry with ID ${id} as dirty.`);
    return true;
  }

  public getAll(): Map<
    string,
    { fileName: string; title: string; slug: string; isDirty: boolean }
  > {
    return this.metadata;
  }
}
