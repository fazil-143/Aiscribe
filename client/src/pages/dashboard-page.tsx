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

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [toolModalOpen, setToolModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tools");
  const [selectedGeneration, setSelectedGeneration] = useState<any | null>(null);

  // Fetch tools
  const { data: tools } = useQuery({
    queryKey: ["/api/tools"],
  });

  // Fetch user's saved generations if premium
  const { 
    data: generations, 
    isLoading: generationsLoading,
    isError: generationsError,
    refetch: refetchGenerations
  } = useQuery({
    queryKey: ["/api/generations"],
    enabled: user?.premium === true,
  });

  const handleOpenTool = (tool: any) => {
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatRelative(date, new Date());
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
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                          - {3 - (user?.dailyGenerations || 0)}/3 uses today
                        </span>
                      </p>
                      <Progress value={(user?.dailyGenerations || 0) * 33.33} className="h-2" />
                      <a href="#pricing" className="mt-3 block rounded-md bg-primary py-2 text-center text-sm font-medium text-white hover:bg-primary-600">
                        Upgrade to Premium
                      </a>
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
                      {tools?.map((tool: any) => (
                        <li key={tool.id}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => handleOpenTool(tool)}
                          >
                            <div className={`inline-flex h-5 w-5 items-center justify-center rounded-sm bg-${tool.color}-100 mr-2`}>
                              <span className={`material-icons text-${tool.color}-600 text-xs`}>
                                {tool.icon}
                              </span>
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
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {tools?.map((tool: any) => (
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
                            >
                              Use Tool
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {!user?.premium && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Upgrade to Premium</CardTitle>
                        <CardDescription>
                          Get unlimited generations and save your content
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg border border-dashed border-primary p-6 text-center">
                          <h3 className="mb-2 text-lg font-medium">Premium Features</h3>
                          <ul className="mb-4 space-y-2 text-left">
                            <li className="flex items-center">
                              <span className="material-icons mr-2 text-green-500 text-sm">check_circle</span>
                              Unlimited generations
                            </li>
                            <li className="flex items-center">
                              <span className="material-icons mr-2 text-green-500 text-sm">check_circle</span>
                              Save and organize your content
                            </li>
                            <li className="flex items-center">
                              <span className="material-icons mr-2 text-green-500 text-sm">check_circle</span>
                              Higher quality AI outputs
                            </li>
                          </ul>
                          <Button className="w-full" asChild>
                            <a href="#pricing">Upgrade Now</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="history">
                  {user?.premium ? (
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="md:col-span-1">
                        <Card className="h-full">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>Saved Generations</CardTitle>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => refetchGenerations()}
                              >
                                <Loader2 className={`h-4 w-4 ${generationsLoading ? 'animate-spin' : ''}`} />
                              </Button>
                            </div>
                            <div className="relative">
                              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Search generations..."
                                className="pl-8"
                              />
                            </div>
                          </CardHeader>
                          <ScrollArea className="h-[500px]">
                            <CardContent>
                              {generationsLoading ? (
                                <div className="flex h-40 items-center justify-center">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                              ) : generationsError ? (
                                <div className="flex h-40 items-center justify-center text-center">
                                  <p className="text-slate-500">
                                    Error loading generations. Please try again.
                                  </p>
                                </div>
                              ) : generations?.length === 0 ? (
                                <div className="flex h-40 items-center justify-center text-center">
                                  <p className="text-slate-500">
                                    No saved generations yet. Create content with our tools and save it here.
                                  </p>
                                </div>
                              ) : (
                                <AnimatePresence>
                                  <div className="space-y-3">
                                    {generations?.map((generation: any) => (
                                      <motion.div
                                        key={generation.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`cursor-pointer rounded-lg border p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                          selectedGeneration?.id === generation.id
                                            ? "border-primary bg-primary-50 dark:border-primary-700 dark:bg-primary-900/20"
                                            : "border-slate-200 dark:border-slate-700"
                                        }`}
                                        onClick={() => setSelectedGeneration(generation)}
                                      >
                                        <div className="mb-1 flex items-center justify-between">
                                          <h4 className="font-medium line-clamp-1">
                                            {generation.title}
                                          </h4>
                                          <span className="text-xs text-slate-500">
                                            {formatDate(generation.createdAt)}
                                          </span>
                                        </div>
                                        <p className="mb-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                          {generation.prompt}
                                        </p>
                                        {generation.tags && (
                                          <div className="flex flex-wrap gap-1">
                                            {generation.tags.split(',').map((tag: string, i: number) => (
                                              <Badge key={i} variant="secondary" className="text-xs">
                                                {tag.trim()}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </motion.div>
                                    ))}
                                  </div>
                                </AnimatePresence>
                              )}
                            </CardContent>
                          </ScrollArea>
                        </Card>
                      </div>
                      
                      <div className="md:col-span-2">
                        <Card className="h-full">
                          {selectedGeneration ? (
                            <>
                              <CardHeader className="flex-row items-start justify-between space-y-0">
                                <div>
                                  <CardTitle>{selectedGeneration.title}</CardTitle>
                                  <CardDescription>
                                    Created {formatDate(selectedGeneration.createdAt)}
                                  </CardDescription>
                                </div>
                                <div className="flex space-x-2">
                                  <Button variant="outline" size="icon" onClick={() => handleCopyContent(selectedGeneration.output)}>
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="icon" onClick={() => {
                                    const tool = tools?.find((t: any) => t.id === selectedGeneration.toolId);
                                    if (tool) {
                                      handleOpenTool(tool);
                                    }
                                  }}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="icon" onClick={() => handleDeleteGeneration(selectedGeneration.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                                  <Label className="text-xs text-slate-500">Original Prompt</Label>
                                  <p className="text-sm">{selectedGeneration.prompt}</p>
                                </div>
                                <div className="prose max-w-none dark:prose-invert">
                                  {selectedGeneration.output.split('\n').map((line: string, i: number) => {
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
                              </CardContent>
                            </>
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                              <div className="mb-4 rounded-full bg-primary-50 p-3 dark:bg-primary-900/20">
                                <Eye className="h-6 w-6 text-primary" />
                              </div>
                              <h3 className="mb-2 text-lg font-medium">Select a generation</h3>
                              <p className="mb-6 max-w-md text-slate-500">
                                Click on a saved generation from the list to view its content
                              </p>
                              <Button onClick={() => setActiveTab("tools")}>
                                Create New Content <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Premium Feature</CardTitle>
                        <CardDescription>
                          History is available for premium subscribers
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-lg border border-dashed border-primary p-6 text-center">
                          <h3 className="mb-2 text-lg font-medium">Upgrade to Premium</h3>
                          <p className="mb-4 text-slate-600 dark:text-slate-400">
                            Get access to your generation history, unlimited content creation, and more.
                          </p>
                          <Button className="w-full" asChild>
                            <a href="#pricing">Upgrade Now</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
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
