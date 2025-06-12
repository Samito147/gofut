// pages/api/config.js

export default function handler(req, res) {
  // só expõe as variáveis públicas
  res.status(200).json({
    supabaseUrl : process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
}
