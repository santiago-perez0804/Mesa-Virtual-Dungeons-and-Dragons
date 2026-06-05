import 'dotenv/config';
import { db } from './db.js';
import { uploadToS3 } from './services/s3Service.js';

async function processImage(base64DataUrl: string, folder: string, prefixName: string): Promise<string> {
  if (!base64DataUrl || !base64DataUrl.startsWith('data:image/')) return base64DataUrl;

  const matches = base64DataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return base64DataUrl;
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');
  
  const ext = mimeType.split('/')[1] || 'png';
  const uniqueName = `${prefixName}_${Date.now()}.${ext}`;

  console.log(`  -> Subiendo ${uniqueName} a la carpeta public/${folder}...`);
  const s3Url = await uploadToS3(uniqueName, buffer, mimeType, folder);
  return s3Url;
}

async function runMigration() {
  console.log("=========================================");
  console.log("🚀 INICIANDO MIGRACIÓN DE IMÁGENES A S3 🚀");
  console.log("=========================================\n");

  // 1. Usuarios
  console.log("--- MIGRANDO USUARIOS ---");
  const users = db.prepare("SELECT id, username, profile_image FROM users").all() as any[];
  for (const user of users) {
    if (user.profile_image && user.profile_image.startsWith('data:image/')) {
      try {
        const newUrl = await processImage(user.profile_image, 'users', `user_${user.id}`);
        db.prepare("UPDATE users SET profile_image = ? WHERE id = ?").run(newUrl, user.id);
        console.log(`✅ Usuario '${user.username}' actualizado.`);
      } catch (err) {
        console.error(`❌ Error con usuario ${user.username}:`, err);
      }
    }
  }

  // 2. Personajes
  console.log("\n--- MIGRANDO PERSONAJES ---");
  const characters = db.prepare("SELECT id, name, image, full_body_image FROM characters").all() as any[];
  for (const char of characters) {
    let updated = false;
    let newImage = char.image;
    let newFullBody = char.full_body_image;

    if (newImage && newImage.startsWith('data:image/')) {
      try {
        newImage = await processImage(newImage, 'avatars', `char_${char.id}_avatar`);
        updated = true;
      } catch(err) {
        console.error(`❌ Error subiendo avatar de ${char.name}:`, err);
      }
    }
    
    if (newFullBody && newFullBody.startsWith('data:image/')) {
      try {
        newFullBody = await processImage(newFullBody, 'full_body', `char_${char.id}_full`);
        updated = true;
      } catch(err) {
        console.error(`❌ Error subiendo foto completa de ${char.name}:`, err);
      }
    }

    if (updated) {
      db.prepare("UPDATE characters SET image = ?, full_body_image = ? WHERE id = ?").run(newImage, newFullBody, char.id);
      console.log(`✅ Personaje '${char.name}' actualizado.`);
    }
  }

  // 3. Compendio (Monstruos, Hechizos, Items)
  console.log("\n--- MIGRANDO COMPENDIO ---");
  const items = db.prepare("SELECT id, name, data FROM content_items").all() as any[];
  for (const item of items) {
    try {
      const data = JSON.parse(item.data);
      if (data && data.image && data.image.startsWith('data:image/')) {
        const newUrl = await processImage(data.image, 'compendium', `item_${item.id}`);
        data.image = newUrl;
        db.prepare("UPDATE content_items SET data = ? WHERE id = ?").run(JSON.stringify(data), item.id);
        console.log(`✅ Ítem del compendio '${item.name}' actualizado.`);
      }
    } catch(e) {
      // Ignorar error de JSON en caso de items raros
    }
  }

  // 4. Campañas
  console.log("\n--- MIGRANDO CAMPAÑAS ---");
  const campaigns = db.prepare("SELECT id, name, image FROM campaigns").all() as any[];
  for (const camp of campaigns) {
    if (camp.image && camp.image.startsWith('data:image/')) {
      try {
        const newUrl = await processImage(camp.image, 'misc', `camp_${camp.id}`);
        db.prepare("UPDATE campaigns SET image = ? WHERE id = ?").run(newUrl, camp.id);
        console.log(`✅ Campaña '${camp.name}' actualizada.`);
      } catch (err) {
        console.error(`❌ Error con campaña ${camp.name}:`, err);
      }
    }
  }

  console.log("\n🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO! 🎉");
  console.log("Tu base de datos SQLite ahora está limpia y ligera.");
}

runMigration().catch(console.error);
