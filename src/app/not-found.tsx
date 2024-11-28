"use client";

import { useNotFound } from "@/app/components/context/NotFoundContext";
import React, { useEffect } from "react";

const NotFoundPage = () => {
  const { setIsNotFound } = useNotFound();

  useEffect(() => {
    setIsNotFound(true);
    return () => setIsNotFound(false);
  }, [setIsNotFound]);

  return (
    <div>
      <div>Page Not Found</div>
    </div>
  );
};

export default NotFoundPage;
