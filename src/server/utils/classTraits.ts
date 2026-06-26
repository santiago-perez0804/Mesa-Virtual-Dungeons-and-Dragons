import type { Server } from 'socket.io';
import { db } from '../bd.js';
import { escapeRegExp } from './parse.js';

/** Sincronización bidireccional entre los rasgos de clase y la tabla class_features. */
export function syncClassTraitsToFeaturesTable(className: string, data: any) {
  try {
    const traits = data?.traits || [];

    const dbFeatures = db.prepare("SELECT id, feature_name, level_acquired FROM class_features WHERE LOWER(class_name) = LOWER(?)")
      .all(className) as { id: number, feature_name: string, level_acquired: number }[];

    for (const dbFeat of dbFeatures) {
      const existsInTraits = traits.some((t: any) => t.name.toLowerCase() === dbFeat.feature_name.toLowerCase() && parseInt(t.level) === dbFeat.level_acquired);
      if (!existsInTraits) {
        db.prepare("DELETE FROM class_features WHERE id = ?").run(dbFeat.id);
      }
    }

    for (const trait of traits) {
      const existing = db.prepare("SELECT id FROM class_features WHERE LOWER(class_name) = LOWER(?) AND LOWER(feature_name) = LOWER(?) AND level_acquired = ?")
        .get(className, trait.name, parseInt(trait.level)) as { id: number } | undefined;

      if (existing) {
        db.prepare("UPDATE class_features SET description = ?, short_description = ? WHERE id = ?")
          .run(trait.desc || trait.description, trait.short_description || '', existing.id);
      } else {
        db.prepare("INSERT INTO class_features (class_name, feature_name, level_acquired, description, short_description) VALUES (?, ?, ?, ?, ?)")
          .run(className, trait.name, parseInt(trait.level), trait.desc || trait.description, trait.short_description || '');
      }
    }
  } catch (err: any) {
    console.error("Error syncing class traits to features table:", err.message);
  }
}

export function syncFeatureToClassContentItem(
  io: Server,
  className: string,
  featureName: string,
  level: number,
  description: string,
  shortDescription: string,
  oldClassName?: string,
  oldFeatureName?: string,
  oldLevel?: number
) {
  try {
    if (oldClassName && oldClassName.toLowerCase() !== className.toLowerCase()) {
      deleteFeatureFromClassContentItem(io, oldClassName, oldFeatureName || featureName, oldLevel);
    }

    const classRow = db.prepare("SELECT id, data FROM content_items WHERE type = 'class' AND LOWER(name) = LOWER(?)")
      .get(className) as { id: number, data: string } | undefined;

    if (!classRow) return;

    let data: any = {};
    try {
      data = JSON.parse(classRow.data);
    } catch {
      data = {};
    }

    if (!data.traits) data.traits = [];

    const targetName = oldFeatureName || featureName;
    const targetLevel = oldLevel !== undefined ? oldLevel : level;
    const existingIndex = data.traits.findIndex((t: any) => t.name.toLowerCase() === targetName.toLowerCase() && parseInt(t.level) === targetLevel);

    const newTrait = {
      level,
      name: featureName,
      type: (existingIndex >= 0 ? data.traits[existingIndex]?.type : null) || 'Pasivo',
      desc: description,
      short_description: shortDescription
    };

    if (existingIndex >= 0) {
      data.traits[existingIndex] = newTrait;
    } else {
      data.traits.push(newTrait);
    }

    data.traits.sort((a: any, b: any) => a.level - b.level);

    if (oldFeatureName && oldFeatureName !== featureName && data.table) {
      data.table = data.table.replace(new RegExp(escapeRegExp(oldFeatureName), 'g'), featureName);
    }

    db.prepare("UPDATE content_items SET data = ? WHERE id = ?")
      .run(JSON.stringify(data), classRow.id);

    io.emit('content:list', db.prepare("SELECT * FROM content_items").all());
  } catch (err: any) {
    console.error("Error in syncFeatureToClassContentItem:", err.message);
  }
}

export function deleteFeatureFromClassContentItem(io: Server, className: string, featureName: string, level?: number) {
  try {
    const classRow = db.prepare("SELECT id, data FROM content_items WHERE type = 'class' AND LOWER(name) = LOWER(?)")
      .get(className) as { id: number, data: string } | undefined;

    if (!classRow) return;

    let data: any = {};
    try {
      data = JSON.parse(classRow.data);
    } catch {
      data = {};
    }

    if (!data.traits) return;

    if (level !== undefined) {
      data.traits = data.traits.filter((t: any) => !(t.name.toLowerCase() === featureName.toLowerCase() && parseInt(t.level) === level));
    } else {
      data.traits = data.traits.filter((t: any) => t.name.toLowerCase() !== featureName.toLowerCase());
    }

    if (data.table) {
      let table = data.table;
      table = table.replace(new RegExp(`,\\s*${escapeRegExp(featureName)}`, 'gi'), '');
      table = table.replace(new RegExp(`${escapeRegExp(featureName)}\\s*,?`, 'gi'), '');
      data.table = table;
    }

    db.prepare("UPDATE content_items SET data = ? WHERE id = ?")
      .run(JSON.stringify(data), classRow.id);

    io.emit('content:list', db.prepare("SELECT * FROM content_items").all());
  } catch (err: any) {
    console.error("Error in deleteFeatureFromClassContentItem:", err.message);
  }
}
