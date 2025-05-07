// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hkukxdsmxglhkicjymnw.supabase.co'; // remplace par ton URL Supabase
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdWt4ZHNteGdsaGtpY2p5bW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5OTkwMDYsImV4cCI6MjA2MTU3NTAwNn0.OTZv-mL16wE-RzMz9bqOKNVtsPfJLV00TJ212P_4hTk'; // remplace par ta clé publique anonyme

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
