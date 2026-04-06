"use client";

import { useEffect, useState, useMemo } from "react";
import { Navigation } from "@/components/navigation";
import { FeedItem } from "@/components/feed-item";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { Loader2, Sparkles, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou");
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useEffect(() => {
    // Listen for all posts
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(fetchedPosts);
      setLoading(false);
    });

    // Listen for followed creators
    const followsQ = query(collection(db, "follows"));
    const unsubscribeFollows = onSnapshot(followsQ, (snapshot) => {
      const follows = snapshot.docs.map(doc => doc.data().creatorName);
      setFollowedCreators(follows);
    });

    return () => {
      unsubscribePosts();
      unsubscribeFollows();
    };
  }, []);

  // Complex filtering logic for Tab + Search
  const filteredPosts = useMemo(() => {
    let result = posts;

    // 1. Tab Filtering
    if (activeTab === "following") {
      result = result.filter(post => followedCreators.includes(post.characterName || post.productName));
    }

    // 2. Search Filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(post => {
        const nameMatch = (post.characterName || post.productName || "").toLowerCase().includes(q);
        const hashtagMatch = (post.hashtags || []).some((tag: string) => tag.toLowerCase().includes(q));
        const captionMatch = (post.caption || "").toLowerCase().includes(q);
        return nameMatch || hashtagMatch || captionMatch;
      });
    }

    return result;
  }, [posts, activeTab, followedCreators, searchQuery]);

  if (loading) {
    return (
      <main className="h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Synchronizing Feed...</p>
      </main>
    );
  }

  return (
    <main className="relative h-screen bg-black overflow-hidden">
      {/* Top Navigation & Search Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex flex-col items-center bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-4 pb-6 px-4 gap-4">
        <div className="flex w-full max-w-md items-center justify-between">
          <div className="flex gap-6 items-center flex-1 justify-center ml-10">
            <button 
              onClick={() => setActiveTab("following")}
              className={cn(
                "text-sm font-bold transition-all duration-200 uppercase tracking-tighter italic",
                activeTab === "following" ? "text-white scale-110" : "text-white/40 hover:text-white/70"
              )}
            >
              Following
            </button>
            <div className="w-[1px] h-3 bg-white/20" />
            <button 
              onClick={() => setActiveTab("foryou")}
              className={cn(
                "text-sm font-bold transition-all duration-200 uppercase tracking-tighter italic",
                activeTab === "foryou" ? "text-white scale-110" : "text-white/40 hover:text-white/70"
              )}
            >
              For You
            </button>
          </div>
          
          <button 
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white transition-colors"
          >
            {isSearchVisible ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>
        </div>

        {/* Animated Search Bar */}
        {isSearchVisible && (
          <div className="w-full max-w-md animate-in slide-in-from-top-4 duration-300">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input 
                placeholder="Search users, hashtags, products..."
                className="bg-black/60 border-white/10 pl-10 h-11 rounded-xl focus:ring-primary/50 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Tab Indicator */}
        {!isSearchVisible && (
          <div className="relative w-full flex justify-center mt-[-8px]">
             {activeTab === "foryou" && (
              <div className="w-8 h-1 bg-primary rounded-full transition-all duration-300 translate-x-[42px]" />
            )}
            {activeTab === "following" && (
              <div className="w-8 h-1 bg-primary rounded-full transition-all duration-300 -translate-x-[42px]" />
            )}
          </div>
        )}
      </div>

      <div className="tiktok-feed h-full w-full bg-black">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <FeedItem key={post.id} video={{
              id: post.id,
              userName: post.characterName || post.productName || "Anonymous",
              caption: post.caption,
              hashtags: post.hashtags || [],
              videoUrl: post.mediaUrls?.[0] || "https://picsum.photos/seed/fallback/1080/1920",
              likes: "1.2K", 
              comments: "234",
              shares: "89",
              type: post.type,
              isProduct: post.isProduct,
              characterId: post.characterId
            }} />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase italic">
                {searchQuery ? "No Results Found" : activeTab === "following" ? "No Follows Yet" : "The Feed is Empty"}
              </h2>
              <p className="text-zinc-500 text-sm max-w-[250px] mx-auto">
                {searchQuery 
                  ? `We couldn't find anything matching "${searchQuery}". Try a different keyword.`
                  : activeTab === "following" 
                    ? "Explore the 'For You' page and follow some creators to see them here!" 
                    : "Be the first architect! Head to the Studio and bring your first AI influencer to life."}
              </p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-primary font-bold text-xs uppercase tracking-widest mt-4 hover:underline"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <Navigation />
    </main>
  );
}