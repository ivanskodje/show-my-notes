import { NextRequest, NextResponse } from "next/server";
import appConfig from "@/infrastructure/config/appConfig";
import { secureCompare } from "@/lib/utils";
import { registerDependencies } from "@/infrastructure/dependency-injection/dependency.config";
import { GitRepoSync } from "@/adapters/repositories/github/github-repo-sync";

const repoSync = GitRepoSync.getInstance();

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret") || "";

  if (!secureCompare(secret, appConfig.initSecret)) {
    console.warn(`Unauthorized request`);
    return NextResponse.json({ message: "Unauthorized request" }, { status: 401 });
  }

  console.log("Initializing API starting...");
  try {
    registerDependencies();
    await repoSync.syncRepo();

    return NextResponse.json({
      message: "Dependency initialization successful",
    });
  } catch (error) {
    console.error("Error during dependency initialization:", error);

    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
