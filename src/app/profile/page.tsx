
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, LogOut, Grid, Bookmark, Users, Loader2, Video, ImageIcon, ArrowLeft, Plus } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, where } from "firebase/firestore";

type Character = {
  id: string;
  name: string;
  imageUrl: string;
  personality: string;
  visualDescription: string;
  catchphrase: string;
  aesthetic: string;
};

type Post = {
  id: string;
  type: "video" | "photo";
  mediaUrls: string[];
  caption: string;
  hashtags: string[];
  characterName: string;
  createdAt: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"models" | "videos" | "photos">("models");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewedCharacter, setViewedCharacter] = useState<Character | null>(null);

  useEffect(() => {
    // Listen for characters
    const charQ = query(collection(db, "characters"), orderBy("createdAt", "desc"));
    const unsubChar = onSnapshot(charQ, (snapshot) => {
      setCharacters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Character)));
    });

    // Listen for posts
    const postQ = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubPost = onSnapshot(postQ, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
      setLoading(false);
    });

    return () => {
      unsubChar();
      unsubPost();
    };
  }, []);

  const filteredPosts = posts.filter(p => 
    activeTab === "videos" ? p.type === "video" : p.type === "photo"
  );

  const renderCharacterDetail = () => {
    if (!viewedCharacter) return null;

    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
        <Button 
          variant="ghost" 
          onClick={() => setViewedCharacter(null)}
          className="text-zinc-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        <div className="aspect-[4/5] relative rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl">
          <Image src={viewedCharacter.imageUrl} alt={viewedCharacter.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 space-y-2">
            <h2 className="text-4xl font-black uppercase italic drop-shadow-2xl">{viewedCharacter.name}</h2>
            <p className="text-primary font-bold tracking-widest uppercase text-sm">"{viewedCharacter.catchphrase}"</p>
          </div>
        </div>

        <Card className="bg-zinc-900 border-white/5 shadow-xl">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Bio & Personality</p>
              <p className="text-zinc-300 italic leading-relaxed">{viewedCharacter.personality}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Visual Aesthetic</p>
              <p className="text-zinc-400 text-sm leading-relaxed">{viewedCharacter.visualDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button 
                onClick={() => router.push(`/create?charId=${viewedCharacter.id}&type=video`)}
                className="bg-primary hover:bg-primary/80 font-black h-14 uppercase italic"
              >
                <Video className="w-5 h-5 mr-2" />
                New Video
              </Button>
              <Button 
                onClick={() => router.push(`/create?charId=${viewedCharacter.id}&type=photo`)}
                className="bg-accent text-black hover:bg-accent/80 font-black h-14 uppercase italic"
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                New Photo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-black pb-24">
      {/* Cover Image */}
      <div className="relative h-48 w-full">
        <Image 
          src="https://picsum.photos/seed/cover/1200/400" 
          alt="Profile cover" 
          fill 
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-12 relative z-10 space-y-8">
        {!viewedCharacter ? (
          <>
            <header className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden bg-zinc-800 shadow-2xl relative">
                <Image 
                  src="https://picsum.photos/seed/user/200/200" 
                  alt="User avatar" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Digital Architect</h1>
                <p className="text-muted-foreground text-sm font-medium">AI Influencer Creator • {characters.length} Models</p>
              </div>
              <div className="flex gap-4">
                <Button size="sm" variant="outline" className="bg-black border-white/10 rounded-full h-10 px-6">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button size="sm" variant="destructive" className="rounded-full h-10 px-6">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </header>

            <div className="grid grid-cols-3 border-y border-white/5 py-8">
              <div className="text-center">
                <p className="text-2xl font-black text-white italic">{posts.length}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Creations</p>
              </div>
              <div className="text-center border-x border-white/5">
                <p className="text-2xl font-black text-white italic">{characters.length}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Models</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-white italic">12.4K</p>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Impact</p>
              </div>
            </div>

            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex gap-8">
                  <button 
                    onClick={() => setActiveTab("models")}
                    className={`pb-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'models' ? 'text-primary border-b-2 border-primary' : 'text-zinc-600'}`}
                  >
                    <Grid className="w-4 h-4" />
                    Models
                  </button>
                  <button 
                    onClick={() => setActiveTab("videos")}
                    className={`pb-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'videos' ? 'text-primary border-b-2 border-primary' : 'text-zinc-600'}`}
                  >
                    <Video className="w-4 h-4" />
                    Videos
                  </button>
                  <button 
                    onClick={() => setActiveTab("photos")}
                    className={`pb-3 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'photos' ? 'text-primary border-b-2 border-primary' : 'text-zinc-600'}`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Photos
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-primary animate-pulse">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Syncing with Cloud...</p>
                </div>
              ) : activeTab === "models" ? (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {characters.map((char) => (
                    <Card 
                      key={char.id} 
                      className="bg-zinc-900 border-none overflow-hidden group cursor-pointer relative"
                      onClick={() => setViewedCharacter(char)}
                    >
                      <div className="aspect-[3/4] relative">
                        <Image 
                          src={char.imageUrl} 
                          alt={char.name} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-4 flex flex-col justify-end">
                          <p className="font-black text-lg drop-shadow-xl italic uppercase tracking-tighter">{char.name}</p>
                          <p className="text-[9px] text-accent font-black uppercase drop-shadow-md tracking-widest">{char.aesthetic}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <button 
                    onClick={() => router.push("/create")}
                    className="aspect-[3/4] border-2 border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-3 text-zinc-700 hover:text-primary hover:border-primary transition-all group"
                  >
                    <Plus className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">New Model</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                      <Card key={post.id} className="bg-zinc-900 border-none overflow-hidden group relative">
                        <div className="aspect-[3/4] relative">
                          <Image 
                            src={post.mediaUrls[0]} 
                            alt="Post content" 
                            fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-[9px] font-black text-white/90 uppercase truncate">{post.characterName}</p>
                          </div>
                          {post.type === "video" && (
                            <div className="absolute top-3 right-3">
                              <Video className="w-4 h-4 text-white drop-shadow-lg" />
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                      <Bookmark className="w-12 h-12 text-zinc-900 mx-auto mb-4" />
                      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">No {activeTab} yet</p>
                      <Button 
                        variant="link" 
                        className="text-primary font-black uppercase italic text-xs mt-2"
                        onClick={() => router.push('/create')}
                      >
                        Start Creating
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        ) : (
          renderCharacterDetail()
        )}
      </div>
      <Navigation />
    </main>
  );
}
