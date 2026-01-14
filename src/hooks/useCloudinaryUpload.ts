import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
}

export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<CloudinaryConfig | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('cloudinary-upload', {
          body: { action: 'getConfig' }
        });
        if (error) throw error;
        setConfig(data);
      } catch (err: any) {
        console.error('Failed to fetch Cloudinary config:', err);
      }
    };
    fetchConfig();
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!config) {
      setError('Cloudinary not configured');
      return null;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', config.uploadPreset);
      formData.append('folder', 'catalogue');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  }, [config]);

  return {
    uploadImage,
    uploading,
    error,
    isConfigured: !!config,
  };
}