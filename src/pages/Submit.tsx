
import { useState, useEffect } from "react";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ImageUpload } from "@/components/ImageUpload";

const submitSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  link: z.string().url("Please enter a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters").max(200, "Description must be under 200 characters"),
  story: z.string().min(20, "Story must be at least 20 characters"),
  deeperStory: z.string().optional(),
  tools: z.array(z.string()).min(1, "Please select at least one AI tool"),
  allowsContact: z.boolean(),
  creatorName: z.string().min(2, "Creator name must be at least 2 characters")
});

type SubmitForm = z.infer<typeof submitSchema>;

const aiTools = [
  "Claude", "GPT-4", "GPT-3.5", "Gemini", "Anthropic API", "OpenAI API",
  "Midjourney", "DALL-E", "Stable Diffusion", "GitHub Copilot", 
  "Cursor", "Replit", "v0", "Lovable", "Other"
];

export default function Submit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);

  const form = useForm<SubmitForm>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      name: "",
      link: "",
      description: "",
      story: "",
      deeperStory: "",
      tools: [],
      allowsContact: true,
      creatorName: ""
    }
  });

  // Auto-populate creator name from profile
  useEffect(() => {
    if (profile?.username) {
      form.setValue("creatorName", profile.username);
    } else if (user?.email) {
      // Fallback to email username part
      const emailUsername = user.email.split('@')[0];
      form.setValue("creatorName", emailUsername);
    }
  }, [profile, user, form]);

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

  const onSubmit = async (data: SubmitForm) => {
    console.log('Submit function called with data:', data);
    console.log('Current user:', user);
    console.log('Selected tools:', selectedTools);
    console.log('Screenshots:', screenshots);
    
    if (!user) {
      console.log('No user found, redirecting to auth');
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a project",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    try {
      console.log('Submitting project with data:', {
        user_id: user.id,
        name: data.name,
        creator_name: data.creatorName,
        tools: data.tools,
        screenshots
      });

      const { error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            name: data.name,
            link: data.link,
            description: data.description,
            story: data.story,
            deeper_story: data.deeperStory || null,
            tools: data.tools,
            allows_contact: data.allowsContact,
            email: user.email || '',
            creator_name: data.creatorName,
            screenshots,
            status: 'pending'
          }
        ]);

      if (error) {
        console.error('Submission error:', error);
        toast({
          title: "Error",
          description: "Failed to submit project. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Project Submitted! 🎉",
        description: "Your story has been submitted for review. We'll get back to you within 48 hours.",
      });
      navigate("/my-projects");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden">
      <Button 
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="md:hidden fixed top-14 left-3 z-50 h-8 w-8 p-0 bg-background/90 backdrop-blur-sm border border-border/30 rounded-lg shadow-md hover:shadow-lg hover:bg-accent/20 transition-all duration-300"
      >
        <ArrowLeft className="h-4 w-4 text-muted-foreground" />
      </Button>
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      {/* Subtle Spotlight Effect
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="w-[900px] h-[700px] rounded-full blur-3xl animate-spotlight"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.03) 50%, transparent 100%)'
          }}
        ></div>
        <div 
          className="absolute w-[600px] h-[400px] rounded-full blur-2xl animate-spotlight"
          style={{
            background: 'radial-gradient(circle, hsl(var(--elegant-accent) / 0.04) 0%, hsl(var(--elegant-accent) / 0.02) 50%, transparent 100%)',
            animationDelay: '2s'
          }}
        ></div>
      </div> */}
      
      <div className="relative container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 lg:py-10 max-w-4xl">
        {/* Compact Header Bar - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          {/* Mobile Header Bar */}
          <div className="md:hidden flex items-center justify-between mb-5 sm:mb-6">
            <div className="w-10"></div> {/* Spacer for centering */}
            
            <h1 className="font-['Playfair_Display'] text-xl sm:text-2xl font-normal bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
              Share Story
            </h1>
            
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
          
          {/* Desktop Header */}
          <div className="hidden md:block text-center mb-8 sm:mb-12">
            <div className="flex flex-col items-center space-y-6 lg:space-y-8">
              <h1 className="font-['Playfair_Display'] text-[2.5rem] xl:text-[3rem] 2xl:text-[3.5rem] font-normal leading-[1.2] bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
                Share Your Story
              </h1>
              {/* Divider */}
              <div className="w-8 lg:w-10 h-px bg-gradient-to-r from-[#f6d365] via-[#fda085] to-[#f6d365]"></div>
              {/* Subtitle */}
              <p className="text-sm lg:text-base text-foreground/70 max-w-[650px] font-extralight leading-[1.8] tracking-[0.3px]">
                Tell us about your AI-powered creation and the journey behind it
              </p>
            </div>
          </div>
        </div>

        <Card className="group relative overflow-hidden border-border/50 hover:border-white/20 transition-all duration-300 bg-card/90 backdrop-blur-sm">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f6d365]/3 via-transparent to-[#fda085]/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <CardHeader className="relative px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8">
            <CardTitle className="flex items-center gap-3 text-foreground font-light text-lg sm:text-xl">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] rounded-lg flex items-center justify-center shadow-sm">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              Project Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="relative px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
            <Form {...form}>
              <form onSubmit={(e) => {
                console.log('Form submit event triggered');
                console.log('Form validation state:', form.formState.isValid);
                console.log('Form errors:', form.formState.errors);
                form.handleSubmit(onSubmit)(e);
              }} className="space-y-4 sm:space-y-6 md:space-y-8">
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-light text-sm sm:text-base text-foreground/90">Project Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="My Amazing AI App" 
                            {...field} 
                            className="border-white/20 focus:border-[#f6d365]/50 focus:ring-[#f6d365]/10 bg-background/60 backdrop-blur-sm font-light rounded-xl transition-all duration-300"
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
                        <FormLabel className="font-light text-sm sm:text-base text-foreground/90">Project URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://myapp.com" 
                            {...field} 
                            className="border-white/20 focus:border-[#f6d365]/50 focus:ring-[#f6d365]/10 bg-background/60 backdrop-blur-sm font-light rounded-xl transition-all duration-300"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Creator Name */}
                <FormField
                  control={form.control}
                  name="creatorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-light text-sm sm:text-base text-foreground/90">Creator Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          {...field} 
                          className="border-white/20 focus:border-[#f6d365]/50 focus:ring-[#f6d365]/10 bg-background/60 backdrop-blur-sm font-light rounded-xl transition-all duration-300"
                        />
                      </FormControl>
                      <FormDescription className="font-light text-muted-foreground text-sm">
                        This will be displayed as the project creator
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-light text-sm sm:text-base text-foreground/90">Brief Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A one-line description of what your app does..."
                          className="border-white/20 focus:border-[#f6d365]/50 focus:ring-[#f6d365]/10 bg-background/60 backdrop-blur-sm min-h-[80px] font-light rounded-xl transition-all duration-300"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="font-light text-muted-foreground text-sm">
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
                      <FormLabel className="font-light text-sm sm:text-base text-foreground/90">Your Story (Required)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Why did you build this? What problem were you solving? What was your 'aha' moment?..."
                          className="border-white/20 focus:border-[#f6d365]/50 focus:ring-[#f6d365]/10 bg-background/60 backdrop-blur-sm min-h-[120px] font-light rounded-xl transition-all duration-300"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="font-light text-muted-foreground text-sm">
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
                      <FormLabel className="font-light text-sm sm:text-base text-foreground/90">Deeper Story (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share more details about your build process, challenges faced, iterations, learnings..."
                          className="border-white/20 focus:border-[#f6d365]/50 focus:ring-[#f6d365]/10 bg-background/60 backdrop-blur-sm min-h-[160px] font-light rounded-xl transition-all duration-300"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="font-light text-muted-foreground text-sm">
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
                      <FormLabel className="font-light text-sm sm:text-base text-foreground/90">AI Tools Used</FormLabel>
                      <div className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
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
                              className={`text-xs sm:text-sm rounded-xl transition-all duration-300 ${
                                selectedTools.includes(tool) 
                                  ? "bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#fda085] hover:to-[#f6d365] text-gray-900 font-medium shadow-md" 
                                  : "border-white/20 hover:border-[#f6d365]/40 hover:bg-gradient-to-r hover:from-[#f6d365]/5 hover:to-[#fda085]/5 font-light"
                              }`}
                            >
                              {tool}
                            </Button>
                          ))}
                        </div>
                        
                        {/* Custom Tool Input */}
                        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
                          <Input
                            placeholder="Add custom tool..."
                            value={customTool}
                            onChange={(e) => setCustomTool(e.target.value)}
                            className="border-white/20 focus:border-[#f6d365]/50 focus:ring-[#f6d365]/10 bg-background/60 backdrop-blur-sm font-light rounded-xl transition-all duration-300 flex-1"
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
                            className="border-white/20 hover:border-[#f6d365]/40 hover:bg-gradient-to-r hover:from-[#f6d365]/5 hover:to-[#fda085]/5 font-light rounded-xl transition-all duration-300 w-full xs:w-auto"
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
                                className="bg-gradient-to-r from-[#f6d365]/20 to-[#fda085]/20 text-foreground/90 border-[#f6d365]/30 flex items-center gap-1 font-medium rounded-full px-3 py-1"
                              >
                                {tool}
                                <X 
                                  className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors duration-200" 
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



                {/* Contact Preference */}
                <FormField
                  control={form.control}
                  name="allowsContact"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-white/20 p-6 bg-background/40 backdrop-blur-sm">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border-white/30 data-[state=checked]:bg-[#f6d365] data-[state=checked]:border-[#f6d365]"
                        />
                      </FormControl>
                      <div className="space-y-2 leading-none">
                        <FormLabel className="font-light text-sm sm:text-base">
                          Allow others to connect with me
                        </FormLabel>
                        <FormDescription className="font-light text-muted-foreground leading-relaxed text-sm">
                          Show a "Connect with Creator" button on your project. Others can reach out for collaboration, questions, or hiring opportunities.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 pt-6 sm:pt-8">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/")}
                    className="border-2 border-white/20 hover:border-[#f6d365]/40 hover:bg-white/5 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium backdrop-blur-sm rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-white via-[#f6d365] to-[#fda085] hover:from-[#f6d365] hover:via-[#fda085] hover:to-white text-gray-900 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold shadow-xl hover:shadow-2xl hover:shadow-[#fda085]/20 transition-all duration-300 rounded-xl hover:scale-105"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Submit for Review
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
