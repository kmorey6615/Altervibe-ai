
"use client";

import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Video, Eye, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    { label: "Total Videos", value: "12", icon: Video, color: "text-blue-500" },
    { label: "Est. Views", value: "48.2K", icon: Eye, color: "text-accent" },
    { label: "Followers", value: "2.4K", icon: Users, color: "text-primary" },
    { label: "Engagement", value: "12.4%", icon: Activity, color: "text-green-500" },
  ];

  return (
    <main className="min-h-screen bg-black pb-24 pt-8 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white uppercase italic">Performance</h1>
          <p className="text-muted-foreground text-sm">Real-time metrics for your AI influence empire.</p>
        </header>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-zinc-900 border-white/5">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-[10px] text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="w-3 h-3 text-green-500 mr-1" />
                  +12% from last week
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Trending AI Models</h2>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-black">
                  L{i}
                </div>
                <div>
                  <p className="font-bold">Model_Alpha_{i}</p>
                  <p className="text-xs text-muted-foreground">High performance lifestyle</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">1.2K views</p>
                <p className="text-[10px] text-accent">TOP RATED</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Navigation />
    </main>
  );
}
