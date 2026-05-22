"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center gap-6 px-8">
        <p className="font-retro text-mario-red text-lg tracking-wider">
          GAME OVER
        </p>
        <div className="text-center">
          <p className="font-retro text-white text-[10px] leading-relaxed">
            MISSION CONTROL IS MISSING
          </p>
          <p className="font-retro text-mario-coin text-[9px] mt-3">
            NEXT_PUBLIC_CONVEX_URL
          </p>
        </div>
        <p className="font-retro text-white/40 text-[7px] mt-4 animate-blink">
          PRESS START
        </p>
      </div>
    );
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
