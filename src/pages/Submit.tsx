import { useState } from "react";
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

const submitSchema = z.object({
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

type SubmitForm = z.infer<typeof submitSchema>;

const aiTools = [
  "Claude", "GPT-4", "GPT-3.5", "Gemini", "Anthropic API", "OpenAI API",
  "Midjourney", "DALL-E", "Stable Diffusion", "GitHub Copilot", 
  "Cursor", "Replit", "v0", "Lovable", "Other"
];

export default function Submit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [customTool, setCustomTool] = useState("");

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
      email: "",
      creatorName: ""
    }
  });

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

  const onSubmit = (data: SubmitForm) => {
    console.log("Submission data:", data);
    toast({
      title: "Project Submitted! 🎉",
      description: "Your story has been submitted for review. We'll get back to you within 48 hours.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background bg-tech-grid bg-grid">
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 bg-artistic-gradient bg-clip-text text-transparent">
              Share Your Story
            </h1>
            <p className="text-muted-foreground text-lg">
              Tell us about your AI-powered creation and the journey behind it
            </p>
          </div>
        </div>

        <Card className="border-gallery-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-tech-glow" />
              Project Submission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="My Amazing AI App" 
                            {...field} 
                            className="border-gallery-border focus:border-tech-glow"
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
                        <FormLabel>Project URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://myapp.com" 
                            {...field} 
                            className="border-gallery-border focus:border-tech-glow"
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
                      <FormLabel>Brief Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A one-line description of what your app does..."
                          className="border-gallery-border focus:border-tech-glow min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Keep it concise - this appears on your gallery card
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Story Section */}
                <FormField
                  control={form.control}
                  name="story"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Story (Required)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Why did you build this? What problem were you solving? What was your 'aha' moment?..."
                          className="border-gallery-border focus:border-tech-glow min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
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
                      <FormLabel>Deeper Story (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Share more details about your build process, challenges faced, iterations, learnings..."
                          className="border-gallery-border focus:border-tech-glow min-h-[160px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
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
                      <FormLabel>AI Tools Used</FormLabel>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                                ? "bg-tech-glow text-primary-foreground" 
                                : "border-gallery-border hover:border-tech-glow/50"
                              }
                            >
                              {tool}
                            </Button>
                          ))}
                        </div>
                        
                        {/* Custom Tool Input */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add custom tool..."
                            value={customTool}
                            onChange={(e) => setCustomTool(e.target.value)}
                            className="border-gallery-border focus:border-tech-glow"
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
                            className="border-gallery-border hover:border-tech-glow/50"
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
                                className="bg-secondary/50 text-secondary-foreground flex items-center gap-1"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="creatorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Doe" 
                            {...field} 
                            className="border-gallery-border focus:border-tech-glow"
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="john@example.com" 
                            type="email"
                            {...field} 
                            className="border-gallery-border focus:border-tech-glow"
                          />
                        </FormControl>
                        <FormDescription>
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
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gallery-border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Allow others to connect with me
                        </FormLabel>
                        <FormDescription>
                          Show a "Connect with Creator" button on your project. Others can reach out for collaboration, questions, or hiring opportunities.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground animate-tech-glow"
                  >
                    Submit for Review
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/")}
                    className="border-gallery-border hover:border-tech-glow/50"
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