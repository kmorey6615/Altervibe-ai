
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
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
  CheckCircle2, 
  Activity, 
  Sparkles, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Zap,
  RefreshCcw,
  Save
} from "lucide-react";
import { generatePersonality } from "@/ai/flows/generate-ai-character-personality";
import { generateSocialMediaCaption } from "@/ai/flows/generate-social-media-caption";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";

type CharacterOption = {
  id: string;
  name?: string;
  personality: string;
  visualDescription: string;
  catchphrase: string;
  imageUrl: string;
  aesthetic?: string;
};

function CreatePageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"character" | "studio">("character");
  const [isGenerating, setIsGenerating] = useState(false);
  const [charRevealed, setCharRevealed] = useState(false);
  const [savedChars, setSavedChars] = useState<CharacterOption[]>([]);
  
  const [selectedChar, setSelectedChar] = useState<CharacterOption | null>(null);

  const [charInputs, setCharInputs] = useState({
    name: "",
    gender: "female",
    ageRange: "18-24",
    outfitIdeas: "",
    aesthetic: "",
    vibe: ""
  });

  const [options, setOptions] = useState<CharacterOption[]>([]);

  const [generatedResult, setGeneratedResult] = useState<{
    caption: string;
    hashtags: string[];
    mediaUrls: string[];
    type: "photo" | "video";
  } | null>(null);

  const [contentType, setContentType] = useState<"video" | "photo">("video");
  const [contentStyle, setContentStyle] = useState("viral dance");
  const [userPrompt, setUserPrompt] = useState("");

  // Sync with Firestore roster
  useEffect(() => {
    const q = query(collection(db, "characters"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chars = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CharacterOption[];
      setSavedChars(chars);
    });
    return () => unsubscribe();
  }, []);

  // Handle URL params for direct creation
  useEffect(() => {
    const charId = searchParams.get("charId");
    const type = searchParams.get("type");
    const style = searchParams.get("style");

    if (charId) {
      const fetchChar = async () => {
        const docRef = doc(db, "characters", charId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const charData = { id: docSnap.id, ...docSnap.data() } as CharacterOption;
          setSelectedChar(charData);
          setStep("studio");
        }
      };
      fetchChar();
    }

    if (type === "video" || type === "photo") {
      setContentType(type);
    }

    if (style) {
      setContentStyle(style);
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!charInputs.name) {
      toast({ 
        variant: "destructive",
        title: "Missing Info", 
        description: "Give your character a name first!" 
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const result = await generatePersonality(charInputs);
      
      const charOptions = result.options.map((opt, idx) => {
        const seed = `${charInputs.name.toLowerCase()}-${idx}-${Date.now()}`;
        return {
          ...opt,
          imageUrl: `https://picsum.photos/seed/${seed}/600/800`
        };
      });
      
      setOptions(charOptions);
      setCharRevealed(true);
      toast({ title: "Character concepts generated!" });
    } catch (e: any) {
      console.error(e);
      toast({ 
        variant: "destructive",
        title: "Generation failed",
        description: e.message || "Please check your API key and connection."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCharacter = async (option: CharacterOption) => {
    try {
      await addDoc(collection(db, "characters"), {
        name: charInputs.name || option.name,
        personality: option.personality,
        visualDescription: option.visualDescription,
        catchphrase: option.catchphrase,
        imageUrl: option.imageUrl,
        aesthetic: charInputs.aesthetic || option.aesthetic || "Aesthetic",
        createdAt: new Date().toISOString()
      });
      
      setSelectedChar(option);
      toast({ 
        title: "Saved!",
        description: `${charInputs.name || option.name} is now in your roster.`
      });
    } catch (error) {
      console.error("Error saving character:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Could not save to the cloud."
      });
    }
  };

  const handleGenerateContent = async () => {
    if (!selectedChar) {
      toast({ 
        variant: "destructive",
        title: "No Character Selected", 
        description: "Select a character from your roster first." 
      });
      return;
    }

    setIsGenerating(true);

    try {
      const styleInput = userPrompt || contentStyle;
      
      const result = await generateSocialMediaCaption({
        characterName: selectedChar.name || charInputs.name,
        characterAge: 20,
        characterStyle: selectedChar.aesthetic || charInputs.aesthetic,
        characterPersonality: selectedChar.personality,
        contentType: contentType,
        contentStyle: styleInput
      });
      
      const baseSeed = Math.floor(Math.random() * 10000);
      let mediaUrls: string[] = [];

      if (contentType === "video") {
        mediaUrls = ["https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"];
      } else {
        mediaUrls = Array.from({ length: 5 }).map((_, i) => 
          `https://picsum.photos/seed/set${baseSeed}-${i}/1080/1350`
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
          ? 'Photo set generated!' 
          : 'Video generated!' 
      });
    } catch (e: any) {
      console.error(e);
      toast({ 
        variant: "destructive",
        title: "Content generation failed",
        description: e.message || "Please check your connection."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const finalizeAndPost = async () => {
    if (!generatedResult || !selectedChar) return;

    try {
      await addDoc(collection(db, "posts"), {
        characterId: selectedChar.id,
        characterName: selectedChar.name,
        type: generatedResult.type,
        mediaUrls: generatedResult.mediaUrls,
        caption: generatedResult.caption,
        hashtags: generatedResult.hashtags,
        createdAt: new Date().toISOString()
      });

      toast({ title: "Content saved to profile feed!" });
      setGeneratedResult(null);
      router.push("/profile");
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        variant: "destructive",
        title: "Failed to post",
        description: "Could not save your creation to the cloud."
      });
    }
  };

  const copyCaption = () => {
    if (generatedResult) {
      navigator.clipboard.writeText(`${generatedResult.caption}\n\n${generatedResult.hashtags.join(" ")}`);
      toast({ title: "Caption copied!" });
    }
  };

  return (
    <main className="min-h-screen bg-black pb-24 pt-8 px-4 overflow-y-auto">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            AlterVibe <span className="text-primary">Studio</span>
          </h1>
          <p className="text-muted-foreground text-sm">Design and direct your AI creations</p>
        </header>

        <Tabs value={step} onValueChange={(v) => setStep(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-white/5 h-12 p-1">
            <TabsTrigger value="character" className="data-[state=active]:bg-primary font-bold">1. Identity Lab</TabsTrigger>
            <TabsTrigger value="studio" className="data-[state=active]:bg-primary font-bold" disabled={savedChars.length === 0}>2. Workshop</TabsTrigger>
          </TabsList>

          <TabsContent value="character" className="mt-6 space-y-6">
            {!charRevealed ? (
              <Card className="bg-zinc-900 border-white/5 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl">Identity Creator</CardTitle>
                  <CardDescription>Define the personality of your next AI influencer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <input 
                        id="name" 
                        placeholder="Luna Spark" 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={charInputs.name}
                        onChange={(e) => setCharInputs({...charInputs, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={charInputs.gender} onValueChange={(v) => setCharInputs({...charInputs, gender: v})}>
                        <SelectTrigger className="bg-black border-white/10">
                          <SelectValue placeholder="Gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age Range</Label>
                      <input 
                        id="age" 
                        placeholder="e.g. 18-24" 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={charInputs.ageRange}
                        onChange={(e) => setCharInputs({...charInputs, ageRange: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vibe">Vibe</Label>
                      <input 
                        id="vibe" 
                        placeholder="e.g. Sassy, Intellectual" 
                        className="flex h-10 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={charInputs.vibe}
                        onChange={(e) => setCharInputs({...charInputs, vibe: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aesthetic">Aesthetic Style</Label>
                    <input 
                      id="aesthetic" 
                      placeholder="e.g. Y2K Cyberpunk, Soft Minimalism" 
                      className="flex h-10 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={charInputs.aesthetic}
                      onChange={(e) => setCharInputs({...charInputs, aesthetic: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outfits">Outfit Concepts</Label>
                    <textarea 
                      id="outfits" 
                      placeholder="Chrome jackets, holographic boots, oversized streetwear..." 
                      className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={charInputs.outfitIdeas}
                      onChange={(e) => setCharInputs({...charInputs, outfitIdeas: e.target.value})}
                    />
                  </div>

                  <Button 
                    className="w-full bg-primary hover:bg-primary/80 font-bold h-12 text-lg shadow-lg shadow-primary/20"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
                    Generate AI Character
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Identity Options
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setCharRevealed(false)} className="text-muted-foreground hover:text-white">
                    <RefreshCcw className="w-3 h-3 mr-2" />
                    Regenerate
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  {options.map((opt, index) => (
                    <Card key={index} className="bg-zinc-900 border-white/10 overflow-hidden shadow-xl">
                      <div className="aspect-[4/5] relative">
                        <Image src={opt.imageUrl} alt="AI Character Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                        <div className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full text-[10px] font-black italic shadow-lg">
                          CONCEPT {index + 1}
                        </div>
                        <div className="absolute bottom-6 left-6 right-6">
                          <h3 className="text-2xl font-black uppercase italic drop-shadow-xl">{charInputs.name}</h3>
                          <p className="text-accent text-xs font-bold uppercase tracking-widest drop-shadow-lg">"{opt.catchphrase}"</p>
                        </div>
                      </div>
                      <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Bio</Label>
                          <p className="text-sm italic text-zinc-300 leading-relaxed">{opt.personality}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Visual Language</Label>
                          <p className="text-xs text-zinc-400 leading-relaxed">{opt.visualDescription}</p>
                        </div>
                        <Button 
                          className={`w-full h-11 transition-all ${savedChars.some(c => c.personality === opt.personality) ? 'bg-green-600 hover:bg-green-700' : 'bg-white text-black hover:bg-zinc-200'}`}
                          onClick={() => handleSaveCharacter(opt)}
                          disabled={savedChars.some(c => c.personality === opt.personality)}
                        >
                          {savedChars.some(c => c.personality === opt.personality) ? (
                            <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved to Roster</>
                          ) : (
                            <><Save className="w-4 h-4 mr-2" /> Save this Character</>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button 
                  className="w-full bg-primary h-14 font-black uppercase italic text-lg shadow-2xl shadow-primary/30"
                  onClick={() => setStep("studio")}
                  disabled={savedChars.length === 0}
                >
                  Enter Workshop
                  <Activity className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="studio" className="mt-6">
            {!generatedResult ? (
              <Card className="bg-zinc-900 border-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Workshop
                  </CardTitle>
                  <CardDescription>Direct your AI character for high-engagement content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Your Roster</Label>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {savedChars.map((char) => (
                        <button 
                          key={char.id}
                          onClick={() => setSelectedChar(char)}
                          className="flex-shrink-0 w-24 flex flex-col items-center gap-2 group outline-none"
                        >
                          <div className={`w-20 h-20 rounded-full border-4 transition-all overflow-hidden relative ${selectedChar?.id === char.id ? 'border-primary scale-110 shadow-lg shadow-primary/20' : 'border-white/10 opacity-50'}`}>
                            <Image src={char.imageUrl} alt="Roster" fill className="object-cover" />
                          </div>
                          <span className={`text-[10px] font-bold truncate w-full text-center ${selectedChar?.id === char.id ? 'text-primary' : 'text-muted-foreground'}`}>{char.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedChar?.personality && (
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10 animate-in fade-in duration-300">
                      <h3 className="text-sm font-bold text-primary mb-1 uppercase tracking-wider">Personality:</h3>
                      <p className="text-xs italic text-zinc-300 leading-relaxed">{selectedChar.personality}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label>Format</Label>
                    <RadioGroup 
                      value={contentType} 
                      onValueChange={(v) => setContentType(v as any)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="cursor-pointer">
                        <RadioGroupItem value="video" id="v-studio" className="peer sr-only" />
                        <Label
                          htmlFor="v-studio"
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-black/40 p-5 hover:bg-zinc-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
                        >
                          <VideoIcon className="mb-2 h-7 w-7 text-primary" />
                          <span className="font-bold">AI Video</span>
                        </Label>
                      </div>
                      <div className="cursor-pointer">
                        <RadioGroupItem value="photo" id="p-studio" className="peer sr-only" />
                        <Label
                          htmlFor="p-studio"
                          className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-black/40 p-5 hover:bg-zinc-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
                        >
                          <ImageIcon className="mb-2 h-7 w-7 text-primary" />
                          <span className="font-bold">Photo Set</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-accent" />
                      Viral Vibe
                    </Label>
                    <Select value={contentStyle} onValueChange={setContentStyle}>
                      <SelectTrigger className="bg-black border-white/10 h-11">
                        <SelectValue placeholder="Select a trend" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {contentType === "video" ? (
                          <>
                            <SelectItem value="viral dance">Dance Challenge</SelectItem>
                            <SelectItem value="POV">POV Commentary</SelectItem>
                            <SelectItem value="GRWM">GRWM Routine</SelectItem>
                            <SelectItem value="transition">Outfit Transition</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="editorial">Editorial Set (5 images)</SelectItem>
                            <SelectItem value="street">Street Style Set</SelectItem>
                            <SelectItem value="lifestyle">Lifestyle Candid Set</SelectItem>
                            <SelectItem value="lookbook">Season Lookbook</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Wand2 className="w-3 h-3 text-primary" />
                      Director's Notes (Prompt)
                    </Label>
                    <textarea 
                      placeholder="e.g. Walking through a rainy neon marketplace, wearing chrome streetwear..." 
                      className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full bg-accent text-black hover:bg-accent/80 font-black h-14 text-xl uppercase italic shadow-2xl shadow-accent/20"
                    onClick={handleGenerateContent}
                    disabled={isGenerating || !selectedChar}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Rendering...
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
                    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border-8 border-zinc-800 shadow-2xl shadow-primary/20 bg-zinc-950">
                      <video src={generatedResult.mediaUrls[0]} controls autoPlay loop className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <Carousel className="w-full">
                      <CarouselContent>
                        {generatedResult.mediaUrls.map((url, index) => (
                          <CarouselItem key={index}>
                            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border-4 border-primary shadow-2xl shadow-primary/20">
                              <Image src={url} alt={`Generated Photo ${index + 1}`} fill className="object-cover" />
                              <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[12px] font-black italic shadow-lg">
                                {index + 1} / 5
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2 bg-black/60 border-none h-10 w-10 hover:bg-primary transition-all" />
                      <CarouselNext className="right-2 bg-black/60 border-none h-10 w-10 hover:bg-primary transition-all" />
                    </Carousel>
                  )}
                </div>

                <Card className="bg-zinc-900 border-white/5 shadow-2xl">
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-3">
                      <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Generated AI Caption</Label>
                      <div className="p-4 bg-black rounded-xl border border-white/5 leading-relaxed relative">
                        <p className="text-sm italic text-zinc-200">
                          {generatedResult.caption}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {generatedResult.hashtags.map(h => (
                            <span key={h} className="px-3 py-1 rounded-full bg-primary/10 text-[11px] font-bold text-primary border border-primary/20">{h}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="border-white/10 bg-black h-12 rounded-xl" onClick={copyCaption}>
                        <Copy className="w-4 h-4 mr-2" /> Copy Text
                      </Button>
                      <Button variant="outline" className="border-white/10 bg-black h-12 rounded-xl" onClick={() => setGeneratedResult(null)}>
                        <RefreshCcw className="w-4 h-4 mr-2" /> Redo Render
                      </Button>
                    </div>

                    <Button className="w-full bg-primary font-black h-14 uppercase italic text-lg rounded-xl shadow-xl shadow-primary/20" onClick={finalizeAndPost}>
                      <CheckCircle2 className="w-6 h-6 mr-2" /> Finalize & Post
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
    <Suspense fallback={
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-primary font-black italic gap-4">
        <Loader2 className="w-12 h-12 animate-spin" />
        <span className="animate-pulse tracking-widest uppercase text-sm">Initializing Studio...</span>
      </div>
    }>
      <CreatePageContent />
    </Suspense>
  );
}
