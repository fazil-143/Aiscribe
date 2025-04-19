import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { FaLinkedin, FaTwitter, FaReddit } from "react-icons/fa";

interface SocialShareProps {
  content: string;
  title: string;
}

const socialPlatforms = [
  { id: "linkedin", name: "LinkedIn", icon: FaLinkedin },
  { id: "twitter", name: "X (Twitter)", icon: FaTwitter },
  { id: "reddit", name: "Reddit", icon: FaReddit },
];

export default function SocialShare({ content, title }: SocialShareProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!selectedPlatform) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a platform to share",
      });
      return;
    }

    setIsSharing(true);

    try {
      const shareUrl = getShareUrl(selectedPlatform, content, title);
      window.open(shareUrl, "_blank");
      
      toast({
        title: "Shared",
        description: `Content shared to ${socialPlatforms.find(p => p.id === selectedPlatform)?.name}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to share content",
      });
    } finally {
      setIsSharing(false);
    }
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
      default:
        return "";
    }
  };

  const availablePlatforms = user?.premium 
    ? socialPlatforms 
    : socialPlatforms.slice(0, 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Content</CardTitle>
        <CardDescription>
          {user?.premium 
            ? "Share your content across multiple platforms" 
            : "Free users can share to one platform. Upgrade to premium for full access."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              {availablePlatforms.map((platform) => (
                <SelectItem key={platform.id} value={platform.id}>
                  <div className="flex items-center">
                    <platform.icon className="mr-2 h-4 w-4" />
                    {platform.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleShare} 
            disabled={isSharing || !selectedPlatform}
          >
            {isSharing ? (
              <FaLinkedin className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FaLinkedin className="mr-2 h-4 w-4" />
            )}
            Share
          </Button>
        </div>
        {!user?.premium && (
          <div className="rounded-md bg-primary-50 p-3 dark:bg-primary-900/20">
            <p className="text-sm">
              <span className="font-medium">Free Tier</span>
              <span className="ml-1 text-slate-600 dark:text-slate-400">
                - Limited to one platform
              </span>
            </p>
            <a 
              href="#pricing" 
              className="mt-2 block rounded-md bg-primary py-2 text-center text-sm font-medium text-white hover:bg-primary-600"
            >
              Upgrade to Premium
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 