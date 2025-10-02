"use client";

import * as React from "react";
import { KanbanBoard } from "@/components/@kanban/board";

export default function Page(): React.ReactElement {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="mb-4 text-2xl font-bold">Tasks</h1>
      <KanbanBoard />
    </div>
  );
}
