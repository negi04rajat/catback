import { useState, useCallback, useRef } from "react";
import imageCompression from "browser-image-compression";

export function useCloudinaryUpload() {
  const imagekitRef = useRef<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      if (!imagekitRef.current) {
        const ImageKit = (await import("imagekit-javascript")).default;

        imagekitRef.current = new ImageKit({
          publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY,
          urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT,
        });
      }

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/imagekit-auth`
      );

      if (!res.ok) {
        throw new Error(`Auth fetch failed: ${res.statusText}`);
      }

      const auth = await res.json();

      const result = await imagekitRef.current.upload({
        file: compressedFile,
        fileName: `${Date.now()}-${compressedFile.name}`,
        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
      });

      return result.url;
    } catch (err: any) {
      console.error("ImageKit upload failed:", err);
      setError(err?.message || "Upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return {
    uploadImage,
    uploading,
    error,
    isConfigured: true,
  };
}
