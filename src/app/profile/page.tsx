
"use client";

import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, LogOut, Grid, Bookmark, Users } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
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
            <p className="text-muted-foreground text-sm">AI Influencer Creator • 24 Creations</p>
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
            <p className="text-xl font-black">8</p>
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
              <button className="text-primary pb-2 border-b-2 border-primary font-bold flex items-center gap-2">
                <Grid className="w-4 h-4" />
                Models
              </button>
              <button className="text-muted-foreground pb-2 flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Saved
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-zinc-900 border-white/5 overflow-hidden group cursor-pointer">
                <div className="aspect-[3/4] relative">
                  <Image 
                    src={`https://picsum.photos/seed/char${i}/400/600`} 
                    alt="Character" 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end">
                    <p className="font-black text-lg">AI Model {i}</p>
                    <p className="text-[10px] text-accent font-bold uppercase">Fashion Tech</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
      <Navigation />
    </main>
  );
}
