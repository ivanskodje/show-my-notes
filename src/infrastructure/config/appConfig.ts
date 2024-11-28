import { getEnvString } from "@/lib/utils";

const appConfig = {
  appName: getEnvString("APP_NAME"),
  appDescription: getEnvString("APP_DESCRIPTION"),
  appUrl: getEnvString("NEXT_PUBLIC_APP_URL"),
  githubSHA: getEnvString("GITHUB_SHA"),
  githubDatetime: getEnvString("GITHUB_DATETIME"),
  revalidateSecret: getEnvString("REVALIDATE_SECRET"),
  initSecret: getEnvString("INIT_SECRET"),
};

export default appConfig;
