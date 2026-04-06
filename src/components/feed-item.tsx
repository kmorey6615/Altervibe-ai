
"use client";

import { useState } from "react";
import { Heart, MessageCircle, Share2, Music, Sparkles, Bookmark, Plus, Check } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FeedItemProps {
  video: {
    id: string;
    userName: string;
    caption: string;
    hashtags: string[];
    videoUrl: string;
    likes: string;
    comments: string;
    shares: string;
    contentStyle?: string;
    type?: "video" | "photo";
    isProduct?: boolean;
    characterId?: string;
  };
}

export function FeedItem({ video }: FeedItemProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleUseTrend = () => {
    const style = video.contentStyle || "viral style";
    const path = video.characterId 
      ? `/create?charId=${video.characterId}&style=${encodeURIComponent(style)}`
      : `/create?style=${encodeURIComponent(style)}`;
    router.push(path);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) toast({ title: "Liked!", description: `Added to ${video.userName}'s impact.` });
  };

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({ 
      title: isFavorited ? "Removed" : "Favorited!", 
      description: isFavorited ? "Removed from your collection." : "Saved to your favorites tab." 
    });
  };

  const toggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    toast({ 
      title: isFollowing ? "Unfollowed" : "Following!", 
      description: isFollowing ? `You stopped following ${video.userName}` : `You're now following ${video.userName}'s journey.` 
    });
  };

  const viewProfile = () => {
    // If it's a character, we go to its detail view. In a real app, this would be a user profile.
    if (video.characterId) {
      router.push(`/profile?charId=${video.characterId}`);
    } else {
      router.push('/profile');
    }
  };

  return (
    <div className="tiktok-item bg-black">
      {/* Phone-sized Container */}
      <div className="relative aspect-[9/16] h-full max-h-[800px] w-full max-w-[450px] bg-zinc-900 rounded-[2.5rem] overflow-hidden border-[8px] border-zinc-800 shadow-2xl flex flex-col justify-end">
        
        {/* Media Content */}
        <div className="absolute inset-0 z-0 bg-zinc-950">
          {video.type === "video" ? (
            <video 
              src={video.videoUrl} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover" 
            />
          ) : (
            <Image
              src={video.videoUrl}
              alt="Content"
              fill
              className="object-cover"
              priority
              data-ai-hint="vertical creation"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />
        </div>

        {/* Sidebar Actions */}
        <div className="absolute right-4 bottom-32 flex flex-col gap-5 z-10">
          {/* Avatar with Follow Toggle */}
          <div className="relative mb-2">
            <div 
              onClick={viewProfile}
              className="w-12 h-12 rounded-full border-2 border-white bg-zinc-800 flex items-center justify-center overflow-hidden relative shadow-xl cursor-pointer"
            >
               <Image 
                src={`https://picsum.photos/seed/${video.userName}/100/100`}
                alt={video.userName}
                fill
                className="object-cover"
              />
            </div>
            <button 
              onClick={toggleFollow}
              className={cn(
                "absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all shadow-lg",
                isFollowing ? "bg-green-500 scale-90" : "bg-primary scale-100"
              )}
            >
              {isFollowing ? <Check className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3 text-white" />}
            </button>
          </div>

          <div className="flex flex-col items-center group cursor-pointer" onClick={toggleLike}>
            <div className={cn(
              "w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 transition-all shadow-xl",
              isLiked ? "bg-red-500 border-red-400" : "hover:bg-primary"
            )}>
              <Heart className={cn("w-5 h-5", isLiked ? "fill-white text-white" : "text-white")} />
            </div>
            <span className="text-[10px] font-bold text-white mt-1 drop-shadow-lg">{video.likes}</span>
          </div>
          
          <div className="flex flex-col items-center group cursor-pointer">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all shadow-xl">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold text-white mt-1 drop-shadow-lg">{video.comments}</span>
          </div>

          <div className="flex flex-col items-center group cursor-pointer" onClick={toggleFavorite}>
            <div className={cn(
              "w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 transition-all shadow-xl",
              isFavorited ? "bg-accent border-accent text-black" : "hover:bg-accent"
            )}>
              <Bookmark className={cn("w-5 h-5", isFavorited ? "fill-current" : "text-white")} />
            </div>
            <span className="text-[10px] font-bold text-white mt-1 drop-shadow-lg">Save</span>
          </div>

          <div className="flex flex-col items-center group cursor-pointer">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all shadow-xl">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-bold text-white mt-1 drop-shadow-lg">{video.shares}</span>
          </div>
        </div>

        {/* Bottom Info Area */}
        <div className="p-6 relative z-10 w-full space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <h3 className="font-bold text-sm flex items-center gap-2 text-white cursor-pointer" onClick={viewProfile}>
                @{video.userName.replace(/\s+/g, '_').toLowerCase()}
                {video.isProduct ? (
                  <span className="bg-accent text-black px-1.5 py-0.5 rounded text-[7px] uppercase tracking-tighter font-black">PROMO</span>
                ) : (
                  <span className="bg-primary px-1.5 py-0.5 rounded text-[7px] uppercase tracking-tighter font-black text-white">AI</span>
                )}
              </h3>
              <p className="text-[9px] text-primary/90 font-bold uppercase tracking-widest">{video.contentStyle || "Trending"}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-white/95 line-clamp-2 leading-tight font-medium drop-shadow-lg">
              {video.caption}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {video.hashtags.map(tag => (
                <span key={tag} className="text-[10px] font-bold text-primary drop-shadow-sm">{tag}</span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-[10px] text-white/70 bg-black/40 backdrop-blur-md py-1 px-3 rounded-full border border-white/10 max-w-[140px]">
              <Music className="w-3 h-3 animate-spin-slow text-primary" />
              <div className="truncate italic font-medium">Original Sound</div>
            </div>

            <Button 
              onClick={handleUseTrend}
              size="sm" 
              className="bg-white text-black hover:bg-primary hover:text-white font-black text-[9px] uppercase h-8 px-4 rounded-full transition-all active:scale-95 shadow-xl"
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              Use Trend
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
