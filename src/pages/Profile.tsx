import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, User, Upload, Save, Globe, Github, Twitter, Linkedin, Palette } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    website: '',
    github: '',
    twitter: '',
    linkedin: '',
    allow_contact: true
  });

  // Update form when profile loads
  useEffect(() => {
    console.log('📝 Profile data changed:', profile);
    
    if (profile) {
      setFormData({
        username: profile.username || '',
        bio: profile.bio || '',
        website: profile.website || '',
        github: profile.github || '',
        twitter: profile.twitter || '',
        linkedin: profile.linkedin || '',
        allow_contact: profile.allow_contact
      });
    }
  }, [profile]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSave = async () => {
    console.log('🔍 SAVE DEBUG - User:', !!user, user?.id);
    console.log('🔍 SAVE DEBUG - Profile:', !!profile, profile?.id);
    console.log('🔍 SAVE DEBUG - Form data:', formData);
    
    if (!user) {
      console.error('❌ SAVE FAILED - No user');
      toast({
        title: "Error",
        description: "Please log in to save your profile.",
        variant: "destructive"
      });
      return;
    }

    // We'll save directly to the database using user.id, regardless of profile state
    setSaving(true);
    
    try {
      console.log('💾 Saving profile updates...');
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username || null,
          bio: formData.bio || null,
          website: formData.website || null,
          github: formData.github || null,
          twitter: formData.twitter || null,
          linkedin: formData.linkedin || null,
          allow_contact: formData.allow_contact
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Profile save error:', error);
        throw error;
      }

      console.log('✅ Profile saved successfully');
      
      // Refresh the profile data
      await refreshProfile();
      
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      console.error('❌ Profile save failed:', error);
      toast({
        title: "Error",
        description: `Failed to save profile: ${error.message}`,
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
      console.log('📸 Uploading avatar...');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('❌ Avatar upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      console.log('📸 Avatar uploaded, updating profile...');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('❌ Profile avatar update error:', updateError);
        throw updateError;
      }

      console.log('✅ Avatar updated successfully');
      
      // Refresh the profile data
      await refreshProfile();
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully."
      });
    } catch (error) {
      console.error('❌ Avatar upload failed:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          {/* Mobile Header Bar */}
          <div className="md:hidden mb-4">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-3 mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/")}
                  className="text-muted-foreground hover:text-[#fda085] transition-colors duration-200 p-2 -ml-2"
                  size="sm"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                
                <h1 className="font-['Playfair_Display'] text-2xl font-normal bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
                  Profile
                </h1>
              </div>
            </div>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden md:block text-center">
            <div className="flex flex-col items-center space-y-6 lg:space-y-8">
              <h1 className="font-['Playfair_Display'] text-[2.5rem] xl:text-[3rem] 2xl:text-[3.5rem] font-normal leading-[1.2] bg-gradient-to-br from-white via-[#f6d365] to-[#fda085] bg-clip-text text-transparent tracking-[0.01em]">
                Profile
              </h1>
              {/* Divider */}
              <div className="w-8 lg:w-10 h-px bg-gradient-to-r from-[#f6d365] via-[#fda085] to-[#f6d365]"></div>
              {/* Subtitle */}
              <p className="text-sm lg:text-base text-foreground/70 max-w-[650px] font-extralight leading-[1.8] tracking-[0.3px]">
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
                    placeholder="github.com/username"
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
                    placeholder="@username"
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
                    placeholder="linkedin.com/in/username"
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
                  <User className="h-3 w-3 text-white" />
                </div>
                Contact Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground/80 text-sm font-medium">Allow Contact</Label>
                  <p className="text-foreground/60 text-xs mt-1">Allow other users to contact you about your projects</p>
                </div>
                <Switch
                  checked={formData.allow_contact}
                  onCheckedChange={(checked) => handleInputChange('allow_contact', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[#f6d365] to-[#fda085] hover:from-[#f6d365]/90 hover:to-[#fda085]/90 text-white font-medium px-8 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}