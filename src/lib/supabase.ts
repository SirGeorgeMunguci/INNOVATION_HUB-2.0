import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type UserRole = 'student' | 'supervisor' | 'admin';
export type ProjectStatus = 'pending' | 'approved' | 'rejected' | 'revision';
