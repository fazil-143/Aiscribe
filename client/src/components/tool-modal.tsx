import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Loader2,
  Info,
  Star,
  Copy,
  RefreshCw,
  Save,
  Share2,
} from "lucide-react";
import { FaLinkedin, FaTwitter, FaReddit } from "react-icons/fa";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

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

const socialPlatforms = [
  { id: "linkedin", name: "LinkedIn", icon: FaLinkedin },
  { id: "twitter", name: "X (Twitter)", icon: FaTwitter },
  { id: "reddit", name: "Reddit", icon: FaReddit },
];

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

      if (res.status === 403 && data.message === "Daily generation limit reached") {
        toast({
          variant: "destructive",
          title: "Generation Limit Reached",
          description:
            "You've reached your daily limit of 3 generations. Upgrade to premium for unlimited generations.",
        });
        setStatus("input");
        return;
      }

      setGeneratedContent(data.content);
      setStatus("result");

      // Invalidate user query to refresh rate limit
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      const firstLine = data.content.split("\n")[0].replace(/^#+\s*/, "");
      setSaveTitle(
        (
          tool.name +
          " - " +
          (firstLine.length > 30 ? firstLine.substring(0, 30) + "..." : firstLine)
        ).trim()
      );
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

  const handleShare = (platform: string) => {
    if (!generatedContent) return;

    const shareUrl = getShareUrl(platform, generatedContent, saveTitle);
    window.open(shareUrl, "_blank");
    
    toast({
      title: "Shared",
      description: `Content shared to ${socialPlatforms.find(p => p.id === platform)?.name}`,
    });
  };

  const getShareUrl = (platform: string, content: string, title: string) => {
    const encodedContent = encodeURIComponent(content);
    const encodedTitle = encodeURIComponent(title);
    
    switch (platform) {
      case "linkedin":
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedContent}`;
      case "twitter":
        return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedContent}`;
      case "reddit":
        return `https://www.reddit.com/submit?title=${encodedTitle}&text=${encodedContent}`;
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedContent}`;
      default:
        return "";
    }
  };

  const availablePlatforms = user?.premium 
    ? socialPlatforms 
    : socialPlatforms.slice(0, 1);

  const canGenerate =
    !user?.premium && user?.dailyGenerations
      ? user.dailyGenerations < 3
      : true;
  const generationsLeft = user?.premium
    ? "∞"
    : user?.dailyGenerations
    ? 3 - user.dailyGenerations
    : 3;

  const handleClose = () => {
    // Always refresh data after modal closes
    queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
    if (user?.premium) {
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                      You have {generationsLeft}{" "}
                      {generationsLeft === 1 ? "generation" : "generations"} left today.
                      Upgrade to Premium for unlimited access.
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
              <p className="text-slate-500 dark:text-slate-400">
                This may take a few moments
              </p>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <h3 className="text-lg font-medium">Generated Content</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Share content"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {availablePlatforms.map((platform) => (
                        <DropdownMenuItem
                          key={platform.id}
                          onClick={() => handleShare(platform.id)}
                          className="flex items-center"
                        >
                          <platform.icon className="mr-2 h-4 w-4" />
                          {platform.name}
                        </DropdownMenuItem>
                      ))}
                      {!user?.premium && (
                        <DropdownMenuItem
                          className="text-primary"
                          onClick={() => {
                            window.location.href = "#pricing";
                            handleClose();
                          }}
                        >
                          <Star className="mr-2 h-4 w-4" />
                          Upgrade to share on all platforms
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatus("input")}
                    title="Generate new content"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              <div className="prose max-w-none dark:prose-invert max-h-[60vh] overflow-y-auto">
                {generatedContent.split("\n").map((line, i) => {
                  if (line.startsWith("# ")) {
                    return <h1 key={i}>{line.substring(2)}</h1>;
                  } else if (line.startsWith("## ")) {
                    return <h2 key={i}>{line.substring(3)}</h2>;
                  } else if (line.startsWith("### ")) {
                    return <h3 key={i}>{line.substring(4)}</h3>;
                  } else if (line.startsWith("#### ")) {
                    return <h4 key={i}>{line.substring(5)}</h4>;
                  } else if (line.match(/^\d+\.\s/)) {
                    return <p key={i}>{line}</p>;
                  } else if (line.startsWith("-")) {
                    return <p key={i}>{line}</p>;
                  } else if (!line) {
                    return <br key={i} />;
                  } else {
                    return <p key={i}>{line}</p>;
                  }
                })}
              </div>

              {user?.premium && (
                <div className="space-y-4">
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="saveTitle">Save Title</Label>
                      <Input
                        id="saveTitle"
                        value={saveTitle}
                        onChange={(e) => setSaveTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="saveTags">Tags (comma-separated)</Label>
                      <Input
                        id="saveTags"
                        value={saveTags}
                        onChange={(e) => setSaveTags(e.target.value)}
                        placeholder="e.g. marketing, blog, social"
                      />
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSave}
                    disabled={!saveTitle.trim()}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Generation
                  </Button>
                </div>
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
              <Button onClick={handleGenerate} disabled={!canGenerate || !prompt.trim()}>
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



