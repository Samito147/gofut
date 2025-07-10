// pages/api/upload-foto.js

import formidable from 'formidable';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

// ⛔️ Impede o uso do bodyParser para aceitar arquivos
export const config = {
  api: {
    bodyParser: false
  }
};

// 🔐 Inicializa cliente Supabase com chave secreta
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // 📥 Parser do formidable para lidar com multipart/form-data
    const form = formidable({ multiples: false, keepExtensions: true });

    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    // 🧾 Valida e extrai username
    let username = data.fields.username;
    if (Array.isArray(username)) username = username[0];
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Nome de usuário não informado' });
    }

    // 🔤 Sanitiza e capitaliza o nome
    const safeUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/gi, '_');
    const capitalizedUsername = safeUsername.charAt(0).toUpperCase() + safeUsername.slice(1);

    // 📁 Extrai o arquivo da requisição
    const foto = Array.isArray(data.files.foto)
      ? data.files.foto[0]
      : data.files.foto || Object.values(data.files)[0];

    if (!foto || !foto.filepath) {
      return res.status(400).json({ error: 'Nenhum arquivo válido enviado' });
    }

    // 📄 Lê o arquivo local como buffer
    const fileBuffer = fs.readFileSync(foto.filepath);

    const ext = path.extname(foto.originalFilename || foto.newFilename || '.png');
    const finalFileName = `${capitalizedUsername}${ext}`;

    // ☁️ Envia para Supabase Storage (bucket público: fotos)
    const { error: uploadError } = await supabase.storage
      .from('fotos')
      .upload(finalFileName, fileBuffer, {
        contentType: foto.mimetype || 'image/png',
        upsert: true // sobrescreve se já existir
      });

    if (uploadError) {
      console.error('Erro ao enviar ao bucket:', uploadError);
      return res.status(500).json({ error: 'Falha ao enviar imagem ao Storage' });
    }

    // 🔗 Gera URL pública
    const publicURL = `${process.env.SUPABASE_URL}/storage/v1/object/public/fotos/${finalFileName}`;

    return res.status(200).json({
      success: true,
      file: publicURL
    });

  } catch (err) {
    console.error('❌ Erro no upload:', err);
    return res.status(500).json({ error: 'Erro ao processar o upload' });
  }
}
