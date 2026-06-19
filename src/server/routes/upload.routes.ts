import type { Express } from 'express';
import multer from 'multer';
import { uploadToS3 } from '../services/servicioS3.js';

const upload = multer({ storage: multer.memoryStorage() });

/** Endpoint REST para subir archivos a AWS S3. */
export function registerUploadRoutes(app: Express) {
  app.post('/api/upload', upload.single('file'), async (req: any, res: any) => {
    try {
      const archivo = req.file;
      const folder = req.query.folder || 'misc';

      if (!archivo) {
        res.status(400).json({ error: 'No se subió ninguna imagen' });
        return;
      }

      const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1E9)}_${archivo.originalname.replace(/\s+/g, '_')}`;
      const urlS3 = await uploadToS3(uniqueName, archivo.buffer, archivo.mimetype, folder);

      res.json({ success: true, message: 'Archivo subido correctamente', url: urlS3 });
    } catch (error: any) {
      console.error("Error al subir archivo a S3:", error);
      res.status(500).json({ error: 'Error al procesar el archivo', details: error.message });
    }
  });
}
