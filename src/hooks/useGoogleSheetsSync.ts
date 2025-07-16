
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GoogleSheetsRow {
  timestamp: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  purpose: string;
  preferredStudyTime: string;
  specialRequirements?: string;
  registrationExperience?: string;
}

export const useGoogleSheetsSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const syncData = async (sheetsData: GoogleSheetsRow[]) => {
    setIsLoading(true);
    try {
      for (const row of sheetsData) {
        // Check if this email already exists
        const { data: existing } = await supabase
          .from('registration_forms')
          .select('email')
          .eq('email', row.email)
          .single();

        if (!existing) {
          // Convert Google Sheets data to our database format
          const formData = {
            first_name: row.firstName,
            last_name: row.lastName,
            date_of_birth: new Date(row.dateOfBirth).toISOString().split('T')[0],
            gender: row.gender,
            email: row.email,
            phone: row.phone,
            purpose: row.purpose,
            preferred_study_time: row.preferredStudyTime,
            special_requirements: row.specialRequirements || null,
            registration_experience: row.registrationExperience || null,
            registration_agreed: true,
            terms_accepted: true,
            form_submitted_at: new Date(row.timestamp).toISOString(),
          };

          const { error } = await supabase
            .from('registration_forms')
            .insert([formData]);

          if (error) {
            console.error('Error inserting form:', error);
            throw error;
          }
        }
      }

      setLastSyncTime(new Date());
      toast({
        title: "Sync completed",
        description: `Successfully synced ${sheetsData.length} registration forms.`,
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync data from Google Sheets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const manualSync = async (csvData: string) => {
    try {
      // Parse CSV data (assuming comma-separated values)
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');
      const rows = lines.slice(1);

      const parsedData: GoogleSheetsRow[] = rows.map(row => {
        const values = row.split(',');
        return {
          timestamp: values[0],
          firstName: values[1],
          lastName: values[2],
          dateOfBirth: values[3],
          gender: values[4],
          email: values[5],
          phone: values[6],
          purpose: values[7],
          preferredStudyTime: values[8],
          specialRequirements: values[9],
          registrationExperience: values[10],
        };
      });

      await syncData(parsedData);
    } catch (error) {
      console.error('Manual sync error:', error);
      toast({
        title: "Sync failed",
        description: "Failed to parse and sync the provided data.",
        variant: "destructive",
      });
    }
  };

  return {
    isLoading,
    lastSyncTime,
    syncData,
    manualSync,
  };
};
