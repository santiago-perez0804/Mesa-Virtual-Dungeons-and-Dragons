import type { Express } from 'express';
import type { Server } from 'socket.io';
import { db } from '../bd.js';
import { syncFeatureToClassContentItem, deleteFeatureFromClassContentItem } from '../utils/classTraits.js';

/** Endpoints REST para la gestión de rasgos de clase (class_features). */
export function registerClassFeaturesRoutes(app: Express, io: Server) {
  app.get('/api/class-features', (_req, res) => {
    try {
      const features = db.prepare("SELECT id, class_name, feature_name, level_acquired, description, short_description FROM class_features ORDER BY class_name ASC, level_acquired ASC").all();
      const mapped = features.map((f: any) => ({
        id: String(f.id),
        name: f.feature_name,
        class: f.class_name,
        level: f.level_acquired,
        description: f.description,
        short_description: f.short_description || ''
      }));
      res.json(mapped);
    } catch (err: any) {
      console.error("Error en API /api/class-features (all):", err.message);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.post('/api/class-features', (req, res) => {
    try {
      const { class_name, feature_name, level_acquired, description, short_description } = req.body;
      if (!class_name || !feature_name || !level_acquired || !description) {
        res.status(400).json({ error: "Faltan campos requeridos" });
        return;
      }
      const result = db.prepare("INSERT INTO class_features (class_name, feature_name, level_acquired, description, short_description) VALUES (?, ?, ?, ?, ?)")
        .run(class_name, feature_name, parseInt(level_acquired), description, short_description || '');

      const newId = String(result.lastInsertRowid);
      syncFeatureToClassContentItem(io, class_name, feature_name, parseInt(level_acquired), description, short_description || '');

      res.json({ id: newId, class_name, feature_name, level_acquired, description, short_description });
    } catch (err: any) {
      console.error("Error en POST /api/class-features:", err.message);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.put('/api/class-features/:id', (req, res) => {
    try {
      const id = req.params.id;
      const { class_name, feature_name, level_acquired, description, short_description } = req.body;
      if (!class_name || !feature_name || !level_acquired || !description) {
        res.status(400).json({ error: "Faltan campos requeridos" });
        return;
      }

      const oldFeature = db.prepare("SELECT class_name, feature_name, level_acquired FROM class_features WHERE id = ?").get(id) as { class_name: string, feature_name: string, level_acquired: number } | undefined;

      db.prepare("UPDATE class_features SET class_name = ?, feature_name = ?, level_acquired = ?, description = ?, short_description = ? WHERE id = ?")
        .run(class_name, feature_name, parseInt(level_acquired), description, short_description || '', id);

      if (oldFeature) {
        syncFeatureToClassContentItem(
          io,
          class_name,
          feature_name,
          parseInt(level_acquired),
          description,
          short_description || '',
          oldFeature.class_name,
          oldFeature.feature_name,
          oldFeature.level_acquired
        );
      }

      res.json({ id, class_name, feature_name, level_acquired, description, short_description });
    } catch (err: any) {
      console.error("Error en PUT /api/class-features:", err.message);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.delete('/api/class-features/:id', (req, res) => {
    try {
      const id = req.params.id;
      const oldFeature = db.prepare("SELECT class_name, feature_name, level_acquired FROM class_features WHERE id = ?").get(id) as { class_name: string, feature_name: string, level_acquired: number } | undefined;

      db.prepare("DELETE FROM class_features WHERE id = ?").run(id);

      if (oldFeature) {
        deleteFeatureFromClassContentItem(io, oldFeature.class_name, oldFeature.feature_name, oldFeature.level_acquired);
      }

      res.json({ success: true, id });
    } catch (err: any) {
      console.error("Error en DELETE /api/class-features:", err.message);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });

  app.get('/api/class-features/:className', (req, res) => {
    try {
      const rawClassName = req.params.className;

      const nameMap: Record<string, string> = {
        'bárbaro': 'barbarian', 'barbarian': 'bárbaro',
        'guerrero': 'fighter', 'fighter': 'guerrero',
        'pícaro': 'rogue', 'rogue': 'pícaro',
        'mago': 'wizard', 'wizard': 'mago',
        'clérigo': 'cleric', 'cleric': 'clérigo',
        'paladín': 'paladin', 'paladin': 'paladín',
        'bardo': 'bard', 'bard': 'bardo',
        'druida': 'druid', 'druid': 'druida',
        'monje': 'monk', 'monk': 'monje',
        'explorador': 'ranger', 'ranger': 'explorador',
        'hechicero': 'sorcerer', 'sorcerer': 'hechicero',
        'brujo': 'warlock', 'warlock': 'brujo'
      };

      const cleanName = rawClassName.toLowerCase();
      const mappedName = (nameMap[cleanName] || cleanName).toLowerCase();

      const features = db.prepare("SELECT feature_name, level_acquired, description FROM class_features WHERE LOWER(class_name) = ? OR LOWER(class_name) = ? ORDER BY level_acquired ASC").all(cleanName, mappedName);

      res.json(features);
    } catch (err: any) {
      console.error("Error en API /api/class-features spec:", err.message);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
}
