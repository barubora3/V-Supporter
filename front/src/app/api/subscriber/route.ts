import { NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
// がうるぐら
const CHANNEL_ID = "UCl69AEx4MdqMZH7Jtsm7Tig";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId") || CHANNEL_ID;

  const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch data from YouTube API");
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const subscriberCount = data.items[0].statistics.subscriberCount;

    return NextResponse.json({
      subscriberCount: parseInt(subscriberCount, 10),
    });
  } catch (error) {
    console.error("Error fetching subscriber count:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
