import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, User, Upload, Save, Globe, Github, Twitter, Linkedin, Mail, Palette, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  github: string | null;
  twitter: string | null;
  linkedin: string | null;
  allow_contact: boolean;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    website: '',
    github: '',
    twitter: '',
    linkedin: '',
    allow_contact: true
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        const profileData = data as any as Profile;
        setProfile(profileData);
        setFormData({
          username: profileData.username || '',
          bio: profileData.bio || '',
          website: profileData.website || '',
          github: profileData.github || '',
          twitter: profileData.twitter || '',
          linkedin: profileData.linkedin || '',
          allow_contact: profileData.allow_contact !== false
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const profileData = {
        user_id: user.id,
        username: formData.username || null,
        bio: formData.bio || null,
        website: formData.website || null,
        github: formData.github || null,
        twitter: formData.twitter || null,
        linkedin: formData.linkedin || null,
        allow_contact: formData.allow_contact
      };

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles' as any)
          .update(profileData)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('profiles' as any)
          .insert(profileData);

        if (error) throw error;
      }

      // Fetch the updated profile to get the latest data
      await fetchProfile();
      
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully."
      });

      await refreshProfile();
      
      // Trigger profile update event for other components  
      window.dispatchEvent(new CustomEvent('profile-updated'));
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      if (profile) {
        const { error } = await supabase
          .from('profiles' as any)
          .update({ avatar_url: publicUrl })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profiles' as any)
          .insert({
            user_id: user.id,
            username: formData.username || null,
            bio: formData.bio || null,
            website: formData.website || null,
            github: formData.github || null,
            twitter: formData.twitter || null,
            linkedin: formData.linkedin || null,
            allow_contact: formData.allow_contact,
            avatar_url: publicUrl
          });

        if (error) throw error;
      }

      // Update local profile state immediately
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully."
      });

      await refreshProfile();
      
      // Trigger profile update event for other components
      window.dispatchEvent(new CustomEvent('profile-updated'));
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) return null;

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-foreground/70">Loading your profile...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden">
      {/* Decorative background elements */}
      {/* <div className="absolute inset-0 bg-subtle-grid bg-grid opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
       */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="md:hidden mb-6 sm:mb-8 text-muted-foreground hover:text-[#fda085] hover:bg-gradient-to-r hover:from-[#f6d365]/5 hover:to-[#fda085]/5 transition-all duration-300 font-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="text-center">
            <div className="flex flex-col items-center space-y-6 sm:space-y-8">
              <h1 className="font-['Playfair_Display'] text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] xl:text-[3.25rem] 2xl:text-[3.75rem] font-normal leading-[1.2] bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
                Profile
              </h1>
              {/* Divider */}
              <div className="w-8 sm:w-10 h-px bg-gradient-to-r from-[#f6d365] via-[#fda085] to-[#f6d365]"></div>
              <p className="text-sm sm:text-base lg:text-lg text-foreground/70 max-w-[650px] font-extralight leading-[1.8] tracking-[0.3px] px-4">
                Craft your digital identity and connect with the community
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Profile Picture & Basic Info */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Avatar Section */}
            <Card className="border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300 lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground font-light text-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#f6d365] to-[#fda085] rounded-lg flex items-center justify-center">
                    <Palette className="h-3 w-3 text-white" />
                  </div>
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-6">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 ring-4 ring-[#fda085]/20 group-hover:ring-[#fda085]/40 transition-all duration-300">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] text-white font-semibold">
                        {(formData.username || user.email)?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="text-center">
                    <p className="text-foreground/70 mb-4 text-sm">Upload a profile picture to personalize your account</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload">
                      <Button 
                        variant="outline" 
                        className="border-border/50 hover:border-[#fda085]/50 hover:bg-[#fda085]/10 font-light transition-all duration-200"
                        disabled={uploading}
                        asChild
                      >
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          {uploading ? 'Uploading...' : 'Upload Image'}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-foreground font-light text-lg">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#f6d365] to-[#fda085] rounded-lg flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="email" className="text-foreground/80 text-sm font-medium">Email</Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="bg-muted/30 border-border/30 mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="username" className="text-foreground/80 text-sm font-medium">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Enter your username"
                      className="border-border/30 focus:border-[#fda085]/50 focus:ring-[#fda085]/20 mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-foreground/80 text-sm font-medium">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="border-border/30 focus:border-[#fda085]/50 focus:ring-[#fda085]/20 mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Links */}
          <Card className="border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground font-light text-lg">
                <div className="w-6 h-6 bg-gradient-to-br from-[#f6d365] to-[#fda085] rounded-lg flex items-center justify-center">
                  <Globe className="h-3 w-3 text-white" />
                </div>
                Social Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="website" className="text-foreground/80 text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#fda085]" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="border-border/30 focus:border-[#fda085]/50 focus:ring-[#fda085]/20 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="github" className="text-foreground/80 text-sm font-medium flex items-center gap-2">
                    <Github className="h-4 w-4 text-[#fda085]" />
                    GitHub
                  </Label>
                  <Input
                    id="github"
                    value={formData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    placeholder="https://github.com/username"
                    className="border-border/30 focus:border-[#fda085]/50 focus:ring-[#fda085]/20 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="twitter" className="text-foreground/80 text-sm font-medium flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-[#fda085]" />
                    Twitter
                  </Label>
                  <Input
                    id="twitter"
                    value={formData.twitter}
                    onChange={(e) => handleInputChange('twitter', e.target.value)}
                    placeholder="https://twitter.com/username"
                    className="border-border/30 focus:border-[#fda085]/50 focus:ring-[#fda085]/20 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin" className="text-foreground/80 text-sm font-medium flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-[#fda085]" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="border-border/30 focus:border-[#fda085]/50 focus:ring-[#fda085]/20 mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Settings */}
          <Card className="border-border/30 bg-card/80 backdrop-blur-sm hover:bg-card/90 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground font-light text-lg">
                <div className="w-6 h-6 bg-gradient-to-br from-[#f6d365] to-[#fda085] rounded-lg flex items-center justify-center">
                  <Mail className="h-3 w-3 text-white" />
                </div>
                Contact Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-foreground font-medium">Allow others to message me</Label>
                  <p className="text-sm text-muted-foreground">
                    Let other users send you messages about your projects
                  </p>
                </div>
                <Switch
                  checked={formData.allow_contact}
                  onCheckedChange={(checked) => 
                    handleInputChange('allow_contact', checked)
                  }
                  className="data-[state=checked]:bg-[#fda085]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#fda085] hover:to-[#f6d365] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
            
            <Button 
              onClick={() => navigate('/my-projects')}
              variant="outline"
              className="flex-1 border-2 border-border hover:border-[#fda085] hover:bg-[#fda085]/10 text-foreground font-medium transition-all duration-200 h-12 text-base"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              View My Projects
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}