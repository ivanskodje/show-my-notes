"use client";

import { useNotFound } from "@/app/components/context/NotFoundContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/shared/components/ui/Breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Fragment, useMemo } from "react";

type segmentsToSkip = number;
const exclusionConfig: [string, segmentsToSkip][] = [["notes", 1]]; // hides "/notes/{anything}/"

const Breadcrumbs = () => {
  const { isNotFound } = useNotFound(); // Not a fan of using this, but it seem to work
  const paths = usePathname();

  const { filteredSegments, originalSegments } = useMemo(() => {
    const segments = paths.split("/").filter((path) => path);
    const filteredSegments: string[] = [];
    const excludeIndexes: number[] = [];

    exclusionConfig.forEach(([matchString, skipCount]) => {
      const matchIndex = segments.indexOf(matchString);

      if (matchIndex !== -1) {
        for (let i = matchIndex; i <= matchIndex + skipCount; i++) {
          excludeIndexes.push(i);
        }
      }
    });

    segments.forEach((segment, index) => {
      if (!excludeIndexes.includes(index)) {
        filteredSegments.push(segment);
      }
    });

    return { filteredSegments, originalSegments: segments };
  }, [paths]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="select-none">
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {filteredSegments.map((link: string, index: number) => {
          const originalPathIndex = originalSegments.findIndex((segment) => segment === link);
          const href = `/${originalSegments.slice(0, originalPathIndex + 1).join("/")}`;

          const linkName = link[0].toUpperCase() + link.slice(1).replaceAll("-", " ");
          const isLastPath = filteredSegments.length === index + 1;

          return (
            <Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLastPath ? (
                  <BreadcrumbPage className="select-none">{linkName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href} className="select-none">
                      {linkName}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}

        {isNotFound && (
          <Fragment>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="select-none">Page Not Found</BreadcrumbPage>
          </Fragment>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
