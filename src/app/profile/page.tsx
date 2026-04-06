
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Settings, 
  LogOut, 
  Grid, 
  Bookmark, 
  Users, 
  Loader2, 
  Video, 
  ImageIcon, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Download, 
  Share2, 
  Copy, 
  CheckCircle2,
  Send,
  Twitter,
  Facebook,
  Instagram
} from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, deleteDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

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
  characterId: string;
  createdAt: string;
};

const TikTokIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13-.08-.25-.17-.38-.25V14.5c.02 2.22-.73 4.48-2.3 6.08-1.58 1.61-3.9 2.39-6.13 2.14-2.22-.24-4.29-1.49-5.49-3.38-1.19-1.89-1.39-4.27-.55-6.27.83-2 2.64-3.51 4.74-4.04 1.25-.32 2.57-.3 3.82.04V13.3c-.76-.23-1.61-.25-2.38-.05-.77.2-1.44.69-1.9 1.35-.45.66-.55 1.48-.3 2.25.26.77.85 1.39 1.58 1.72.73.33 1.59.33 2.32.02.73-.31 1.28-.9 1.52-1.64.12-.37.16-.77.15-1.16V0h-.01z"/>
  </svg>
);

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"models" | "videos" | "photos">("models");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewedCharacter, setViewedCharacter] = useState<Character | null>(null);
  const [viewedPost, setViewedPost] = useState<Post | null>(null);

  useEffect(() => {
    const charQ = query(collection(db, "characters"), orderBy("createdAt", "desc"));
    const unsubChar = onSnapshot(charQ, (snapshot) => {
      setCharacters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Character)));
    });

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

  const handleDeleteCharacter = async (id: string) => {
    if (!confirm("Are you sure you want to delete this character? All their magic will be lost.")) return;
    try {
      await deleteDoc(doc(db, "characters", id));
      setViewedCharacter(null);
      toast({ title: "Character Deleted", description: "Successfully removed from your roster." });
    } catch (e) {
      toast({ variant: "destructive", title: "Delete Failed", description: "Cloud sync error." });
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this masterpiece? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "posts", id));
      setViewedPost(null);
      toast({ title: "Post Deleted", description: "Successfully removed from your feed." });
    } catch (e) {
      toast({ variant: "destructive", title: "Delete Failed", description: "Cloud sync error." });
    }
  };

  const copyCaption = (post: Post) => {
    navigator.clipboard.writeText(`${post.caption}\n\n${post.hashtags.join(" ")}`);
    toast({ title: "Caption copied!" });
  };

  const filteredPosts = posts.filter(p => 
    activeTab === "videos" ? p.type === "video" : p.type === "photo"
  );

  const renderCharacterDetail = () => {
    if (!viewedCharacter) return null;

    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setViewedCharacter(null)}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => handleDeleteCharacter(viewedCharacter.id)}
            className="rounded-full px-4 h-8 text-[10px] font-black uppercase tracking-widest"
          >
            <Trash2 className="w-3 h-3 mr-2" />
            De-activate
          </Button>
        </div>

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

  const renderPostDetail = () => {
    if (!viewedPost) return null;

    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setViewedPost(null)}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => handleDeletePost(viewedPost.id)}
            className="rounded-full px-4 h-8 text-[10px] font-black uppercase tracking-widest"
          >
            <Trash2 className="w-3 h-3 mr-2" />
            Delete Post
          </Button>
        </div>

        <div className={`relative ${viewedPost.type === 'video' ? 'aspect-[9/16]' : 'aspect-[4/5]'} w-full max-w-sm mx-auto`}>
          {viewedPost.type === 'video' ? (
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border-8 border-zinc-800 shadow-2xl bg-zinc-950">
              <video src={viewedPost.mediaUrls[0]} controls className="w-full h-full object-cover" />
            </div>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {viewedPost.mediaUrls.map((url, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border-4 border-primary shadow-2xl">
                      <Image src={url} alt={`Photo ${index + 1}`} fill className="object-cover" />
                      <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[12px] font-black italic shadow-lg text-white">
                        {index + 1} / {viewedPost.mediaUrls.length}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2 bg-black/60 border-none h-10 w-10 hover:bg-primary transition-all text-white" />
              <CarouselNext className="right-2 bg-black/60 border-none h-10 w-10 hover:bg-primary transition-all text-white" />
            </Carousel>
          )}
        </div>

        <Card className="bg-zinc-900 border-white/5 shadow-2xl">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">{viewedPost.characterName}'s Voice</p>
              <div className="p-4 bg-black rounded-xl border border-white/5 italic text-sm text-zinc-200 leading-relaxed">
                {viewedPost.caption}
                <div className="flex flex-wrap gap-2 mt-4">
                  {viewedPost.hashtags.map(h => (
                    <span key={h} className="px-3 py-1 rounded-full bg-primary/10 text-[11px] font-bold text-primary border border-primary/20">{h}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="border-white/10 bg-black h-12 rounded-xl text-white" onClick={() => copyCaption(viewedPost)}>
                <Copy className="w-4 h-4 mr-2" /> Copy Text
              </Button>
              <Button 
                variant="outline" 
                className="border-primary/20 bg-primary/5 text-primary h-12 rounded-xl"
                onClick={() => toast({ title: "Download Started", description: "Saving to your device gallery." })}
              >
                <Download className="w-4 h-4 mr-2" /> Save Media
              </Button>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-accent text-black hover:bg-accent/80 font-black h-14 uppercase italic rounded-xl">
                  <Share2 className="w-5 h-5 mr-2" /> Share to Socials
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase italic">Social Sync</DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Re-post {viewedPost.characterName}'s content to your connected accounts.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/5">
                    <div className="flex items-center gap-3">
                      <TikTokIcon />
                      <span className="font-bold">TikTok</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-[10px] font-black uppercase border-primary/40 text-primary">Post Now</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/5">
                    <div className="flex items-center gap-3">
                      <Instagram className="w-6 h-6 text-pink-500" />
                      <span className="font-bold">Instagram</span>
                    </div>
                    <Button size="sm" variant="outline" className="text-[10px] font-black uppercase border-primary/40 text-primary">Post Now</Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full bg-primary font-black uppercase italic h-12">
                    <Send className="w-4 h-4 mr-2" /> Sync All Platforms
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
        {!viewedCharacter && !viewedPost ? (
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
                      <Card 
                        key={post.id} 
                        className="bg-zinc-900 border-none overflow-hidden group relative cursor-pointer"
                        onClick={() => setViewedPost(post)}
                      >
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
        ) : viewedCharacter ? (
          renderCharacterDetail()
        ) : (
          renderPostDetail()
        )}
      </div>
      <Navigation />
    </main>
  );
}
