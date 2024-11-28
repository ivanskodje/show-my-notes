import { revalidatePath } from "next/cache";
import { RevalidateServicePort } from "@/application/ports/services/revalidate-note.service.port";

export class RevalidateService implements RevalidateServicePort {
  async revalidatePath(path: string): Promise<void> {
    console.log(`Revalidating single path: ${path}`);
    await revalidatePath(path);
  }

  async revalidatePaths(paths: string[]): Promise<void> {
    for (const path of paths) {
      console.log(`Revalidating paths: ${path}`);
      await revalidatePath(path);
    }
  }
}
