"use client";

import React from "react";
import { useSearch } from "@/app/shared/hooks/useSearch";
import { useLazyLoad } from "@/app/shared/hooks/useLazyLoad";
import { LazyGrid } from "@/app/shared/components/LazyGrid";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/app/shared/components/ui/Card";
import { Input } from "@/app/shared/components/ui/Input";
import { Note } from "@/domain/models/note";
import { timeAgo } from "@/lib/utils";
import { History, NotebookText } from "lucide-react";
import Link from "next/link";

type LatestNotesProps = {
  latestNotes: Note[];
};

function getNoteUrl(id: string, slug: string): string {
  return `/notes/${id}/${slug}`;
}

const LatestNotes = ({ latestNotes }: LatestNotesProps) => {
  const { query, setQuery, filteredItems } = useSearch(latestNotes, ["title", "tags"], 300);
  const visibleNotes = useLazyLoad(filteredItems, 12, 9);

  return (
    <>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search notes by title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-lg"
        />
      </div>
      <LazyGrid
        items={visibleNotes}
        renderItem={(note: Note) => (
          <Link
            prefetch={true}
            href={getNoteUrl(note.id, note.slug)}
            className="no-underline group h-full"
          >
            <Card className="relative h-full flex flex-col justify-between transition transform hover:scale-[1.02] hover:shadow-lg hover:bg-accent/10">
              <div className="absolute top-6 -left-3">
                <NotebookText className="text-accent w-8 h-8" />
              </div>
              <CardHeader className="gap-2">
                <CardTitle>{note.title}</CardTitle>
                <CardDescription>{note.tags.join(", ")}</CardDescription>
              </CardHeader>
              <CardContent className="gap-2">
                <p>{note.excerpt}</p>
              </CardContent>
              <CardFooter className="flex justify-end pb-0 items-end ">
                <p className="text-sm flex items-center">
                  <History className="mr-2" /> {timeAgo(note.updatedAt)}
                </p>
              </CardFooter>
            </Card>
          </Link>
        )}
      />
      {visibleNotes.length < filteredItems.length && (
        <div className="text-center my-4">
          <p>Scroll down to load more...</p>
        </div>
      )}
    </>
  );
};

export default LatestNotes;
