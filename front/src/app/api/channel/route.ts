import { NextResponse } from "next/server";

const API_KEY = process.env.YOUTUBE_API_KEY;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = url.searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${username}&key=${API_KEY}`;

  try {
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error("Network response was not ok");
    }
    const searchData = await searchResponse.json();

    if (searchData.items && searchData.items.length > 0) {
      const channelId = searchData.items[0].id.channelId;
      const detailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${channelId}&key=${API_KEY}`;
      const detailsResponse = await fetch(detailsUrl);
      if (!detailsResponse.ok) {
        throw new Error("Network response was not ok");
      }
      const detailsData = await detailsResponse.json();

      const channelInfo = detailsData.items[0];
      const description = channelInfo.snippet.description;

      // ソーシャルリンクを抽出するための簡単な正規表現
      const twitterLink = description.match(/twitter\.com\/[^\s]+/)?.[0];
      const twitchLink = description.match(/twitch\.tv\/[^\s]+/)?.[0];
      const tiktokLink = description.match(/tiktok\.com\/[^\s]+/)?.[0];

      const result = {
        id: channelInfo.id,
        title: channelInfo.snippet.title,
        description: channelInfo.snippet.description,
        thumbnails: channelInfo.snippet.thumbnails,
        subscriberCount: channelInfo.statistics.subscriberCount,
        viewCount: channelInfo.statistics.viewCount,
        videoCount: channelInfo.statistics.videoCount,
        twitter: twitterLink || null,
        twitch: twitchLink || null,
        tiktok: tiktokLink || null,
      };

      return NextResponse.json(result, {
        headers: {
          "Cache-Control": "public, s-maxage=600, stale-while-revalidate=59",
        },
      });
    } else {
      return NextResponse.json({ error: "No channels found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
