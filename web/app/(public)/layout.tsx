import { Navbar } from "@/components/common/navbar";
import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
