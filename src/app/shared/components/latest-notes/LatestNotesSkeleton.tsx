import { Card, CardContent, CardFooter, CardHeader } from "@/app/shared/components/ui/Card";
import { Skeleton } from "@/app/shared/components/ui/Skeleton";
import { NotebookText } from "lucide-react";
import React from "react";

type LatestNotesSkeletonProps = {
  numberOfCards: number;
};

const LatestNotesSkeleton = ({ numberOfCards }: LatestNotesSkeletonProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {numberOfCards && numberOfCards > 0
        ? Array(numberOfCards)
            .fill(null)
            .map((_, i) => <CardSkeleton key={i} />)
        : null}
    </div>
  );
};

const CardSkeleton = () => {
  return (
    <div className="h-full">
      <Card
        className="relative h-full flex flex-col justify-between transition transform hover:scale-[1.02] hover:shadow-lg hover:bg-accent/10"
        style={{ transition: "all 0.1s ease" }}
      >
        <div className="absolute top-6 -left-3">
          <NotebookText className="text-accent" />
        </div>
        <CardHeader className="gap-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-5 w-2/3 flex-grow" />
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <Skeleton className="h-5 flex-grow mt-4" />
          <Skeleton className="h-5 flex-grow mt-4" />
          <Skeleton className="h-5 mt-4 w-1/2" />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Skeleton className=" h-6 w-1/3" />
        </CardFooter>
      </Card>
    </div>
  );
};

export default LatestNotesSkeleton;
