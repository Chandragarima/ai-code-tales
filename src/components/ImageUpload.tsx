
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ImageUploadProps {
  screenshots: string[];
  onScreenshotsChange: (screenshots: string[]) => void;
  maxImages?: number;
}

export const ImageUpload = ({ screenshots, onScreenshotsChange, maxImages = 5 }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const uploadImage = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload images",
        variant: "destructive",
      });
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('project-screenshots')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('project-screenshots')
      .getPublicUrl(data.path);

    toast({
      title: "Image uploaded",
      description: "Your image has been uploaded successfully.",
    });

    return publicUrl;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (screenshots.length + files.length > maxImages) {
      toast({
        title: "Too many images",
        description: `You can upload maximum ${maxImages} images`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const newScreenshots = [...screenshots];

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select images smaller than 5MB",
          variant: "destructive",
        });
        continue;
      }

      const url = await uploadImage(file);
      if (url) {
        newScreenshots.push(url);
      }
    }

    onScreenshotsChange(newScreenshots);
    setUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = async (index: number) => {
    const imageUrl = screenshots[index];
    
    // Extract file path from URL for deletion
    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const userId = urlParts[urlParts.length - 2];
      const filePath = `${userId}/${fileName}`;
      
      await supabase.storage
        .from('project-screenshots')
        .remove([filePath]);
    } catch (error) {
      console.error('Error removing image:', error);
    }

    const newScreenshots = screenshots.filter((_, i) => i !== index);
    onScreenshotsChange(newScreenshots);
  };

  const previewImage = (url: string) => {
    setPreviewUrl(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Screenshots ({screenshots.length}/{maxImages})</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || screenshots.length >= maxImages}
          className="border-subtle-border hover:border-elegant-accent/30 font-light"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Add Images'}
        </Button>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {screenshots.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Screenshot ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-subtle-border"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => previewImage(url)}
                  className="text-white hover:bg-white/20"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
              >
                {index + 1}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="max-w-4xl max-h-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
