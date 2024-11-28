import simpleGit from "simple-git";
import path from "path";
import githubConfig from "@/adapters/repositories/config/github.config";
import fs from "fs";

export class GitRepoSync {
  private static instance: GitRepoSync;
  private repoPath: string;
  private static isSyncing = false;

  private constructor() {
    const storagePath = path.isAbsolute(githubConfig.repoStoragePath)
      ? githubConfig.repoStoragePath
      : path.join(process.cwd(), githubConfig.repoStoragePath);
    this.repoPath = path.join(storagePath, githubConfig.repoName);
    console.log(`[GitRepoSync] Initializing repository at ${this.repoPath}`);
  }

  static getInstance(): GitRepoSync {
    if (!GitRepoSync.instance) {
      GitRepoSync.instance = new GitRepoSync();
    }
    return GitRepoSync.instance;
  }

  public async syncRepo(): Promise<void> {
    if (GitRepoSync.isSyncing) {
      console.warn("[GitRepoSync] Sync is already in progress, skipping this sync attempt...");
      return;
    }
    GitRepoSync.isSyncing = true;
    console.log("[GitRepoSync] starting sync...");
    try {
      const git = simpleGit();
      const repoUrl = this.getRepoUrl();

      if (fs.existsSync(this.repoPath)) {
        try {
          console.log(`[GitRepoSync] Pulling changes for ${githubConfig.repoName}...`);
          await git.cwd(this.repoPath).pull("origin", githubConfig.branch);
          console.log(`[GitRepoSync] Pull completed.`);
        } catch (error) {
          console.error(`[GitRepoSync] Pull failed. Re-cloning repository.`, error);
          await fs.promises.rm(this.repoPath, { recursive: true, force: true });
          await git.clone(repoUrl, this.repoPath, ["--branch", githubConfig.branch]);
          console.log(`[GitRepoSync] Re-clone completed.`);
        }
      } else {
        console.log(`[GitRepoSync] Cloning repository to ${this.repoPath}...`);
        await git.clone(repoUrl, this.repoPath, ["--branch", githubConfig.branch]);
        console.log(`[GitRepoSync] Cloned repository ${githubConfig.repoName}.`);
      }
    } finally {
      GitRepoSync.isSyncing = false;
    }
  }

  private getRepoUrl(): string {
    if (!githubConfig.privateAccessToken) {
      return `https://github.com/${githubConfig.repoOwner}/${githubConfig.repoName}.git`;
    }

    return `https://${githubConfig.privateAccessToken}@github.com/${githubConfig.repoOwner}/${githubConfig.repoName}.git`;
  }
}
