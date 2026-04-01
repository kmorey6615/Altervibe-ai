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
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/95" />
      </div>

      {/* Sidebar Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-10">
        <div className="flex flex-col items-center group cursor-pointer">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 group-hover:bg-primary transition-all shadow-xl">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold text-white mt-1 drop-shadow-lg">{video.likes}</span>
        </div>
        
        <div className="flex flex-col items-center group cursor-pointer">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all shadow-xl">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold text-white mt-1 drop-shadow-lg">{video.comments}</span>
        </div>

        <div className="flex flex-col items-center group cursor-pointer">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all shadow-xl">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-bold text-white mt-1 drop-shadow-lg">{video.shares}</span>
        </div>
      </div>

      {/* Bottom Info Area */}
      <div className="p-6 pb-28 relative z-10 w-full">
        <div className="max-w-md space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full border-2 border-primary bg-zinc-800 flex items-center justify-center font-bold text-xs overflow-hidden relative shadow-lg shadow-primary/20">
               <Image 
                src={`https://picsum.photos/seed/${video.userName}/100/100`}
                alt={video.userName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold text-base flex items-center gap-2 drop-shadow-xl text-white">
                @{video.userName}
                <span className="bg-primary px-1.5 py-0.5 rounded text-[8px] uppercase tracking-tighter font-black shadow-sm">Verified AI</span>
              </h3>
              <p className="text-[10px] text-primary-foreground/80 font-bold uppercase tracking-widest">{video.contentStyle || "Trending"}</p>
            </div>
          </div>
          
          <p className="text-sm text-white/95 line-clamp-2 leading-relaxed font-semibold drop-shadow-lg">
            {video.caption}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {video.hashtags.map((tag) => (
              <span key={tag} className="text-xs font-bold text-accent drop-shadow-lg hover:scale-105 transition-transform cursor-pointer">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-[11px] text-white/70 overflow-hidden max-w-[160px] bg-black/40 backdrop-blur-md py-1 px-3 rounded-full border border-white/10">
              <Music className="w-3 h-3 animate-spin-slow text-primary" />
              <div className="whitespace-nowrap italic truncate font-medium">
                Original Sound - {video.userName}
              </div>
            </div>

            <Button 
              onClick={handleUseTrend}
              size="sm" 
              className="bg-white text-black hover:bg-primary hover:text-white font-black text-[10px] uppercase h-9 px-5 rounded-full shadow-2xl transition-all active:scale-95 group"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 group-hover:rotate-12 transition-transform" />
              Use This Trend
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
