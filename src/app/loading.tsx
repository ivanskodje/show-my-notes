import LatestNotesSkeleton from "@/app/shared/components/latest-notes/LatestNotesSkeleton";
import React from "react";

const LoadingPage = () => {
  return <LatestNotesSkeleton numberOfCards={6} />;
};

export default LoadingPage;
