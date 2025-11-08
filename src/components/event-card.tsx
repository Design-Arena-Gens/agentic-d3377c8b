import Link from "next/link";
import { type WorldEvent } from "@/lib/types";

interface EventCardProps {
  event: WorldEvent;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="event-card">
      <div className="event-card__source">
        <span aria-hidden="true">🌐</span>
        <span>{event.sourceName}</span>
      </div>
      <h3 className="event-card__title">{event.title}</h3>
      <p className="event-card__summary">{event.summary}</p>
      <div className="event-card__tags">
        {event.tags.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <footer className="event-card__footer">
        <time dateTime={event.publishedAt}>{formatRelative(event.publishedAt)}</time>
        <Link href={event.url} target="_blank" rel="noreferrer">
          Read source ↗
        </Link>
      </footer>
    </article>
  );
}

function formatRelative(date: string): string {
  const input = new Date(date);
  if (Number.isNaN(input.getTime())) {
    return "Recently";
  }

  const diff = Date.now() - input.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return input.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
