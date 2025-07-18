
import { createClient } from '@supabase/supabase-js';

// Connect to the Supabase instance with the provided credentials.
const supabaseUrl = 'https://hxbslpbkcqzotwwqmskp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YnNscGJrY3F6b3R3d3Ftc2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MDczNTYsImV4cCI6MjA2ODM4MzM1Nn0.EblTYsc4eysezDxPykTGECHkV2xJuzYhpPVN9DaaRSw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
