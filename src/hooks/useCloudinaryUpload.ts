import { useState, useCallback } from "react";
import ImageKit from "imagekit-javascript";
import imageCompression from "browser-image-compression";

const PUBLIC_KEY = "public_mFX/7mQzHpCgJmz9GpVHJIdSsMA=";
const URL_ENDPOINT = "https://ik.imagekit.io/4rm3gcimn";

const imagekit = new ImageKit({
  publicKey: PUBLIC_KEY,
  urlEndpoint: URL_ENDPOINT,
});

export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      // Compress image before uploading
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,           // max size in MB
        maxWidthOrHeight: 1920, // max width or height
        useWebWorker: true,
      });

      const response = imagekit.upload({
        file: compressedFile,
        fileName: compressedFile.name,
        folder: "/catalogue",
      });

      return response.url;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return {
    uploadImage,
    uploading,
    error,
    isConfigured: !!(PUBLIC_KEY && URL_ENDPOINT),
  };
}
