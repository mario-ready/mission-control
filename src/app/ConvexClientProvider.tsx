"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div className="p-8 text-zinc-600">
        Mission Control is missing NEXT_PUBLIC_CONVEX_URL.
      </div>
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}