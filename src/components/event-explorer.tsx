"use client";

import { useMemo, useState, useTransition } from "react";
import { EventCard } from "@/components/event-card";
import { type WorldEvent } from "@/lib/types";

interface EventExplorerProps {
  initialEvents: WorldEvent[];
}

type SourceFilter = "all" | "reddit" | "wikimedia" | "aljazeera";

export function EventExplorer({ initialEvents }: EventExplorerProps) {
  const [events, setEvents] = useState(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [status, setStatus] = useState<string | null>(buildStatus(initialEvents));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSource = source === "all" || event.source === source;

      const matchesSearch =
        term.length === 0 ||
        event.title.toLowerCase().includes(term) ||
        event.summary.toLowerCase().includes(term) ||
        event.tags.some((tag) => tag.toLowerCase().includes(term));

      return matchesSource && matchesSearch;
    });
  }, [events, searchTerm, source]);

  const lastUpdated = status ?? "Waiting for updates...";

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        setError(null);
        const response = await fetch("/api/events", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to refresh global events.");
        }

        const payload = (await response.json()) as { events: WorldEvent[] };
        setEvents(payload.events);
        setStatus(buildStatus(payload.events));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred.");
      }
    });
  };

  return (
    <>
      <div className="toolbar">
        <input
          aria-label="Search world events"
          placeholder="Search events, locations, or topics..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <select
          aria-label="Filter by source"
          value={source}
          onChange={(event) => setSource(event.target.value as SourceFilter)}
        >
          <option value="all">All sources</option>
          <option value="reddit">Reddit r/worldnews</option>
          <option value="wikimedia">Wikimedia Featured</option>
          <option value="aljazeera">Al Jazeera</option>
        </select>
        <button
          type="button"
          className="refresh-button"
          onClick={handleRefresh}
          disabled={isPending}
        >
          {isPending ? "Refreshing…" : "Refresh Feed"}
        </button>
      </div>

      <div className="status-strip">
        <span>🛰️</span>
        <span>{lastUpdated}</span>
      </div>

      {error ? <div className="error-state">{error}</div> : null}

      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          Nothing matches your filters right now. Try adjusting the source or search
          query.
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </>
  );
}

function buildStatus(events: WorldEvent[]): string | null {
  if (!events.length) {
    return null;
  }

  const newest = events.reduce((latest, current) => {
    return new Date(current.publishedAt).getTime() > new Date(latest.publishedAt).getTime()
      ? current
      : latest;
  }, events[0]);

  return `Latest update: ${new Date(newest.publishedAt).toLocaleString()}`;
}
