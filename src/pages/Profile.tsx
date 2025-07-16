import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Upload, Save } from "lucide-react";
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
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    linkedin: ''
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
      // Using direct SQL query since types haven't been regenerated yet
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
          linkedin: profileData.linkedin || ''
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
        linkedin: formData.linkedin || null
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

      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully."
      });

      fetchProfile();
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
      const updatedData = { ...formData, avatar_url: publicUrl };
      
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
            avatar_url: publicUrl
          });

        if (error) throw error;
      }

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully."
      });

      fetchProfile();
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background bg-subtle-grid bg-grid flex items-center justify-center">
        <div className="text-text-elegant">Loading...</div>
      </div>
    );
  }

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
              Profile
            </h1>
            <p className="text-text-elegant text-lg font-light leading-relaxed">
              Manage your profile and social links
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Picture Section */}
          <Card className="border-subtle-border bg-card backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground font-light text-xl">
                <User className="h-6 w-6 text-elegant-accent" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white">
                    {(formData.username || user.email)?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-foreground/70 mb-4">Upload a profile picture to personalize your account</p>
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
                      className="border-border hover:border-primary/30 font-light"
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

          {/* Profile Information */}
          <Card className="border-subtle-border bg-card backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground font-light text-xl">
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="email" className="text-foreground/80">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ''}
                    disabled
                    className="bg-muted/30 border-border/30"
                  />
                </div>
                
                <div>
                  <Label htmlFor="username" className="text-foreground/80">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter your username"
                    className="border-border/30 focus:border-primary/50"
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-foreground/80">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="border-border/30 focus:border-primary/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="border-subtle-border bg-card backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground font-light text-xl">
                Social Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="website" className="text-foreground/80">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="border-border/30 focus:border-primary/50"
                />
              </div>

              <div>
                <Label htmlFor="github" className="text-foreground/80">GitHub</Label>
                <Input
                  id="github"
                  value={formData.github}
                  onChange={(e) => handleInputChange('github', e.target.value)}
                  placeholder="https://github.com/username"
                  className="border-border/30 focus:border-primary/50"
                />
              </div>

              <div>
                <Label htmlFor="twitter" className="text-foreground/80">Twitter</Label>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/username"
                  className="border-border/30 focus:border-primary/50"
                />
              </div>

              <div>
                <Label htmlFor="linkedin" className="text-foreground/80">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="border-border/30 focus:border-primary/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primary/90 font-light"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
            <Button 
              onClick={() => navigate('/my-projects')}
              variant="outline"
              className="flex-1 border-border hover:border-primary/30 font-light"
            >
              View My Projects
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}