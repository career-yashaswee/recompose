"use client";

import * as React from "react";
import { KanbanBoard, type Candidate } from "@/components/@kanban/board";

export default function Page(): React.ReactElement {
  const initial: Candidate[] = React.useMemo(
    () => [
      {
        id: "1",
        name: "Sonia Hoppe",
        email: "hao-sonia92@gmail.com",
        avatarUrl: "https://i.pravatar.cc/80?img=1",
        status: "sourced",
      },
      {
        id: "2",
        name: "Wilbur Hackett",
        email: "wilbur-hack@yahoo.com",
        avatarUrl: "https://i.pravatar.cc/80?img=2",
        status: "in_progress",
      },
      {
        id: "3",
        name: "Annette Dickinson",
        email: "anet-son@hotmail.com",
        avatarUrl: "https://i.pravatar.cc/80?img=3",
        status: "interview",
      },
      {
        id: "4",
        name: "Melissa Bartoletti",
        email: "mel.barto@gmail.com",
        avatarUrl: "https://i.pravatar.cc/80?img=4",
        status: "sourced",
      },
      {
        id: "5",
        name: "Keith Hirthe",
        email: "keith-hiirthe@yahoo.com",
        avatarUrl: "https://i.pravatar.cc/80?img=5",
        status: "in_progress",
      },
      {
        id: "6",
        name: "Angela Von",
        email: "angela93@gmail.com",
        avatarUrl: "https://i.pravatar.cc/80?img=6",
        status: "interview",
      },
    ],
    []
  );

  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="mb-4 text-2xl font-bold">Tasks</h1>
      <KanbanBoard initialItems={initial} />
    </div>
  );
}
