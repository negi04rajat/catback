import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  canUpload: boolean; // ✅ permission flag
}

export function ImageUpload({
  value,
  onChange,
  maxImages = 5,
  canUpload,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ hook is ALWAYS called (important)
  const uploadHook = useCloudinaryUpload();

  const [dragOver, setDragOver] = useState(false);

  // ✅ render guard instead of conditional mount
  if (!canUpload) return null;

  const { uploadImage, uploading } = uploadHook;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - value.filter(Boolean).length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    for (const file of filesToUpload) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const url = await uploadImage(file);

      if (url) {
        onChange([...value.filter(Boolean), url]);
        toast.success("Image uploaded successfully");
      } else {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Preview Grid */}
      {value.filter(Boolean).length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.filter(Boolean).map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {value.filter(Boolean).length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors
            ${dragOver ? "border-primary bg-primary/5" : "border-border"}
            ${uploading ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 10MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
