import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, User, Mail, Globe, Github, Twitter, Linkedin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  github: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface Profile {
  id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      bio: "",
      website: "",
      github: "",
      twitter: "",
      linkedin: "",
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      setProfile(data);
      form.reset({
        username: data.username || "",
        bio: data.bio || "",
        website: data.website || "",
        github: data.github || "",
        twitter: data.twitter || "",
        linkedin: data.linkedin || "",
      });
      setAvatarPreview(data.avatar_url || null);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}/avatar.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true });

    if (error) {
      console.error('Avatar upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;

    setLoading(true);
    try {
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      const profileData = {
        user_id: user.id,
        username: data.username,
        bio: data.bio || null,
        avatar_url: avatarUrl || null,
        website: data.website || null,
        github: data.github || null,
        twitter: data.twitter || null,
        linkedin: data.linkedin || null,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) {
        console.error('Profile update error:', error);
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profile Updated! 🎉",
        description: "Your profile has been updated successfully.",
      });

      fetchProfile();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background bg-subtle-grid bg-grid">
      <div className="container mx-auto px-6 py-16 max-w-2xl">
        {/* Header */}
        <div className="mb-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6 text-text-elegant hover:text-foreground font-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <h1 className="text-5xl font-light mb-6 bg-elegant-gradient bg-clip-text text-transparent">
              Your Profile
            </h1>
            <p className="text-text-elegant text-lg font-light leading-relaxed">
              Customize your profile and connect with the community
            </p>
          </div>
        </div>

        <Card className="border-subtle-border bg-card backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-foreground font-light text-xl">
              <User className="h-6 w-6 text-elegant-accent" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-medium overflow-hidden">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.email?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={() => document.getElementById('avatar-input')?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-text-elegant">
                  Click the camera icon to update your profile picture
                </p>
              </div>

              {/* Basic Info */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username" className="font-light">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    {...form.register('username')}
                    className="border-subtle-border focus:border-elegant-accent/50 font-light"
                  />
                  {form.formState.errors.username && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio" className="font-light">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    className="border-subtle-border focus:border-elegant-accent/50 min-h-[100px] font-light"
                    {...form.register('bio')}
                  />
                  {form.formState.errors.bio && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.bio.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-foreground">Social Links</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="website" className="font-light flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      placeholder="https://yourwebsite.com"
                      {...form.register('website')}
                      className="border-subtle-border focus:border-elegant-accent/50 font-light"
                    />
                    {form.formState.errors.website && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.website.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="github" className="font-light flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub Username
                    </Label>
                    <Input
                      id="github"
                      placeholder="yourhandle"
                      {...form.register('github')}
                      className="border-subtle-border focus:border-elegant-accent/50 font-light"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitter" className="font-light flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      Twitter Handle
                    </Label>
                    <Input
                      id="twitter"
                      placeholder="@yourhandle"
                      {...form.register('twitter')}
                      className="border-subtle-border focus:border-elegant-accent/50 font-light"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedin" className="font-light flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Username
                    </Label>
                    <Input
                      id="linkedin"
                      placeholder="yourhandle"
                      {...form.register('linkedin')}
                      className="border-subtle-border focus:border-elegant-accent/50 font-light"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-6 pt-8">
                <Button 
                  type="submit" 
                  className="flex-1 bg-elegant-accent hover:bg-elegant-accent/90 text-background font-light py-3"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </div>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/")}
                  className="border-subtle-border hover:border-elegant-accent/30 font-light"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}