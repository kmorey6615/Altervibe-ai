"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Copy, Download, Save, CheckCircle2, Activity, Sparkles, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { generateAICharacterPersonality } from "@/ai/flows/generate-ai-character-personality";
import { generateSocialMediaCaption } from "@/ai/flows/generate-social-media-caption";
import Image from "next/image";

function CreatePageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"character" | "studio">("character");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    caption: string;
    hashtags: string[];
    mediaUrl: string;
    type: "photo" | "video";
  } | null>(null);

  // Character State
  const [charData, setCharData] = useState({
    name: "",
    age: 18,
    style: "",
    personality: ""
  });

  // Studio State
  const [contentType, setContentType] = useState<"video" | "photo">("video");
  const [contentStyle, setContentStyle] = useState("viral dance");

  // Handle URL search params for "Use This Trend"
  useEffect(() => {
    const styleParam = searchParams.get("style");
    if (styleParam) {
      setContentStyle(styleParam);
    }
  }, [searchParams]);

  const handleGeneratePersonality = async () => {
    if (!charData.name || !charData.style) {
      toast({ title: "Please fill in character name and style first." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateAICharacterPersonality({
        name: charData.name,
        style: charData.style
      });
      setCharData({ ...charData, personality: result.personalityDescription });
    } catch (e) {
      toast({ title: "Generation failed. Try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!charData.name || !charData.personality) {
      toast({ title: "Complete character creation first." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateSocialMediaCaption({
        characterName: charData.name,
        characterAge: charData.age,
        characterStyle: charData.style,
        characterPersonality: charData.personality,
        contentType: contentType,
        contentStyle: contentStyle
      });
      
      const seed = Math.floor(Math.random() * 1000);
      const mediaUrl = contentType === "video" 
        ? `https://picsum.photos/seed/vid${seed}/1080/1920`
        : `https://picsum.photos/seed/photo${seed}/1080/1350`; // 4:5 ratio for photos

      setGeneratedResult({
        caption: result.caption,
        hashtags: result.hashtags,
        mediaUrl: mediaUrl,
        type: contentType
      });
      
      toast({ title: `${contentType === 'photo' ? 'Photo' : 'Video'} generated successfully!` });
    } catch (e) {
      toast({ title: "Failed to generate content." });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCaption = () => {
    if (generatedResult) {
      navigator.clipboard.writeText(`${generatedResult.caption}\n\n${generatedResult.hashtags.join(" ")}`);
      toast({ title: "Caption copied to clipboard!" });
    }
  };

  return (
    <main className="min-h-screen bg-black pb-24 pt-8 px-4 overflow-y-auto">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            AlterVibe <span className="text-primary">Studio</span>
          </h1>
          <p className="text-muted-foreground text-sm">Bring your AI influencer to life</p>
        </header>

        <Tabs value={step} onValueChange={(v) => setStep(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-white/5 h-12">
            <TabsTrigger value="character" className="data-[state=active]:bg-primary">1. Character</TabsTrigger>
            <TabsTrigger value="studio" className="data-[state=active]:bg-primary" disabled={!charData.name}>2. Content</TabsTrigger>
          </TabsList>

          <TabsContent value="character" className="mt-6">
            <Card className="bg-zinc-900 border-white/5 overflow-hidden">
              <CardHeader>
                <CardTitle>Create Persona</CardTitle>
                <CardDescription>Define the identity of your AI influencer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Influence Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Luna Spark" 
                    className="bg-black border-white/10"
                    value={charData.name}
                    onChange={(e) => setCharData({...charData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Base Age (18+)</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    min={18} 
                    className="bg-black border-white/10"
                    value={charData.age}
                    onChange={(e) => setCharData({...charData, age: parseInt(e.target.value) || 18})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="style">Aesthetic Style</Label>
                  <Input 
                    id="style" 
                    placeholder="e.g. Y2K Techwear, Minimalist Luxe" 
                    className="bg-black border-white/10"
                    value={charData.style}
                    onChange={(e) => setCharData({...charData, style: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="personality">Detailed Personality</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-accent h-auto p-0 hover:bg-transparent"
                      onClick={handleGeneratePersonality}
                      disabled={isGenerating || !charData.name || !charData.style}
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                      Generate AI Traits
                    </Button>
                  </div>
                  <Textarea 
                    id="personality" 
                    placeholder="Describe how they act and interact..." 
                    className="bg-black border-white/10 min-h-[120px]"
                    value={charData.personality}
                    onChange={(e) => setCharData({...charData, personality: e.target.value})}
                  />
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/80 font-bold"
                  onClick={() => setStep("studio")}
                  disabled={!charData.name || !charData.personality}
                >
                  Continue to Studio
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="studio" className="mt-6">
            {!generatedResult ? (
              <Card className="bg-zinc-900 border-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Content Studio
                  </CardTitle>
                  <CardDescription>Select a vibe for your next viral post.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-black border border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-xl">
                      {charData.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-bold">{charData.name}</p>
                      <p className="text-xs text-muted-foreground">{charData.style}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Content Type</Label>
                    <RadioGroup 
                      value={contentType} 
                      onValueChange={(v) => {
                        setContentType(v as any);
                        if (v === "photo") setContentStyle("portrait");
                        else setContentStyle("viral dance");
                      }}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem value="video" id="video" className="peer sr-only" />
                        <Label
                          htmlFor="video"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <VideoIcon className="mb-3 h-6 w-6" />
                          Video
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="photo" id="photo" className="peer sr-only" />
                        <Label
                          htmlFor="photo"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <ImageIcon className="mb-3 h-6 w-6" />
                          Photo
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Choose Style</Label>
                    <Select value={contentStyle} onValueChange={setContentStyle}>
                      <SelectTrigger className="bg-black border-white/10">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {contentType === "video" ? (
                          <>
                            <SelectItem value="viral dance">Viral Dance</SelectItem>
                            <SelectItem value="aesthetic">Aesthetic B-Roll</SelectItem>
                            <SelectItem value="POV">POV / Storytime</SelectItem>
                            <SelectItem value="lip sync">Lip Sync</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="portrait">Studio Portrait</SelectItem>
                            <SelectItem value="editorial">High Fashion Editorial</SelectItem>
                            <SelectItem value="street">Street Photography</SelectItem>
                            <SelectItem value="lifestyle">Candid Lifestyle</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full bg-accent text-black hover:bg-accent/80 font-black h-12 text-lg"
                    onClick={handleGenerateContent}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Rendering AI {contentType}...
                      </>
                    ) : (
                      <>
                        <Activity className="w-6 h-6 mr-2" />
                        Generate AI Content
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className={`relative ${generatedResult.type === 'video' ? 'aspect-[9/16]' : 'aspect-[4/5]'} w-full max-w-sm mx-auto rounded-2xl overflow-hidden border-4 border-primary shadow-2xl shadow-primary/20`}>
                  <Image 
                    src={generatedResult.mediaUrl} 
                    alt="Generated Media Preview" 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                      <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>

                <Card className="bg-zinc-900 border-white/5">
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Caption Preview</Label>
                      <p className="text-sm italic p-3 bg-black rounded-md border border-white/5">{generatedResult.caption}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {generatedResult.hashtags.map(h => <span key={h} className="text-xs text-accent">{h}</span>)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="border-white/10 bg-black" onClick={copyCaption}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                      </Button>
                      <Button variant="outline" className="border-white/10 bg-black">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>

                    <Button className="w-full bg-primary" onClick={() => {
                      setGeneratedResult(null);
                      toast({ title: "Post saved to your feed!" });
                    }}>
                      <Save className="w-4 h-4 mr-2" />
                      Save to Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Navigation />
    </main>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-primary font-bold italic animate-pulse">Loading Studio...</div>}>
      <CreatePageContent />
    </Suspense>
  );
}
