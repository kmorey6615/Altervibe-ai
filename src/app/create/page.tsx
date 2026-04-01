
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
import { 
  Loader2, 
  Wand2, 
  Copy, 
  Download, 
  Save, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Zap,
  RefreshCcw,
  Music,
  Hash
} from "lucide-react";
import { generateAICharacterPersonality } from "@/ai/flows/generate-ai-character-personality";
import { generateSocialMediaCaption } from "@/ai/flows/generate-social-media-caption";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function CreatePageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"character" | "studio">("character");
  const [isGenerating, setIsGenerating] = useState(false);
  const [charRevealed, setCharRevealed] = useState(false);
  const [charSaved, setCharSaved] = useState(false);
  
  // Character State
  const [charData, setCharData] = useState({
    name: "",
    age: 18,
    style: "",
    personality: "",
    imageUrl: ""
  });

  // Result State
  const [generatedResult, setGeneratedResult] = useState<{
    caption: string;
    hashtags: string[];
    mediaUrls: string[];
    type: "photo" | "video";
  } | null>(null);

  // Studio State
  const [contentType, setContentType] = useState<"video" | "photo">("video");
  const [contentStyle, setContentStyle] = useState("viral dance");
  const [userPrompt, setUserPrompt] = useState("");

  // Handle URL search params for "Use This Trend"
  useEffect(() => {
    const styleParam = searchParams.get("style");
    if (styleParam) {
      setContentStyle(styleParam);
      setStep("studio");
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
      
      const charSeed = charData.name.toLowerCase().replace(/\s/g, '');
      const imageUrl = `https://picsum.photos/seed/${charSeed}/600/800`;
      
      setCharData({ 
        ...charData, 
        personality: result.personalityDescription,
        imageUrl: imageUrl
      });
      setCharRevealed(true);
      setCharSaved(false);
      toast({ title: "Character identity initialized!" });
    } catch (e) {
      toast({ title: "Generation failed. Try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCharacter = () => {
    setCharSaved(true);
    toast({ 
      title: "Influencer Saved!",
      description: `${charData.name} is now in your roster.`
    });
    // Automatic switch to Studio after save
    setTimeout(() => setStep("studio"), 800);
  };

  const handleGenerateContent = async () => {
    if (!charData.name || !charData.personality) {
      toast({ title: "Complete character creation first." });
      return;
    }
    setIsGenerating(true);
    try {
      const styleInput = userPrompt || contentStyle;
      
      const result = await generateSocialMediaCaption({
        characterName: charData.name,
        characterAge: charData.age,
        characterStyle: charData.style,
        characterPersonality: charData.personality,
        contentType: contentType,
        contentStyle: styleInput
      });
      
      const baseSeed = Math.floor(Math.random() * 10000);
      let mediaUrls: string[] = [];

      if (contentType === "video") {
        mediaUrls = [`https://picsum.photos/seed/vid${baseSeed}/1080/1920`];
      } else {
        mediaUrls = Array.from({ length: 5 }).map((_, i) => 
          `https://picsum.photos/seed/photo${baseSeed + i}/1080/1350`
        );
      }

      setGeneratedResult({
        caption: result.caption,
        hashtags: result.hashtags,
        mediaUrls: mediaUrls,
        type: contentType
      });
      
      toast({ 
        title: contentType === 'photo' 
          ? 'Cohesive photo set generated!' 
          : 'Video generated successfully!' 
      });
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
            <TabsTrigger value="character" className="data-[state=active]:bg-primary">1. Identity</TabsTrigger>
            <TabsTrigger value="studio" className="data-[state=active]:bg-primary" disabled={!charSaved}>2. Workshop</TabsTrigger>
          </TabsList>

          <TabsContent value="character" className="mt-6">
            {!charRevealed ? (
              <Card className="bg-zinc-900 border-white/5 overflow-hidden">
                <CardHeader>
                  <CardTitle>Create Persona</CardTitle>
                  <CardDescription>Define the identity of your AI influencer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Influencer Name</Label>
                    <Input 
                      id="name" 
                      placeholder="e.g. Luna Spark" 
                      className="bg-black border-white/10"
                      value={charData.name}
                      onChange={(e) => setCharData({...charData, name: e.target.value})}
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
                  <Button 
                    className="w-full bg-primary hover:bg-primary/80 font-bold h-12"
                    onClick={handleGeneratePersonality}
                    disabled={isGenerating || !charData.name || !charData.style}
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                    Generate AI character
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-4 border-primary shadow-2xl shadow-primary/20">
                  <Image 
                    src={charData.imageUrl} 
                    alt="AI Character Preview" 
                    fill 
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h2 className="text-3xl font-black italic uppercase drop-shadow-xl">{charData.name}</h2>
                    <p className="text-accent font-bold uppercase tracking-widest text-sm drop-shadow-lg">{charData.style}</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">AI READY</span>
                  </div>
                </div>

                <Card className="bg-zinc-900 border-white/5">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent" />
                      Persona Blueprint
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary pl-4">
                      {charData.personality}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        className="border-white/10 bg-black hover:bg-zinc-800" 
                        onClick={() => setCharRevealed(false)}
                      >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                      <Button 
                        className={charSaved ? "bg-green-600 hover:bg-green-700" : "bg-zinc-100 text-black hover:bg-white"}
                        onClick={handleSaveCharacter}
                      >
                        {charSaved ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {charSaved ? "Saved" : "Save to Profile"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="studio" className="mt-6">
            {!generatedResult ? (
              <Card className="bg-zinc-900 border-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Content Studio
                  </CardTitle>
                  <CardDescription>Direct your influencer's next viral hit.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-black border border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-primary overflow-hidden relative">
                      <Image 
                        src={charData.imageUrl || "https://picsum.photos/seed/placeholder/200"} 
                        alt="Profile" 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-white">{charData.name || "Select Influencer"}</p>
                      <p className="text-xs text-muted-foreground">{charData.style || "AI Model"}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Format</Label>
                    <RadioGroup 
                      value={contentType} 
                      onValueChange={(v) => {
                        setContentType(v as any);
                        if (v === "photo") setContentStyle("portrait");
                        else setContentStyle("viral dance");
                      }}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="cursor-pointer">
                        <RadioGroupItem value="video" id="video" className="peer sr-only" />
                        <Label
                          htmlFor="video"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-black/40 p-4 hover:bg-zinc-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all [&:has([data-state=checked])]:border-primary"
                        >
                          <VideoIcon className="mb-3 h-6 w-6 text-primary" />
                          Video
                        </Label>
                      </div>
                      <div className="cursor-pointer">
                        <RadioGroupItem value="photo" id="photo" className="peer sr-only" />
                        <Label
                          htmlFor="photo"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-black/40 p-4 hover:bg-zinc-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all [&:has([data-state=checked])]:border-primary"
                        >
                          <ImageIcon className="mb-3 h-6 w-6 text-primary" />
                          Photo Set
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-accent" />
                      Viral Vibe / Trend
                    </Label>
                    <Select value={contentStyle} onValueChange={setContentStyle}>
                      <SelectTrigger className="bg-black border-white/10">
                        <SelectValue placeholder="Select a trend" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {contentType === "video" ? (
                          <>
                            <SelectItem value="viral dance">Viral Dance Challenge</SelectItem>
                            <SelectItem value="aesthetic">Cinematic B-Roll</SelectItem>
                            <SelectItem value="POV">POV Storytelling</SelectItem>
                            <SelectItem value="lip sync">Music Lip Sync</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="portrait">Studio Portrait Set</SelectItem>
                            <SelectItem value="editorial">High Fashion Editorial</SelectItem>
                            <SelectItem value="street">Street Photography</SelectItem>
                            <SelectItem value="lifestyle">Candid Lifestyle</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Wand2 className="w-3 h-3 text-primary" />
                      Direct Command (Optional)
                    </Label>
                    <Textarea 
                      placeholder="e.g. dancing on a rooftop at sunset, holding a neon coffee cup..." 
                      className="bg-black border-white/10 min-h-[100px] resize-none"
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full bg-accent text-black hover:bg-accent/80 font-black h-12 text-lg uppercase italic"
                    onClick={handleGenerateContent}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Rendering AI {contentType === 'photo' ? 'Photos' : 'Video'}...
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
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <div className={`relative ${generatedResult.type === 'video' ? 'aspect-[9/16]' : 'aspect-[4/5]'} w-full max-w-sm mx-auto`}>
                  {generatedResult.type === 'video' ? (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden border-4 border-primary shadow-2xl shadow-primary/20">
                      <Image 
                        src={generatedResult.mediaUrls[0]} 
                        alt="Generated Video Preview" 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                         <div className="p-4 rounded-full bg-white/20 backdrop-blur-md">
                           <VideoIcon className="w-10 h-10 text-white" />
                         </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Music className="w-4 h-4 text-white animate-spin-slow" />
                          <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Viral Audio Attached</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {generatedResult.mediaUrls.map((url, index) => (
                            <CarouselItem key={index}>
                              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border-4 border-primary shadow-2xl shadow-primary/20">
                                <Image 
                                  src={url} 
                                  alt={`Generated Photo ${index + 1}`} 
                                  fill 
                                  className="object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black italic">
                                  {index + 1} / 5
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2 bg-black/50 border-none h-8 w-8" />
                        <CarouselNext className="right-2 bg-black/50 border-none h-8 w-8" />
                      </Carousel>
                      <p className="text-[10px] text-center text-muted-foreground uppercase font-black tracking-widest">Swipe for full cohesive set</p>
                    </div>
                  )}
                </div>

                <Card className="bg-zinc-900 border-white/5">
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Generated Caption</Label>
                        <Hash className="w-3 h-3 text-primary" />
                      </div>
                      <p className="text-sm italic p-4 bg-black rounded-xl border border-white/5 leading-relaxed">
                        {generatedResult.caption}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {generatedResult.hashtags.map(h => (
                          <span key={h} className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="border-white/10 bg-black h-11" onClick={copyCaption}>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Text
                      </Button>
                      <Button variant="outline" className="border-white/10 bg-black h-11">
                        <Download className="w-4 h-4 mr-2" />
                        Save Set
                      </Button>
                    </div>

                    <Button className="w-full bg-primary font-black h-12 uppercase italic" onClick={() => {
                      setGeneratedResult(null);
                      toast({ title: "Post saved to your profile feed!" });
                    }}>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Post to Profile
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
    <Suspense fallback={<div className="min-h-screen bg-black flex flex-col items-center justify-center text-primary font-black italic gap-4">
      <Loader2 className="w-12 h-12 animate-spin" />
      <span className="animate-pulse tracking-widest uppercase text-sm">Initializing Studio...</span>
    </div>}>
      <CreatePageContent />
    </Suspense>
  );
}
