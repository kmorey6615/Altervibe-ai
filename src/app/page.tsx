
"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/navigation";
import { FeedItem } from "@/components/feed-item";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { Loader2, Sparkles } from "lucide-react";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="tiktok-feed h-full w-full bg-black">
        {posts.length > 0 ? (
          posts.map((post) => (
            <FeedItem key={post.id} video={{
              id: post.id,
              userName: post.characterName || post.productName || "Anonymous",
              caption: post.caption,
              hashtags: post.hashtags || [],
              videoUrl: post.mediaUrls?.[0] || "https://picsum.photos/seed/fallback/1080/1920",
              likes: "0", // Placeholder for actual counters
              comments: "0",
              shares: "0",
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
              <h2 className="text-2xl font-black uppercase italic">The Feed is Empty</h2>
              <p className="text-zinc-500 text-sm max-w-[250px] mx-auto">Be the first architect! Head to the Studio and bring your first AI influencer to life.</p>
            </div>
          </div>
        )}
      </div>
      <Navigation />
    </main>
  );
}
