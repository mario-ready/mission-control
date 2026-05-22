"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

const typeLabels: Record<string, string> = {
  "gtm-brief": "GTM Brief",
  "research-signal": "Research",
  "slack-alert": "Signal",
  "post-sent": "Post",
  "campaign-sent": "Campaign",
};

function TypeBadge({ type }: { type: string }) {
  const label = typeLabels[type] ?? type;
  return (
    <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
      {label}
    </span>
  );
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Home() {
  const activities = useQuery(api.functions.listActivities);

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Mission Control</h1>
        <p className="text-sm text-zinc-500 mt-1">Ready team activity feed</p>
      </header>

      {activities === undefined ? (
        <div className="flex items-center justify-center py-16 text-zinc-400">
          Loading...
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
          <p className="text-lg">No activity yet</p>
          <p className="text-sm mt-1">Mario is warming up — check back soon 🤌</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li
              key={activity._id}
              className="flex flex-col gap-1 rounded-lg border border-zinc-200 p-4 bg-white"
            >
              <div className="flex items-center gap-2">
                <TypeBadge type={activity.type} />
                <span className="text-xs text-zinc-400">
                  {timeAgo(activity.timestamp)}
                </span>
                <span className="text-xs text-zinc-400">·</span>
                <span className="text-xs text-zinc-400">{activity.agent}</span>
              </div>
              <p className="text-sm text-zinc-800">{activity.description}</p>
              {activity.url && (
                <Link
                  href={activity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-600 hover:text-orange-700 hover:underline mt-1"
                >
                  View →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}