// app/api/live/route.ts
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get("channelId");

  if (!channelId) {
    return NextResponse.json(
      { error: "Channel ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await youtube.search.list({
      part: ["snippet"],
      channelId: channelId,
      type: ["video"],
      eventType: "live",
    });

    if (response.data.items && response.data.items.length > 0) {
      const liveStream = response.data.items[0];
      const videoId = liveStream.id?.videoId;

      // 追加の動画詳細を取得
      const videoDetails = await youtube.videos.list({
        part: ["snippet", "liveStreamingDetails", "statistics"],
        id: [videoId],
      });

      const videoInfo = videoDetails.data.items[0];

      return NextResponse.json({
        isLive: true,
        title: liveStream.snippet?.title,
        description: liveStream.snippet?.description,
        thumbnailUrl: liveStream.snippet?.thumbnails?.high?.url,
        channelTitle: liveStream.snippet?.channelTitle,
        videoId: videoId,
        viewCount: videoInfo?.statistics?.viewCount,
        likeCount: videoInfo?.statistics?.likeCount,
        startTime: videoInfo?.liveStreamingDetails?.actualStartTime,
      });
    } else {
      return NextResponse.json({ isLive: false });
    }
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
