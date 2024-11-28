import PrismLoader from "@/app/components/PrismLoader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/shared/components/ui/Card";
import { Note } from "@/domain/models/note";
import { timeAgo } from "@/lib/utils";
import { FilePlus, History, NotebookText } from "lucide-react";
import Link from "next/link";
import React from "react";
import gfm from "remark-gfm";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import CustomBlockquote from "@/app/shared/components/markdown/CustomBlockquote";

type NotePageProps = {
  note: Note;
};

const InternalLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => <Link href={href}>{children}</Link>;

const NoteContent = async ({ note }: NotePageProps) => {
  return (
    <>
      <PrismLoader />
      <Card className="relative ">
        <div className="absolute top-5 -left-4">
          <NotebookText aria-hidden="true" className="text-accent w-8 h-8" />
        </div>
        <CardHeader className="gap-2">
          <CardTitle>{note.title}</CardTitle>
          <CardDescription>{note.tags.join(", ")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col">
          <div className="flex items-center space-x-4 h-8">
            <p className="flex items-center" aria-label={`Updated ${timeAgo(note.updatedAt)}`}>
              <History aria-hidden="true" className="mr-2" />
              <time dateTime={note.updatedAt.toISOString()}>{timeAgo(note.updatedAt)}</time>
            </p>
            <p className="flex items-center" aria-label={`Created ${timeAgo(note.createdAt)}`}>
              <FilePlus aria-hidden="true" className="mr-2" />
              <time dateTime={note.createdAt.toISOString()}>{timeAgo(note.createdAt)}</time>
            </p>
          </div>
          <ReactMarkdown
            className={"markdown-content"}
            remarkPlugins={[gfm]}
            urlTransform={(url) => (url.startsWith("data:image/") ? url : defaultUrlTransform(url))}
            components={{
              a(props) {
                const { href, children } = props;
                if (href && href.startsWith("#")) {
                  return <a href={href}>{children}</a>;
                }

                if (href && href.startsWith("/")) {
                  return <InternalLink href={href}>{children}</InternalLink>;
                }

                return (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                );
              },
              img(props) {
                const { src, alt } = props;
                return (
                  <img
                    src={src ?? ""}
                    alt={alt ?? ""}
                    className="my-4 rounded-md border border-gray-200"
                    loading="lazy"
                  />
                );
              },
              blockquote(props) {
                const { children } = props;
                return <CustomBlockquote>{children}</CustomBlockquote>;
              },
            }}
          >
            {note.content}
          </ReactMarkdown>
        </CardContent>
        <CardFooter className="flex justify-end"></CardFooter>
      </Card>
    </>
  );
};

export default NoteContent;
