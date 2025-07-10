// pages/api/env-debug.js

export default function handler(req, res) {
  res.status(200).json({
    SUPABASE_URL: process.env.SUPABASE_URL || null,
    SERVICE_KEY_LENGTH: process.env.SUPABASE_SERVICE_KEY?.length || null,
    SERVICE_KEY_STARTS_WITH: process.env.SUPABASE_SERVICE_KEY?.startsWith('eyJhb') || false
  })
}
