import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Info, Search, Copy, Edit, Eye, Trash2, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ToolModal from "@/components/tool-modal";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { formatRelative } from "date-fns";
import SocialShare from "@/components/social-share";
import { Tool, Generation } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tools");
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);

  // Fetch tools
  const { data: tools = [] } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
  });

  // Fetch user's saved generations if premium
  const { 
    data: generations = [], 
    isLoading: generationsLoading,
    isError: generationsError,
    refetch: refetchGenerations
  } = useQuery<Generation[]>({
    queryKey: ["/api/generations"],
    enabled: user?.premium === true,
  });

  const handleOpenTool = (tool: Tool) => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    if (!user.premium && (user.dailyGenerations ?? 0) >= 3) {
      toast({
        variant: "destructive",
        title: "Generation Limit Reached",
        description: "You've reached your daily limit of 3 generations. Upgrade to premium for unlimited generations.",
      });
      return;
    }

    setSelectedTool(tool);
    setToolModalOpen(true);
  };

  const handleDeleteGeneration = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/generations/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
      toast({
        title: "Deleted",
        description: "Generation has been deleted successfully.",
      });
      if (selectedGeneration?.id === id) {
        setSelectedGeneration(null);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Failed to delete generation.",
      });
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Content copied to clipboard.",
    });
  };

  // Format timestamp relative to now
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return formatRelative(date, new Date()).toString();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-3xl">
            <h1 className="text-4xl font-bold mb-2">Your Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Manage and access your generated content</p>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="space-y-6 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <span className="font-medium text-slate-500 dark:text-slate-300">
                        {user?.username.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{user?.username}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {user?.premium ? 'Premium User' : 'Free Tier'}
                      </p>
                    </div>
                  </div>
                  
                  {!user?.premium && (
                    <div className="rounded-md bg-primary-50 p-3 dark:bg-primary-900/20">
                      <p className="text-sm mb-1">
                        <span className="font-medium">Free Tier</span>
                        <span className="ml-1 text-slate-600 dark:text-slate-400">
                          - {user?.dailyGenerations || 0}/3 uses today
                        </span>
                      </p>
                      <Progress 
                        value={((user?.dailyGenerations || 0) * 33.33)} 
                        className="h-2" 
                      />
                      {user?.dailyGenerations && user.dailyGenerations >= 3 ? (
                        <p className="mt-2 text-sm text-red-500">
                          You've reached your daily limit. Upgrade to premium for unlimited generations.
                        </p>
                      ) : (
                        <a href="/pricing" className="mt-3 block rounded-md bg-primary py-2 text-center text-sm font-medium text-white hover:bg-primary-600">
                          Upgrade to Premium
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
                
                <Separator />
                
                <CardHeader>
                  <CardTitle>Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav>
                    <ul className="space-y-1">
                      {tools.map((tool) => (
                        <li key={tool.id}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleOpenTool(tool)}
                            disabled={!user?.premium && (user?.dailyGenerations ?? 0) >= 3}
                          >
                            <div className={`inline-flex h-5 w-5 items-center justify-center rounded-sm bg-${tool.color}-100 mr-2`}>
                              <span className="material-icons text-xs">{tool.icon}</span>
                            </div>
                            {tool.name}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="tools">AI Tools</TabsTrigger>
                  <TabsTrigger value="history" disabled={!user?.premium}>
                    History {!user?.premium && <Info className="ml-1 h-4 w-4" />}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="tools">
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Choose a Tool to Get Started</CardTitle>
                      <CardDescription>
                        Select one of our AI-powered tools to generate content
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {tools.map((tool) => (
                          <motion.div 
                            key={tool.id}
                            whileHover={{ y: -5, boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)" }}
                            className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                          >
                            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-${tool.color}-100 text-${tool.color}-700 dark:bg-${tool.color}-900/20 dark:text-${tool.color}-400`}>
                              <span className="material-icons">{tool.icon}</span>
                            </div>
                            <h3 className="mb-1 font-medium text-gray-900 dark:text-white">{tool.name}</h3>
                            <p className="mb-3 text-sm text-gray-700 dark:text-slate-300">
                              {tool.description}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleOpenTool(tool)}
                              className="w-full"
                              disabled={!user?.premium && (user?.dailyGenerations ?? 0) >= 3}
                            >
                              Use Tool
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history">
                  <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Your History</CardTitle>
                          <CardDescription>
                            View and manage your generated content
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[600px]">
                            {generationsLoading ? (
                              <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin" />
                              </div>
                            ) : generationsError ? (
                              <div className="flex h-full items-center justify-center">
                                <p className="text-red-500">Failed to load history</p>
                              </div>
                            ) : generations.length === 0 ? (
                              <div className="flex h-full items-center justify-center">
                                <p className="text-slate-500">No history yet</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {generations.map((generation) => (
                                  <motion.div
                                    key={generation.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h3 className="font-medium">{generation.title}</h3>
                                        <p className="text-sm text-slate-500">
                                          {formatDate(generation.createdAt)}
                                        </p>
                                      </div>
                                      <div className="flex space-x-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleCopyContent(generation.output)}
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setSelectedGeneration(generation)}
                                        >
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDeleteGeneration(generation.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="lg:col-span-1">
                      {selectedGeneration && (
                        <SocialShare
                          content={selectedGeneration.output}
                          title={selectedGeneration.title}
                        />
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      <ToolModal
        isOpen={toolModalOpen}
        onClose={() => setToolModalOpen(false)}
        tool={selectedTool}
      />
    </div>
  );
}
