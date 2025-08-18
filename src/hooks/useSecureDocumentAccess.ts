import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSecureDocumentAccess = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getSecureDocumentUrl = async (
    verificationId: string,
    documentType: 'front' | 'back'
  ): Promise<string | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_verification_document_url', {
        verification_id: verificationId,
        document_type: documentType
      });

      if (error) {
        console.error('Document access error:', error);
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this document or it has expired.",
          variant: "destructive",
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error accessing document:', error);
      toast({
        title: "Error",
        description: "Failed to access document. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    getSecureDocumentUrl,
    loading
  };
};