import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

export interface Case {
  id: string;
  patient_name: string;
  patient_age: number | null;
  village: string | null;
  phone_number: string | null;
  blood_group: string | null;
  case_type: string;
  status: string | null;
  priority: string | null;
  summary: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
  chw_id: string;
  case_data: any;
  is_referred: boolean | null;
  referral_facility: string | null;
  follow_up_date: string | null;
}

export const useCases = (user: User | null) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCases = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .eq('chw_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases((data as Case[]) || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast({
        title: "Error",
        description: "Failed to load cases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [user]);

  return { cases, loading, refetch: fetchCases };
};
