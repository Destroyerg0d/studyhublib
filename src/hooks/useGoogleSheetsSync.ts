
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

  // Load last sync time from localStorage
  useEffect(() => {
    const savedSyncTime = localStorage.getItem('lastGoogleSheetsSync');
    if (savedSyncTime) {
      setLastSyncTime(new Date(savedSyncTime));
    }
  }, []);

  const syncData = async (sheetsData: GoogleSheetsRow[]) => {
    setIsLoading(true);
    let syncedCount = 0;
    let skippedCount = 0;

    try {
      for (const row of sheetsData) {
        if (!row.email || !row.firstName || !row.lastName) {
          console.log('Skipping row with missing required fields:', row);
          skippedCount++;
          continue;
        }

        // Check if this email already exists
        const { data: existing } = await supabase
          .from('registration_forms')
          .select('email')
          .eq('email', row.email)
          .single();

        if (!existing) {
          // Parse date properly
          let parsedDate;
          try {
            parsedDate = new Date(row.dateOfBirth);
            if (isNaN(parsedDate.getTime())) {
              throw new Error('Invalid date');
            }
          } catch (e) {
            console.error('Invalid date format for:', row.dateOfBirth);
            skippedCount++;
            continue;
          }

          // Convert Google Sheets data to our database format
          const formData = {
            first_name: row.firstName.trim(),
            last_name: row.lastName.trim(),
            date_of_birth: parsedDate.toISOString().split('T')[0],
            gender: row.gender || 'Not specified',
            email: row.email.trim().toLowerCase(),
            phone: row.phone || '',
            purpose: row.purpose || 'Study',
            preferred_study_time: row.preferredStudyTime || 'Day Time',
            special_requirements: row.specialRequirements || null,
            registration_experience: row.registrationExperience || null,
            registration_agreed: true,
            terms_accepted: true,
            form_submitted_at: row.timestamp ? new Date(row.timestamp).toISOString() : new Date().toISOString(),
            status: 'pending'
          };

          const { error } = await supabase
            .from('registration_forms')
            .insert([formData]);

          if (error) {
            console.error('Error inserting form for:', row.email, error);
            throw error;
          }

          syncedCount++;
        } else {
          skippedCount++;
        }
      }

      const syncTime = new Date();
      setLastSyncTime(syncTime);
      localStorage.setItem('lastGoogleSheetsSync', syncTime.toISOString());

      toast({
        title: "Sync completed successfully",
        description: `Synced ${syncedCount} new registrations. Skipped ${skippedCount} existing/invalid entries.`,
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync data from Google Sheets. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const manualSync = async (csvData: string) => {
    try {
      if (!csvData.trim()) {
        toast({
          title: "No data provided",
          description: "Please paste CSV data or upload a file first.",
          variant: "destructive",
        });
        return;
      }

      // Parse CSV data (handle both comma and tab-separated values)
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must have at least a header row and one data row');
      }

      const headers = lines[0].split(/[,\t]/).map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1);

      console.log('CSV Headers detected:', headers);

      const parsedData: GoogleSheetsRow[] = rows.map((row, index) => {
        const values = row.split(/[,\t]/).map(v => v.trim().replace(/"/g, ''));
        
        // Try to map headers to our expected format
        const rowData: any = {};
        headers.forEach((header, i) => {
          const value = values[i] || '';
          const lowerHeader = header.toLowerCase();
          
          if (lowerHeader.includes('timestamp') || lowerHeader.includes('time')) {
            rowData.timestamp = value;
          } else if (lowerHeader.includes('first') && lowerHeader.includes('name')) {
            rowData.firstName = value;
          } else if (lowerHeader.includes('last') && lowerHeader.includes('name')) {
            rowData.lastName = value;
          } else if (lowerHeader.includes('birth') || lowerHeader.includes('dob')) {
            rowData.dateOfBirth = value;
          } else if (lowerHeader.includes('gender')) {
            rowData.gender = value;
          } else if (lowerHeader.includes('email')) {
            rowData.email = value;
          } else if (lowerHeader.includes('phone') || lowerHeader.includes('mobile')) {
            rowData.phone = value;
          } else if (lowerHeader.includes('purpose')) {
            rowData.purpose = value;
          } else if (lowerHeader.includes('study') && lowerHeader.includes('time')) {
            rowData.preferredStudyTime = value;
          } else if (lowerHeader.includes('special') || lowerHeader.includes('requirement')) {
            rowData.specialRequirements = value;
          } else if (lowerHeader.includes('experience')) {
            rowData.registrationExperience = value;
          }
        });

        return rowData as GoogleSheetsRow;
      }).filter(row => row.email && row.firstName); // Filter out rows without essential data

      console.log(`Parsed ${parsedData.length} valid rows from CSV`);

      if (parsedData.length === 0) {
        throw new Error('No valid data rows found. Please check your CSV format.');
      }

      await syncData(parsedData);
    } catch (error) {
      console.error('Manual sync error:', error);
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to parse and sync the provided data.",
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
