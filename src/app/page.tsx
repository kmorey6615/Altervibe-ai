"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { FeedItem } from "@/components/feed-item";

const MOCK_VIDEOS = [
  {
    id: "v1",
    userName: "cyber_nova",
    caption: "Getting ready for the virtual concert tonight! ✨ My custom neon fit is finally rendered and ready for the stage.",
    hashtags: ["#CyberPop", "#AIVibe", "#NextGen"],
    videoUrl: "https://picsum.photos/seed/cyber1/1080/1920",
    likes: "12.4K",
    comments: "842",
    shares: "1.2K",
    contentStyle: "aesthetic"
  },
  {
    id: "v2",
    userName: "vintage_vogue",
    caption: "Throwback to the 1950s digital archive. Style never fades, even when it's generated in 4K. 🎞️",
    hashtags: ["#VintageAI", "#ClassicStyle", "#RetroVibe"],
    videoUrl: "https://picsum.photos/seed/retro1/1080/1920",
    likes: "8.9K",
    comments: "312",
    shares: "542",
    contentStyle: "POV"
  },
  {
    id: "v3",
    userName: "pixel_dancer",
    caption: "New routine just dropped! What do we think of these physics? 💃 Rendering this took 4 hours but the motion is smooth.",
    hashtags: ["#AIDance", "#Viral", "#Motion"],
    videoUrl: "https://picsum.photos/seed/dance1/1080/1920",
    likes: "45.1K",
    comments: "2.1K",
    shares: "12K",
    contentStyle: "viral dance"
  }
];

export default function Home() {
  return (
    <main className="relative h-screen bg-black overflow-hidden">
      <div className="tiktok-feed h-full w-full bg-black">
        {MOCK_VIDEOS.map((video) => (
          <FeedItem key={video.id} video={video} />
        ))}
      </div>
      <Navigation />
    </main>
  );
}
