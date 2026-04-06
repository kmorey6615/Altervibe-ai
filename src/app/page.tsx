
"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { FeedItem } from "@/components/feed-item";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou");

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(fetchedPosts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // For prototype purposes, we simulate "Following" by filtering for specific creators 
  // or simply showing a randomized subset if no follows exist yet.
  // In a real app, this would query a "follows" collection.
  const displayPosts = activeTab === "following" 
    ? posts.filter((_, index) => index % 2 === 0) // Simulating a filtered following feed
    : posts;

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
      {/* Top Navigation Tabs */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-center items-center h-16 bg-gradient-to-b from-black/60 to-transparent pt-4">
        <div className="flex gap-6 items-center">
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
        {activeTab === "foryou" && (
          <div className="absolute bottom-2 w-8 h-1 bg-primary rounded-full transition-all duration-300 translate-x-[42px]" />
        )}
        {activeTab === "following" && (
          <div className="absolute bottom-2 w-8 h-1 bg-primary rounded-full transition-all duration-300 -translate-x-[42px]" />
        )}
      </div>

      <div className="tiktok-feed h-full w-full bg-black">
        {displayPosts.length > 0 ? (
          displayPosts.map((post) => (
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
                {activeTab === "following" ? "No Follows Yet" : "The Feed is Empty"}
              </h2>
              <p className="text-zinc-500 text-sm max-w-[250px] mx-auto">
                {activeTab === "following" 
                  ? "Explore the 'For You' page and follow some creators to see them here!" 
                  : "Be the first architect! Head to the Studio and bring your first AI influencer to life."}
              </p>
            </div>
          </div>
        )}
      </div>
      <Navigation />
    </main>
  );
}
