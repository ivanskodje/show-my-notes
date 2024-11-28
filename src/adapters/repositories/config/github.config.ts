import { getEnvString } from "@/lib/utils";

export type GitHubRepoConfig = {
  repoOwner: string;
  repoName: string;
  branch: string;
  privateAccessToken?: string; // for accessing private repos
  folderPath: string;
  imageStoragePath: string; // specify folder to look for images
  repoStoragePath: string; // where repos are being stored
};

const githubConfig: GitHubRepoConfig = {
  repoOwner: getEnvString("GITHUB_REPO_OWNER"),
  repoName: getEnvString("GITHUB_REPO_NAME"),
  branch: getEnvString("GITHUB_BRANCH"),
  folderPath: getEnvString("GITHUB_FOLDER_PATH"),
  imageStoragePath: getEnvString("GITHUB_IMAGE_STORAGE_PATH"),
  privateAccessToken: getEnvString("GITHUB_PRIVATE_ACCESS_TOKEN"),
  repoStoragePath: "./data", // config owned by project
};

export default githubConfig;
