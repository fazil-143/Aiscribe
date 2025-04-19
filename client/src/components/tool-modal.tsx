import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Info, Star, Copy, RefreshCw, Save } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
  } | null;
}

export default function ToolModal({ isOpen, onClose, tool }: ToolModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Standard");
  const [status, setStatus] = useState<"input" | "loading" | "result">("input");
  const [generatedContent, setGeneratedContent] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [saveTags, setSaveTags] = useState("");
  
  // Reset form when modal closes or tool changes
  useEffect(() => {
    if (tool) {
      setSaveTitle(tool.name + " - " + new Date().toLocaleDateString());
    }
    
    if (!isOpen) {
      setTimeout(() => {
        setPrompt("");
        setTone("Professional");
        setLength("Standard");
        setStatus("input");
        setGeneratedContent("");
        setSaveTitle("");
        setSaveTags("");
      }, 300);
    }
  }, [isOpen, tool]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a prompt.",
      });
      return;
    }

    if (!tool) return;

    setStatus("loading");

    try {
      const res = await apiRequest("POST", "/api/generate", {
        prompt,
        toolId: tool.id,
        tone,
        length,
      });

      const data = await res.json();
      setGeneratedContent(data.content);
      setStatus("result");

      // Update the title with the first line of the content or first 30 chars
      const firstLine = data.content.split("\n")[0].replace(/^#+\s*/, ""); // Remove markdown headings
      setSaveTitle((tool.name + " - " + (firstLine.length > 30 ? firstLine.substring(0, 30) + "..." : firstLine)).trim());
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate content. Please try again.",
      });
      setStatus("input");
    }
  };

  const handleSave = async () => {
    if (!tool || !user || !user.premium) return;

    try {
      await apiRequest("POST", "/api/generations", {
        toolId: tool.id,
        prompt,
        output: generatedContent,
        title: saveTitle,
        tags: saveTags,
      });

      toast({
        title: "Saved",
        description: "Your generation has been saved successfully.",
      });

      // Invalidate generations query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
      
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Failed to save generation. Please try again.",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied",
      description: "Content copied to clipboard.",
    });
  };

  const canGenerate = !user?.premium && user?.dailyGenerations ? user.dailyGenerations < 3 : true;
  const generationsLeft = user?.premium ? "∞" : user?.dailyGenerations ? 3 - user.dailyGenerations : 3;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{tool?.name || "AI Tool"}</DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {status === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Your Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe what you'd like to generate..."
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tone">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger id="tone">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                        <SelectItem value="Enthusiastic">Enthusiastic</SelectItem>
                        <SelectItem value="Informative">Informative</SelectItem>
                        <SelectItem value="Humorous">Humorous</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="length">Length</Label>
                    <Select value={length} onValueChange={setLength}>
                      <SelectTrigger id="length">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Brief">Brief</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Detailed">Detailed</SelectItem>
                        <SelectItem value="Comprehensive">Comprehensive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {!user?.premium && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Free Tier Limitation</AlertTitle>
                    <AlertDescription>
                      You have {generationsLeft} {generationsLeft === 1 ? 'generation' : 'generations'} left today. Upgrade to Premium for unlimited access.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </motion.div>
          )}

          {status === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium">Generating content...</h3>
              <p className="text-slate-500 dark:text-slate-400">This may take a few moments</p>
            </motion.div>
          )}

          {status === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Generated Content</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setStatus("input")}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="prose max-w-none dark:prose-invert border border-slate-200 dark:border-slate-700 rounded-md p-4 bg-white dark:bg-slate-900 max-h-96 overflow-y-auto">
                {generatedContent.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={i}>{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={i}>{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={i}>{line.substring(4)}</h3>;
                  } else if (line.startsWith('#### ')) {
                    return <h4 key={i}>{line.substring(5)}</h4>;
                  } else if (line.match(/^\d+\.\s/)) {
                    return <p key={i}>{line}</p>; // Simple handling for numbered lists
                  } else if (line.startsWith('-')) {
                    return <p key={i}>{line}</p>; // Simple handling for bullet points
                  } else if (!line) {
                    return <br key={i} />;
                  } else {
                    return <p key={i}>{line}</p>;
                  }
                })}
              </div>
              
              {user?.premium ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="save-title">Save As</Label>
                    <Input 
                      id="save-title" 
                      value={saveTitle} 
                      onChange={(e) => setSaveTitle(e.target.value)} 
                      placeholder="Enter a title for this generation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="save-tags">Tags (optional)</Label>
                    <Input 
                      id="save-tags" 
                      value={saveTags} 
                      onChange={(e) => setSaveTags(e.target.value)} 
                      placeholder="E.g. blog, marketing, ideas"
                    />
                  </div>
                </div>
              ) : (
                <Alert className="bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800">
                  <Star className="h-4 w-4 text-primary" />
                  <AlertTitle className="text-primary-800 dark:text-primary-300">Save with Premium</AlertTitle>
                  <AlertDescription className="text-primary-700 dark:text-primary-400">
                    Upgrade to Premium to save unlimited generations and access them anytime from your dashboard.
                  </AlertDescription>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="default" asChild>
                      <a href="#pricing" onClick={onClose}>Upgrade Now</a>
                    </Button>
                    <Button size="sm" variant="outline" onClick={onClose}>
                      Not Now
                    </Button>
                  </div>
                </Alert>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter>
          {status === "input" && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleGenerate} 
                disabled={!canGenerate || !prompt.trim()}
              >
                Generate
              </Button>
            </>
          )}
          
          {status === "result" && (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {user?.premium && (
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
