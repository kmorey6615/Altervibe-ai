"use client";

import { Heart, MessageCircle, Share2, Music, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface FeedItemProps {
  video: {
    userName: string;
    caption: string;
    hashtags: string[];
    videoUrl: string;
    likes: string;
    comments: string;
    shares: string;
    contentStyle?: string;
  };
}

export function FeedItem({ video }: FeedItemProps) {
  const router = useRouter();

  const handleUseTrend = () => {
    const style = video.contentStyle || "viral dance";
    router.push(`/create?style=${encodeURIComponent(style)}`);
  };

  return (
    <div className="tiktok-item bg-black flex flex-col justify-end">
      {/* Video Content Placeholder */}
      <div className="absolute inset-0 z-0">
        <Image
          src={video.videoUrl}
          alt="Video content"
          fill
          className="object-cover"
          priority
          data-ai-hint="vertical video"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
      </div>

      {/* Sidebar Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-5 z-10">
        <div className="flex flex-col items-center group cursor-pointer">
          <div className="w-12 h-12 bg-zinc-800/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:bg-primary transition-all">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold text-white mt-1 drop-shadow-md">{video.likes}</span>
        </div>
        
        <div className="flex flex-col items-center group cursor-pointer">
          <div className="w-12 h-12 bg-zinc-800/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:bg-zinc-700/60 transition-all">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold text-white mt-1 drop-shadow-md">{video.comments}</span>
        </div>

        <div className="flex flex-col items-center group cursor-pointer">
          <div className="w-12 h-12 bg-zinc-800/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 group-hover:bg-zinc-700/60 transition-all">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold text-white mt-1 drop-shadow-md">{video.shares}</span>
        </div>
      </div>

      {/* Bottom Info Area */}
      <div className="p-6 pb-28 relative z-10 w-full bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-md space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-primary bg-zinc-800 flex items-center justify-center font-bold text-xs">
              {video.userName[0].toUpperCase()}
            </div>
            <h3 className="font-bold text-base flex items-center gap-2">
              @{video.userName}
              <span className="bg-primary px-1.5 py-0.5 rounded text-[8px] uppercase tracking-tighter">Verified AI</span>
            </h3>
          </div>
          
          <p className="text-sm text-white/95 line-clamp-2 leading-relaxed font-medium">
            {video.caption}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {video.hashtags.map((tag) => (
              <span key={tag} className="text-xs font-bold text-accent">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-[10px] text-white/60 overflow-hidden max-w-[150px]">
              <Music className="w-3 h-3 animate-spin-slow" />
              <div className="whitespace-nowrap italic">
                Original Sound - {video.userName}
              </div>
            </div>

            <Button 
              onClick={handleUseTrend}
              size="sm" 
              className="bg-white text-black hover:bg-primary hover:text-white font-black text-[10px] uppercase h-8 px-4 rounded-full"
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              Use This Trend
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
