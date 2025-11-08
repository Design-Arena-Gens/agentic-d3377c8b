import { NextResponse } from "next/server";
import { fetchWorldEvents } from "@/lib/events";

export const revalidate = 300;
export const runtime = "nodejs";

export async function GET() {
  try {
    const events = await fetchWorldEvents();
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json(
      {
        events: [],
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error while gathering events."
      },
      { status: 500 }
    );
  }
}
