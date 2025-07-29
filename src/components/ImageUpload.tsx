
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Eye, Image as ImageIcon } from "lucide-react";
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
    console.log('Starting upload process...');
    
    if (!user) { 
      console.log('No user found, upload cancelled');
      toast({
        title: "Authentication required",
        description: "Please sign in to upload images",
        variant: "destructive",
      });
      return null;
    }
    
    console.log('User authenticated:', user.id);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size);
      toast({
        title: "File too large",
        description: "Please select images smaller than 5MB",
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type);
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    console.log('Generated file path:', fileName);
    
    try {
      console.log('Starting file upload...');
      
      const { data, error } = await supabase.storage
        .from('project-screenshots')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      console.log('Upload response received:', { data, error });

      if (error) {
        console.error('Upload error details:', error);
        toast({
          title: "Upload failed",
          description: error.message || "Failed to upload image. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (!data || !data.path) {
        console.error('No data or path returned from upload');
        toast({
          title: "Upload failed",
          description: "Upload completed but no file path returned.",
          variant: "destructive",
        });
        return null;
      }

      console.log('Upload successful, getting public URL...');
      
      const { data: { publicUrl } } = supabase.storage
        .from('project-screenshots')
        .getPublicUrl(data.path);
      
      console.log('Public URL generated:', publicUrl);
      
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
      
      return publicUrl;
      
    } catch (error) {
      console.error('Upload exception:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred during upload.",
        variant: "destructive",
      });
      return null;
    }
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
    console.log('uploading')  
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
      console.log('uploading file', file)
      const url = await uploadImage(file);
      if (url) {
        newScreenshots.push(url);
      }
    }
    setUploading(false);
    onScreenshotsChange(newScreenshots);
    console.log('uploading done')
    
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
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-[white]" />
          <label className="font-light text-sm sm:text-base text-foreground/90">Project Screenshots</label>
        </div>
        <Badge variant="outline" className="text-xs border-white/20 text-muted-foreground">
          {screenshots.length}/{maxImages}
        </Badge>
      </div>

      {/* Upload Area */}
      <div 
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 transition-all duration-300 cursor-pointer ${
          screenshots.length === 0 
            ? 'border-white/30 bg-background/40' 
            : 'border-white/20 bg-background/20'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-[#fda085]" />
          </div>
          <div className="space-y-1">
            <p className="text-sm sm:text-base font-medium text-foreground">
              {uploading ? 'Uploading...' : 'Click to upload screenshots'}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              PNG, JPG up to 5MB each • Max {maxImages} images
            </p>
          </div>
        </div>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading || screenshots.length >= maxImages}
      />

      {/* Uploaded Images Grid */}
      {screenshots.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground font-light">Uploaded Screenshots</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {screenshots.map((url, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg border border-white/20 bg-background/40">
                <img
                  src={url}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-24 sm:h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => previewImage(url)}
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs border-white/20"
                >
                  {index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
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
