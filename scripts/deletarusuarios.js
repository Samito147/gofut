// scripts/deletarusuarios.js

// 1) carrega variáveis de ambiente de .env.local
require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function clearAllAuthUsers() {
  const { data: listResp, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) {
    console.error('❌ Erro ao listar usuários do Auth:', listErr)
    process.exit(1)
  }

  const users = listResp.users || []
  console.log(`🔎 ${users.length} usuário(s) encontrados para deletar.`)

  for (const u of users) {
    const { error: delErr } = await supabase.auth.admin.deleteUser(u.id)
    if (delErr) {
      console.error(`❌ Falha ao deletar ${u.id} (${u.email}):`, delErr)
    } else {
      console.log(`✅ Deletado ${u.id} (${u.email})`)
    }
  }

  console.log('🎉 Limpeza de Auth concluída!')
}

clearAllAuthUsers()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
