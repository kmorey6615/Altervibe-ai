
"use client";

import { Heart, MessageCircle, Share2, Music } from "lucide-react";
import Image from "next/image";

interface FeedItemProps {
  video: {
    userName: string;
    caption: string;
    hashtags: string[];
    videoUrl: string;
    likes: string;
    comments: string;
    shares: string;
  };
}

export function FeedItem({ video }: FeedItemProps) {
  return (
    <div className="tiktok-item bg-zinc-900 flex flex-col justify-end">
      {/* Video Content Placeholder */}
      <div className="absolute inset-0 z-0">
        <Image
          src={video.videoUrl}
          alt="Video content"
          fill
          className="object-cover opacity-80"
          priority
          data-ai-hint="vertical video"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
      </div>

      {/* Sidebar Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-10">
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold text-white shadow-sm">{video.likes}</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold text-white shadow-sm">{video.comments}</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-primary transition-colors">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-bold text-white shadow-sm">{video.shares}</span>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="p-6 pb-28 relative z-10 w-full max-w-lg">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          @{video.userName}
          <span className="px-2 py-0.5 bg-primary text-[10px] rounded-full uppercase tracking-wider">AI Character</span>
        </h3>
        <p className="text-sm text-white/90 mb-3 leading-relaxed">
          {video.caption}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {video.hashtags.map((tag) => (
            <span key={tag} className="text-sm font-semibold text-accent">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs text-white/70 overflow-hidden">
          <Music className="w-3 h-3 animate-pulse" />
          <div className="whitespace-nowrap animate-marquee">
            Original Sound - AlterVibe AI Studio • {video.userName} Mix
          </div>
        </div>
      </div>
    </div>
  );
}
