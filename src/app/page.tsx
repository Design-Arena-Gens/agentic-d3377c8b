import { EventExplorer } from "@/components/event-explorer";
import { fetchWorldEvents } from "@/lib/events";

export const revalidate = 300;
export const runtime = "nodejs";

export default async function HomePage() {
  const events = await fetchWorldEvents();

  return (
    <div className="app-shell">
      <header className="hero">
        <h1>World Event Agent</h1>
        <p>
          A constantly updating intelligence layer that distills key developments from
          multiple global sources. Track geopolitical shifts, humanitarian updates, and
          live headlines in a single, unified feed.
        </p>
      </header>
      <EventExplorer initialEvents={events} />
    </div>
  );
}
