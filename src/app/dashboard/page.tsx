
"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Users, 
  Video, 
  Sparkles, 
  ArrowUpRight, 
  Play,
  UserCircle2,
  Rocket,
  Zap,
  ChevronRight
} from "lucide-react";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";

const chartData = [
  { name: "Mon", views: 4200 },
  { name: "Tue", views: 5800 },
  { name: "Wed", views: 8900 },
  { name: "Thu", views: 7200 },
  { name: "Fri", views: 12400 },
  { name: "Sat", views: 15600 },
  { name: "Sun", views: 18200 },
];

const chartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--primary))",
  },
};

type Character = {
  id: string;
  name: string;
  imageUrl: string;
  aesthetic: string;
};

type TopPost = {
  id: string;
  caption: string;
  mediaUrls: string[];
  userName: string;
  views: string;
};

export default function DashboardPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [topPost, setTopPost] = useState<TopPost | null>(null);

  useEffect(() => {
    // Fetch characters for quick access
    const charQ = query(collection(db, "characters"), orderBy("createdAt", "desc"), limit(4));
    const unsubChar = onSnapshot(charQ, (snapshot) => {
      setCharacters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Character)));
    });

    // Mock top performing post or fetch from real data if available
    const postQ = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(1));
    const unsubPost = onSnapshot(postQ, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setTopPost({
          id: snapshot.docs[0].id,
          caption: data.caption,
          mediaUrls: data.mediaUrls,
          userName: data.characterName || "AI Model",
          views: "12.4K" // Mocked view count
        });
      }
    });

    return () => {
      unsubChar();
      unsubPost();
    };
  }, []);

  const stats = [
    { label: "Total Views", value: "84.2K", icon: Eye, color: "text-blue-400", trend: "+12%" },
    { label: "Followers", value: "2,410", icon: Users, color: "text-primary", trend: "+5.4%" },
    { label: "Created", value: "18", icon: Video, color: "text-zinc-400", trend: "+2" },
    { label: "Est. Earnings", value: "$420.50", icon: DollarSign, color: "text-accent", trend: "+18%" },
  ];

  return (
    <main className="min-h-screen bg-black pb-28 pt-8 px-4 overflow-y-auto">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Performance</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Monetization Hub</p>
          </div>
          <Badge variant="outline" className="border-primary/50 text-primary animate-pulse">
            Live Updates
          </Badge>
        </header>

        {/* Top Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-zinc-900/50 border-white/5 backdrop-blur-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-primary/10 transition-colors" />
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-[10px] font-black text-green-500 flex items-center">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-white italic tracking-tighter">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Growth Overview Chart */}
        <Card className="bg-zinc-900/50 border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black uppercase italic tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Growth Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  stroke="#525252" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="views" 
                  fill="var(--color-views)" 
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === chartData.length - 1 ? "hsl(var(--accent))" : "hsl(var(--primary))"} 
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Performing Content */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Top Content</h2>
          {topPost ? (
            <Card className="bg-zinc-900 border-white/5 overflow-hidden group">
              <div className="flex h-32">
                <div className="relative w-24 flex-shrink-0">
                  <Image 
                    src={topPost.mediaUrls[0]} 
                    alt="Thumbnail" 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-primary uppercase">{topPost.userName}</p>
                      <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {topPost.views}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 line-clamp-2 mt-1 italic">{topPost.caption}</p>
                  </div>
                  <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase text-accent justify-start" asChild>
                    <Link href="/profile">View Performance Details <ChevronRight className="w-3 h-3 ml-1" /></Link>
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="p-8 border-2 border-dashed border-white/5 rounded-xl text-center">
              <p className="text-[10px] font-bold text-zinc-600 uppercase">No data yet. Post to see analytics.</p>
            </div>
          )}
        </section>

        {/* Suggested Actions (AI-powered) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">AI Strategies</h2>
          </div>
          <div className="space-y-3">
            <Card className="bg-primary/10 border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer" onClick={() => router.push('/create')}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-white uppercase italic">Viral Trend Alert</p>
                  <p className="text-[10px] text-zinc-400">Cyberpunk aesthetics are peaking. Create a video with your lead model.</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </CardContent>
            </Card>
            <Card className="bg-accent/10 border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer" onClick={() => router.push('/profile')}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black">
                  <Rocket className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-white uppercase italic">Monetization Ready</p>
                  <p className="text-[10px] text-zinc-400">Your engagement is up 12%. Time to post a Product Studio promo.</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-accent" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* User's AI Characters */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Your Roster</h2>
            <Link href="/profile" className="text-[10px] font-black text-primary uppercase hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {characters.map((char) => (
              <Link key={char.id} href={`/create?charId=${char.id}`} className="group space-y-2">
                <div className="aspect-square relative rounded-full overflow-hidden border-2 border-white/5 group-hover:border-primary transition-all shadow-lg">
                  <Image src={char.imageUrl} alt={char.name} fill className="object-cover" />
                </div>
                <p className="text-[9px] font-black text-center text-white uppercase truncate px-1">{char.name}</p>
              </Link>
            ))}
            <Link href="/create" className="group space-y-2">
              <div className="aspect-square rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-zinc-600 group-hover:text-primary group-hover:border-primary transition-all">
                <UserCircle2 className="w-6 h-6" />
              </div>
              <p className="text-[9px] font-black text-center text-zinc-600 uppercase">New</p>
            </Link>
          </div>
        </section>
      </div>
      <Navigation />
    </main>
  );
}
