import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kmgofqjffdgznfgmxcmj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZ29mcWpmZmRnem5mZ214Y21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1ODEwODAsImV4cCI6MjA4MzE1NzA4MH0.pRUH68fP7QpIe4rvTHy3yBVwr2ZaMMffQVA9t4eqAfU';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
