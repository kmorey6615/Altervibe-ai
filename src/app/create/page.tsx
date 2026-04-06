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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
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
  Save,
  Download,
  Share2,
  Twitter,
  Facebook,
  Instagram,
  Send,
  ShoppingBag,
  UserCircle2,
  Layers,
  Rocket,
  Upload,
  X,
  Type
} from "lucide-react";
import { generatePersonality } from "@/ai/flows/generate-ai-character-personality";
import { generateSocialMediaCaption } from "@/ai/flows/generate-social-media-caption";
import { generateProductMarketing } from "@/ai/flows/generate-product-marketing";
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

type GeneratedResult = {
  caption: string;
  hashtags: string[];
  mediaUrls: string[];
  type: "photo" | "video";
  headline?: string;
  hooks?: string[];
  isProduct?: boolean;
};

function CreatePageContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"influencer" | "marketing">("influencer");
  const [step, setStep] = useState<"character" | "studio">("character");
  const [isGenerating, setIsGenerating] = useState(false);
  const [charRevealed, setCharRevealed] = useState(false);
  const [savedChars, setSavedChars] = useState<CharacterOption[]>([]);
  const [selectedChar, setSelectedChar] = useState<CharacterOption | null>(null);

  // Influencer Inputs
  const [charInputs, setCharInputs] = useState({
    name: "",
    gender: "female",
    ageRange: "18-24",
    outfitIdeas: "",
    aesthetic: "",
    vibe: ""
  });

  // Product Inputs
  const [productInputs, setProductInputs] = useState({
    productName: "",
    category: "Skincare",
    customCategory: "",
    description: "",
    targetAudience: "Young Adults",
    platform: "Instagram" as any,
    productImage: null as string | null
  });

  const [options, setOptions] = useState<CharacterOption[]>([]);
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [contentType, setContentType] = useState<"video" | "photo">("video");
  const [contentStyle, setContentStyle] = useState("viral dance");
  const [userPrompt, setUserPrompt] = useState("");

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

  useEffect(() => {
    const charId = searchParams.get("charId");
    if (charId) {
      const fetchChar = async () => {
        const docRef = doc(db, "characters", charId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSelectedChar({ id: docSnap.id, ...docSnap.data() } as CharacterOption);
          setStep("studio");
          setMode("influencer");
        }
      };
      fetchChar();
    }
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit to 2MB to prevent Server Action body size issues
      if (file.size > 2 * 1024 * 1024) {
        toast({ 
          variant: "destructive", 
          title: "File too large", 
          description: "Please upload an image under 2MB for optimal performance." 
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductInputs(prev => ({ ...prev, productImage: reader.result as string }));
        toast({ title: "Product image uploaded!" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateChar = async () => {
    if (!charInputs.name) {
      toast({ variant: "destructive", title: "Missing Info", description: "Give your character a name first!" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generatePersonality(charInputs);
      const charOptions = result.options.map((opt, idx) => ({
        ...opt,
        imageUrl: `https://picsum.photos/seed/${charInputs.name.toLowerCase()}-${idx}-${Date.now()}/600/800`
      }));
      setOptions(charOptions);
      setCharRevealed(true);
      toast({ title: "Character concepts generated!" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Generation failed", description: e.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMarketing = async () => {
    if (!productInputs.productName) {
      toast({ variant: "destructive", title: "Missing Info", description: "Enter a product name." });
      return;
    }
    
    const finalCategory = productInputs.category === "Other" 
      ? productInputs.customCategory 
      : productInputs.category;

    if (productInputs.category === "Other" && !productInputs.customCategory) {
      toast({ variant: "destructive", title: "Missing Category", description: "Please enter a custom category name." });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateProductMarketing({
        ...productInputs,
        category: finalCategory,
        productImage: productInputs.productImage || undefined
      });
      const seed = Math.floor(Math.random() * 10000);
      const mediaUrls = contentType === "video" 
        ? ["https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"]
        : Array.from({ length: 4 }).map((_, i) => `https://picsum.photos/seed/prod-${seed}-${i}/1080/1080`);

      setGeneratedResult({
        headline: result.headline,
        caption: result.adCopy,
        hooks: result.hooks,
        hashtags: result.hashtags,
        mediaUrls: mediaUrls,
        type: contentType,
        isProduct: true
      });
      toast({ title: "Marketing campaign ready!" });
    } catch (e: any) {
      console.error("Marketing generation failed:", e);
      toast({ 
        variant: "destructive", 
        title: "Marketing generation failed", 
        description: e.message || "Something went wrong during generation. Try a smaller image." 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateInfluencerContent = async () => {
    if (!selectedChar) {
      toast({ variant: "destructive", title: "No Character", description: "Select a character first." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateSocialMediaCaption({
        characterName: selectedChar.name || charInputs.name,
        characterAge: 21,
        characterStyle: selectedChar.aesthetic || charInputs.aesthetic,
        characterPersonality: selectedChar.personality,
        contentType: contentType,
        contentStyle: userPrompt || contentStyle
      });
      const baseSeed = Math.floor(Math.random() * 10000);
      const mediaUrls = contentType === "video" 
        ? ["https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"]
        : Array.from({ length: 5 }).map((_, i) => `https://picsum.photos/seed/set${baseSeed}-${i}/1080/1350`);

      setGeneratedResult({
        caption: result.caption,
        hashtags: result.hashtags,
        mediaUrls: mediaUrls,
        type: contentType,
        isProduct: false
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Content failed", description: e.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const finalizeAndPost = async () => {
    if (!generatedResult) return;
    try {
      await addDoc(collection(db, "posts"), {
        ...(generatedResult.isProduct ? { productName: productInputs.productName } : { characterName: selectedChar?.name, characterId: selectedChar?.id }),
        type: generatedResult.type,
        mediaUrls: generatedResult.mediaUrls,
        caption: generatedResult.caption,
        hashtags: generatedResult.hashtags,
        isProduct: !!generatedResult.isProduct,
        createdAt: new Date().toISOString()
      });
      toast({ title: "Content saved to profile feed!" });
      router.push("/profile");
    } catch (error) {
      toast({ variant: "destructive", title: "Failed to post", description: "Cloud sync error." });
    }
  };

  const TikTokIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13-.08-.25-.17-.38-.25V14.5c.02 2.22-.73 4.48-2.3 6.08-1.58 1.61-3.9 2.39-6.13 2.14-2.22-.24-4.29-1.49-5.49-3.38-1.19-1.89-1.39-4.27-.55-6.27.83-2 2.64-3.51 4.74-4.04 1.25-.32 2.57-.3 3.82.04V13.3c-.76-.23-1.61-.25-2.38-.05-.77.2-1.44.69-1.9 1.35-.45.66-.55 1.48-.3 2.25.26.77.85 1.39 1.58 1.72.73.33 1.59.33 2.32.02.73-.31 1.28-.9 1.52-1.64.12-.37.16-.77.15-1.16V0h-.01z"/>
    </svg>
  );

  return (
    <main className="min-h-screen bg-background pb-24 pt-8 px-4 overflow-y-auto">
      <div className="max-w-xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            AlterVibe <span className="text-primary">Studio</span>
          </h1>
          
          <div className="flex justify-center">
            <RadioGroup 
              value={mode} 
              onValueChange={(v) => { setMode(v as any); setGeneratedResult(null); }}
              className="grid grid-cols-2 gap-4 w-full"
            >
              <div>
                <RadioGroupItem value="influencer" id="mode-inf" className="peer sr-only" />
                <Label
                  htmlFor="mode-inf"
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-white/5 bg-zinc-900/50 p-4 hover:bg-zinc-800 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all cursor-pointer"
                >
                  <UserCircle2 className={`w-5 h-5 ${mode === 'influencer' ? 'text-primary' : 'text-zinc-500'}`} />
                  <span className={`font-bold ${mode === 'influencer' ? 'text-white' : 'text-zinc-500'}`}>Influencer Lab</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="marketing" id="mode-mkt" className="peer sr-only" />
                <Label
                  htmlFor="mode-mkt"
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-white/5 bg-zinc-900/50 p-4 hover:bg-zinc-800 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 transition-all cursor-pointer"
                >
                  <ShoppingBag className={`w-5 h-5 ${mode === 'marketing' ? 'text-accent' : 'text-zinc-500'}`} />
                  <span className={`font-bold ${mode === 'marketing' ? 'text-white' : 'text-zinc-500'}`}>Product Studio</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </header>

        {!generatedResult ? (
          mode === "influencer" ? (
            <Tabs value={step} onValueChange={(v) => setStep(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-white/5 h-12 p-1">
                <TabsTrigger value="character" className="data-[state=active]:bg-primary font-bold">1. Identity Lab</TabsTrigger>
                <TabsTrigger value="studio" className="data-[state=active]:bg-primary font-bold" disabled={savedChars.length === 0}>2. Workshop</TabsTrigger>
              </TabsList>

              <TabsContent value="character" className="mt-6 space-y-6">
                {!charRevealed ? (
                  <Card className="bg-zinc-900 border-white/5">
                    <CardHeader>
                      <CardTitle className="text-xl text-white">Identity Creator</CardTitle>
                      <CardDescription>Define the personality of your next AI influencer.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-zinc-400">Name</Label>
                          <input 
                            placeholder="Luna Spark" 
                            className="flex h-10 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            value={charInputs.name}
                            onChange={(e) => setCharInputs({...charInputs, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-zinc-400">Gender</Label>
                          <Select value={charInputs.gender} onValueChange={(v) => setCharInputs({...charInputs, gender: v})}>
                            <SelectTrigger className="bg-black border-white/10 text-white"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10">
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="non-binary">Non-binary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400">Vibe & Aesthetic</Label>
                        <input 
                          placeholder="e.g. Sassy, Cyberpunk" 
                          className="flex h-10 w-full rounded-md border border-white/10 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                          value={charInputs.vibe}
                          onChange={(e) => setCharInputs({...charInputs, vibe: e.target.value})}
                        />
                      </div>
                      <Button className="w-full bg-primary font-bold h-12" onClick={handleGenerateChar} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
                        Generate Concepts
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-bottom-4">
                    {options.map((opt, index) => (
                      <Card key={index} className="bg-zinc-900 border-white/10 overflow-hidden">
                        <div className="aspect-[4/5] relative">
                          <Image src={opt.imageUrl} alt="Preview" fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent" />
                          <div className="absolute bottom-6 left-6 right-6">
                            <h3 className="text-2xl font-black uppercase italic text-white">{charInputs.name}</h3>
                            <p className="text-accent text-xs font-bold uppercase tracking-widest">"{opt.catchphrase}"</p>
                          </div>
                        </div>
                        <CardContent className="pt-6 space-y-4">
                          <p className="text-sm italic text-zinc-300">{opt.personality}</p>
                          <Button 
                            className="w-full h-11 bg-white text-black hover:bg-zinc-200"
                            onClick={async () => {
                              await addDoc(collection(db, "characters"), {
                                ...opt, name: charInputs.name, createdAt: new Date().toISOString()
                              });
                              setCharRevealed(false);
                              setStep("studio");
                              toast({ title: "Saved to roster!" });
                            }}
                          >
                            <Save className="w-4 h-4 mr-2" /> Save to Roster
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="studio" className="mt-6 space-y-6">
                <Card className="bg-zinc-900 border-white/5">
                  <CardHeader><CardTitle>Workshop</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {savedChars.map((char) => (
                        <button key={char.id} onClick={() => setSelectedChar(char)} className="flex-shrink-0 flex flex-col items-center gap-2">
                          <div className={`w-16 h-16 rounded-full border-2 overflow-hidden ${selectedChar?.id === char.id ? 'border-primary' : 'border-white/10 opacity-50'}`}>
                            <Image src={char.imageUrl} alt="Roster" width={64} height={64} className="object-cover" />
                          </div>
                          <span className="text-[10px] font-bold text-white">{char.name}</span>
                        </button>
                      ))}
                    </div>
                    {selectedChar?.personality && (
                      <div className="p-4 bg-black/50 border border-white/5 rounded-xl space-y-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-primary">Personality:</h3>
                        <p className="text-xs text-zinc-300 italic">{selectedChar.personality}</p>
                      </div>
                    )}
                    <RadioGroup value={contentType} onValueChange={(v) => setContentType(v as any)} className="grid grid-cols-2 gap-4">
                      <Label htmlFor="v-inf" className="cursor-pointer border-2 border-white/5 bg-black p-4 rounded-xl flex flex-col items-center peer-data-[state=checked]:border-primary">
                        <RadioGroupItem value="video" id="v-inf" className="sr-only" /><VideoIcon className="mb-2" /><span>Video</span>
                      </Label>
                      <Label htmlFor="p-inf" className="cursor-pointer border-2 border-white/5 bg-black p-4 rounded-xl flex flex-col items-center peer-data-[state=checked]:border-primary">
                        <RadioGroupItem value="photo" id="p-inf" className="sr-only" /><ImageIcon className="mb-2" /><span>Photo Set</span>
                      </Label>
                    </RadioGroup>
                    <textarea 
                      placeholder="Director's Notes..." 
                      className="w-full bg-black border border-white/10 rounded-md p-3 text-sm min-h-[100px]"
                      value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)}
                    />
                    <Button className="w-full bg-primary font-black h-14" onClick={handleGenerateInfluencerContent} disabled={isGenerating || !selectedChar}>
                      {isGenerating ? <Loader2 className="animate-spin" /> : <Rocket className="mr-2" />} Render AI Content
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="bg-zinc-900 border-white/5">
              <CardHeader>
                <CardTitle className="text-accent flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6" /> Product Studio
                </CardTitle>
                <CardDescription>Generate viral marketing assets for your products.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">Product Image</Label>
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-white/10 rounded-2xl bg-black/40 hover:bg-black/60 transition-colors">
                    {productInputs.productImage ? (
                      <div className="relative w-full aspect-square max-w-[200px] rounded-2xl overflow-hidden border-4 border-white/5 shadow-2xl group">
                        <Image src={productInputs.productImage} alt="Product preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-10 w-10 rounded-full"
                            onClick={() => setProductInputs(prev => ({ ...prev, productImage: null }))}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Label htmlFor="product-upload" className="cursor-pointer flex flex-col items-center gap-3 py-4 w-full">
                        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent ring-8 ring-accent/5">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black text-white uppercase italic">Upload Product Shot</p>
                          <p className="text-[10px] text-zinc-500 font-medium">JPG, PNG up to 2MB</p>
                        </div>
                        <input id="product-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </Label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Product Name</Label>
                    <input 
                      placeholder="e.g. Hydro-Mist 500" 
                      className="w-full bg-black border border-white/10 rounded-md p-2 text-sm text-white"
                      value={productInputs.productName}
                      onChange={(e) => setProductInputs({...productInputs, productName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Category</Label>
                    <Select value={productInputs.category} onValueChange={(v) => setProductInputs({...productInputs, category: v})}>
                      <SelectTrigger className="bg-black border-white/10 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        <SelectItem value="Skincare">Skincare</SelectItem>
                        <SelectItem value="Beauty">Beauty & Cosmetics</SelectItem>
                        <SelectItem value="Tech Accessories">Tech Accessories</SelectItem>
                        <SelectItem value="Apparel">Apparel & Fashion</SelectItem>
                        <SelectItem value="Smart Home">Smart Home</SelectItem>
                        <SelectItem value="Fitness">Fitness & Wellness</SelectItem>
                        <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                        <SelectItem value="Gaming">Gaming Gear</SelectItem>
                        <SelectItem value="Pet Care">Pet Care</SelectItem>
                        <SelectItem value="Travel">Travel & Lifestyle</SelectItem>
                        <SelectItem value="Education">Education & Courses</SelectItem>
                        <SelectItem value="Other">Other (Custom Category)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {productInputs.category === "Other" && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-zinc-400 flex items-center gap-2">
                      <Type className="w-4 h-4 text-accent" /> Custom Category Name
                    </Label>
                    <input 
                      placeholder="e.g. Sustainable Jewelry" 
                      className="w-full bg-black border border-accent/30 rounded-md p-2 text-sm text-white focus:ring-accent"
                      value={productInputs.customCategory}
                      onChange={(e) => setProductInputs({...productInputs, customCategory: e.target.value})}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-zinc-400">Marketing Hook / Description</Label>
                  <textarea 
                    placeholder="What makes this product special?" 
                    className="w-full bg-black border border-white/10 rounded-md p-3 text-sm min-h-[80px] text-white"
                    value={productInputs.description}
                    onChange={(e) => setProductInputs({...productInputs, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <Label className="text-zinc-400">Target Audience</Label>
                    <input 
                      placeholder="e.g. Gen Z Creators" 
                      className="w-full bg-black border border-white/10 rounded-md p-2 text-sm text-white"
                      value={productInputs.targetAudience}
                      onChange={(e) => setProductInputs({...productInputs, targetAudience: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Format</Label>
                    <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
                      <SelectTrigger className="bg-black border-white/10 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        <SelectItem value="video">Promotional Video</SelectItem>
                        <SelectItem value="photo">Ad Photo Set</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full bg-accent text-black font-black h-14" onClick={handleGenerateMarketing} disabled={isGenerating}>
                   {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />} Launch Marketing Studio
                </Button>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="space-y-6 animate-in zoom-in-95">
            <div className={`relative ${generatedResult.type === 'video' ? 'aspect-[9/16]' : 'aspect-[1/1]'} w-full max-w-sm mx-auto`}>
              {generatedResult.type === 'video' ? (
                <video src={generatedResult.mediaUrls[0]} controls autoPlay loop className="rounded-3xl border-8 border-zinc-800 shadow-2xl w-full h-full object-cover" />
              ) : (
                <Carousel className="w-full">
                  <CarouselContent>
                    {generatedResult.mediaUrls.map((url, i) => (
                      <CarouselItem key={i}>
                        <div className="relative aspect-[1/1] rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
                          <Image src={url} alt="Marketing" fill className="object-cover" />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              )}
            </div>

            <Card className="bg-zinc-900 border-white/5">
              <CardContent className="pt-6 space-y-4">
                {generatedResult.headline && (
                  <h3 className="text-xl font-black text-accent uppercase italic">{generatedResult.headline}</h3>
                )}
                <p className="text-sm italic text-zinc-200 bg-black p-4 rounded-xl border border-white/5">{generatedResult.caption}</p>
                {generatedResult.hooks && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Viral Hooks</p>
                    {generatedResult.hooks.map((h, i) => (
                      <div key={i} className="text-xs bg-white/5 p-2 rounded border border-white/5 italic">{h}</div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="border-white/10 bg-black h-12 rounded-xl text-white" onClick={() => {
                    toast({ title: "Media Saved", description: "The content has been added to your local gallery." });
                  }}>
                    <Download className="w-4 h-4 mr-2" /> Save Media
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-accent text-black hover:bg-accent/80 font-black h-12 uppercase italic rounded-xl">
                        <Share2 className="w-4 h-4 mr-2" /> Direct Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-white/10 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase italic">Social Sync</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                          Post this creation directly to your connected accounts.
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
                        <div className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/5">
                          <div className="flex items-center gap-3">
                            <Twitter className="w-6 h-6 text-blue-400" />
                            <span className="font-bold">X (Twitter)</span>
                          </div>
                          <Button size="sm" variant="outline" className="text-[10px] font-black uppercase border-primary/40 text-primary">Post Now</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/5">
                          <div className="flex items-center gap-3">
                            <Facebook className="w-6 h-6 text-blue-600" />
                            <span className="font-bold">Facebook</span>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="border-white/10" onClick={() => setGeneratedResult(null)}><RefreshCcw className="w-4 h-4 mr-2" /> Redo</Button>
                  <Button className="bg-primary font-black" onClick={finalizeAndPost}><CheckCircle2 className="w-4 h-4 mr-2" /> Finalize & Post</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Navigation />
    </main>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <CreatePageContent />
    </Suspense>
  );
}
