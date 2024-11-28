export interface RevalidateServicePort {
  revalidatePath(path: string): Promise<void>;
  revalidatePaths(paths: string[]): Promise<void>;
}
