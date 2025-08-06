"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// Handle missing environment variable during build
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.warn("NEXT_PUBLIC_CONVEX_URL is not set. Convex features will not work.");
}

const convex = new ConvexReactClient(convexUrl || "");

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convexUrl) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>Convex is not configured. Please set NEXT_PUBLIC_CONVEX_URL environment variable.</p>
        {children}
      </div>
    );
  }
  
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}