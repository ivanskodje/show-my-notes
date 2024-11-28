import { Card, CardContent, CardFooter, CardHeader } from "@/app/shared/components/ui/Card";
import { Skeleton } from "@/app/shared/components/ui/Skeleton";
import { NotebookText, FilePlus, History } from "lucide-react";
import React from "react";

const NotePageSkeleton = () => {
  return (
    <div className="max-w-3xl mx-auto mt-8">
      <Card className="relative">
        <div className="absolute top-5 -left-4">
          <NotebookText aria-hidden="true" className="text-accent w-8 h-8" />
        </div>
        <CardHeader>
          <Skeleton className="h-6 w-3/4 mb-2" /> {/* title */}
          <Skeleton className="h-4 w-1/3" /> {/* tags */}
        </CardHeader>
        <CardContent className="flex flex-col gap-8 mt-4">
          <div className="flex flex-row items-center mb-10">
            <div className="flex flexrow items-center mr-2">
              <FilePlus aria-hidden="true" className="mr-2" />
              <Skeleton className="h-4 w-16 sm:w-28" /> {/* created date */}
            </div>
            <div className="flex items-center">
              <History aria-hidden="true" className="mr-2" />
              <Skeleton className="h-4 w-16 sm:w-28" /> {/* updated date */}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-full" /> {/* content area */}
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end"></CardFooter>
      </Card>
    </div>
  );
};

export default NotePageSkeleton;
