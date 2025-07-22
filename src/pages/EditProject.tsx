
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ImageUpload } from "@/components/ImageUpload";

const editSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  link: z.string().url("Please enter a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters").max(200, "Description must be under 200 characters"),
  story: z.string().min(20, "Story must be at least 20 characters"),
  deeperStory: z.string().optional(),
  tools: z.array(z.string()).min(1, "Please select at least one AI tool"),
  allowsContact: z.boolean(),
  email: z.string().email("Please enter a valid email"),
  creatorName: z.string().min(2, "Creator name must be at least 2 characters")
});

type EditForm = z.infer<typeof editSchema>;

const aiTools = [
  "Claude", "GPT-4", "GPT-3.5", "Gemini", "Anthropic API", "OpenAI API",
  "Midjourney", "DALL-E", "Stable Diffusion", "GitHub Copilot", 
  "Cursor", "Replit", "v0", "Lovable", "Other"
];

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);

  const form = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      link: "",
      description: "",
      story: "",
      deeperStory: "",
      tools: [],
      allowsContact: true,
      email: "",
      creatorName: ""
    }
  });

  useEffect(() => {
    if (id && user) {
      loadProject();
    }
  }, [id, user]);

  const loadProject = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading project:', error);
        toast({
          title: "Error",
          description: "Project not found or you don't have permission to edit it",
          variant: "destructive",
        });
        navigate('/my-projects');
        return;
      }

      // Set form values
      form.reset({
        name: data.name,
        link: data.link,
        description: data.description,
        story: data.story,
        deeperStory: data.deeper_story || "",
        tools: data.tools,
        allowsContact: data.allows_contact,
        email: data.email,
        creatorName: data.creator_name
      });

      setSelectedTools(data.tools);
      setScreenshots(data.screenshots || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTool = (tool: string) => {
    if (!selectedTools.includes(tool)) {
      const newTools = [...selectedTools, tool];
      setSelectedTools(newTools);
      form.setValue("tools", newTools);
    }
  };

  const removeTool = (tool: string) => {
    const newTools = selectedTools.filter(t => t !== tool);
    setSelectedTools(newTools);
    form.setValue("tools", newTools);
  };

  const addCustomTool = () => {
    if (customTool.trim() && !selectedTools.includes(customTool.trim())) {
      addTool(customTool.trim());
      setCustomTool("");
    }
  };

  const onSubmit = async (data: EditForm) => {
    if (!id || !user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: data.name,
          link: data.link,
          description: data.description,
          story: data.story,
          deeper_story: data.deeperStory || null,
          tools: data.tools,
          allows_contact: data.allowsContact,
          email: data.email,
          creator_name: data.creatorName,
          screenshots,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Update error:', error);
        toast({
          title: "Error",
          description: "Failed to update project",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Project Updated! ✨",
        description: "Your project has been successfully updated.",
      });
      navigate('/my-projects');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl">
        <div className="mb-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/my-projects")}
            className="mb-8 text-foreground/70 hover:text-foreground font-light group md:hidden"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to My Projects
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-light bg-elegant-gradient bg-clip-text text-transparent">
                Edit Project
              </h1>
            </div>
            <p className="text-foreground/70 text-lg font-light leading-relaxed max-w-2xl mx-auto">
              Update your project details and story
            </p>
          </div>
        </div>

        <Card className="border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-foreground font-light text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-[#f6d365] to-[#fda085] rounded-lg flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-light text-foreground/80">Project Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="My Amazing AI App" 
                            {...field} 
                            className="border-border/30 focus:border-[#fda085]/50 focus:ring-[#fda085]/20 font-light"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-light text-foreground/80">Project URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://myapp.com" 
                            {...field} 
                            className="border-border/30 focus:border-[#fda085]/50 focus:ring-[#fda085]/20 font-light"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-light text-foreground/80">Brief Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A one-line description of what your app does..."
                          className="border-border/30 focus:border-[#fda085]/50 focus:ring-[#fda085]/20 min-h-[80px] font-light"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="font-light text-muted-foreground">
                        Keep it concise - this appears on your gallery card
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Screenshots */}
                <ImageUpload
                  screenshots={screenshots}
                  onScreenshotsChange={setScreenshots}
                  maxImages={5}
                />

                {/* Story Section */}
                <FormField
                  control={form.control}
                  name="story"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-light">Your Story (Required)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Why did you build this? What problem were you solving? What was your 'aha' moment?..."
                          className="border-subtle-border focus:border-elegant-accent/50 min-h-[120px] font-light"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="font-light text-text-elegant">
                        Share the 'why' behind your project - this is what makes it special
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deeperStory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-light">Deeper Story (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share more details about your build process, challenges faced, iterations, learnings..."
                          className="border-subtle-border focus:border-elegant-accent/50 min-h-[160px] font-light"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="font-light text-text-elegant">
                        For those who want to dive deeper into your journey
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* AI Tools */}
                <FormField
                  control={form.control}
                  name="tools"
                  render={() => (
                    <FormItem>
                      <FormLabel className="font-light">AI Tools Used</FormLabel>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {aiTools.map((tool) => (
                            <Button
                              key={tool}
                              type="button"
                              variant={selectedTools.includes(tool) ? "default" : "outline"}
                              size="sm"
                              onClick={() => 
                                selectedTools.includes(tool) 
                                  ? removeTool(tool)
                                  : addTool(tool)
                              }
                              className={selectedTools.includes(tool) 
                                ? "bg-elegant-accent text-background font-light" 
                                : "border-subtle-border hover:border-elegant-accent/30 font-light"
                              }
                            >
                              {tool}
                            </Button>
                          ))}
                        </div>
                        
                        {/* Custom Tool Input */}
                        <div className="flex gap-3">
                          <Input
                            placeholder="Add custom tool..."
                            value={customTool}
                            onChange={(e) => setCustomTool(e.target.value)}
                            className="border-subtle-border focus:border-elegant-accent/50 font-light"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomTool();
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            onClick={addCustomTool}
                            variant="outline"
                            className="border-subtle-border hover:border-elegant-accent/30 font-light"
                          >
                            Add
                          </Button>
                        </div>

                        {/* Selected Tools */}
                        {selectedTools.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selectedTools.map((tool) => (
                              <Badge 
                                key={tool} 
                                variant="secondary"
                                className="bg-secondary/30 text-secondary-foreground flex items-center gap-1 font-light"
                              >
                                {tool}
                                <X 
                                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                  onClick={() => removeTool(tool)}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Creator Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="creatorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-light">Your Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Doe" 
                            {...field} 
                            className="border-subtle-border focus:border-elegant-accent/50 font-light"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-light">Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="john@example.com" 
                            type="email"
                            {...field} 
                            className="border-subtle-border focus:border-elegant-accent/50 font-light"
                          />
                        </FormControl>
                        <FormDescription className="font-light text-text-elegant">
                          For review updates only
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Preference */}
                <FormField
                  control={form.control}
                  name="allowsContact"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-subtle-border p-6">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-2 leading-none">
                        <FormLabel className="font-light">
                          Allow others to connect with me
                        </FormLabel>
                        <FormDescription className="font-light text-text-elegant leading-relaxed">
                          Show a "Connect with Creator" button on your project. Others can reach out for collaboration, questions, or hiring opportunities.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <div className="flex gap-6 pt-8">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-elegant-accent hover:bg-elegant-accent/90 text-background font-light py-3"
                  >
                    Update Project
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/my-projects")}
                    className="border-subtle-border hover:border-elegant-accent/30 font-light py-3"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
