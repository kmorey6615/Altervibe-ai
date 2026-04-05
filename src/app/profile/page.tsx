
"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, LogOut, Grid, Bookmark, Users, Loader2 } from "lucide-react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"models" | "saved">("models");
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "characters"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCharacters(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-black pb-24">
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
        <header className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden bg-zinc-800">
            <Image 
              src="https://picsum.photos/seed/user/200/200" 
              alt="User avatar" 
              width={128} 
              height={128} 
              className="object-cover"
            />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-white">DigitalArchitect</h1>
            <p className="text-muted-foreground text-sm">AI Influencer Creator • {characters.length} Creations</p>
          </div>
          <div className="flex gap-4">
            <Button size="sm" variant="outline" className="bg-black border-white/10">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button size="sm" variant="destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-3 border-y border-white/5 py-6">
          <div className="text-center">
            <p className="text-xl font-black">24</p>
            <p className="text-[10px] text-muted-foreground uppercase">Videos</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black">{characters.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Models</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-black">15.2K</p>
            <p className="text-[10px] text-muted-foreground uppercase">Total Reach</p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex gap-6">
              <button 
                onClick={() => setActiveTab("models")}
                className={`pb-2 font-bold flex items-center gap-2 transition-all ${activeTab === 'models' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
              >
                <Grid className="w-4 h-4" />
                Models
              </button>
              <button 
                onClick={() => setActiveTab("saved")}
                className={`pb-2 font-bold flex items-center gap-2 transition-all ${activeTab === 'saved' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
              >
                <Bookmark className="w-4 h-4" />
                Saved
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-primary animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading Creations...</p>
            </div>
          ) : activeTab === "models" ? (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {characters.length > 0 ? (
                characters.map((char) => (
                  <Card key={char.id} className="bg-zinc-900 border-white/5 overflow-hidden group cursor-pointer">
                    <div className="aspect-[3/4] relative">
                      <Image 
                        src={char.imageUrl} 
                        alt={char.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                        <p className="font-black text-lg drop-shadow-lg">{char.name}</p>
                        <p className="text-[10px] text-accent font-bold uppercase drop-shadow-md">{char.aesthetic || "AI Model"}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 py-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                  <p className="text-muted-foreground text-sm italic">No characters in your roster yet.</p>
                  <Button variant="link" className="text-primary font-bold mt-2" onClick={() => window.location.href='/create'}>
                    Create Your First AI Model
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl animate-in fade-in duration-500">
              <Bookmark className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm italic">No saved posts yet.</p>
            </div>
          )}
        </section>
      </div>
      <Navigation />
    </main>
  );
}
