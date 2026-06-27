export interface ICompendiumItemData {
  description?: string;
  image?: string;
  hit_points?: string | number;
  armor_class?: string | number;
  challenge_rating?: string | number;
  speed?: string;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  actions?: any[];
  vulnerabilities?: string;
  resistances?: string;
  immunities?: string;
  size?: string;
  traits?: any[];
  short_description?: string;
  level?: string | number;
  components?: string;
  range?: string;
  duration?: string;
  concentration?: boolean;
  category?: string;
  rarity?: string;
  isDamage?: boolean;
  isProtect?: boolean;
  defenseBonus?: string | number;
  attackName?: string;
  attackBonus?: string | number;
  statMod?: string;
  statSelection?: string;
  targetsCount?: string | number;
  damage?: string;
  damageType?: string;
  critDamage?: string;
  tags?: string[];
  armorType?: string;
  requiresAttunement?: boolean;
  weight?: string | number;
  subsections?: any[];
  [key: string]: any; // Para permitir otros campos dinámicos
}

export interface ICompendiumItem {
  id?: string | number;
  name: string;
  type: string;
  data: ICompendiumItemData;
}

export interface IClassFeaturePayload {
  class_name: string;
  feature_name: string;
  level_acquired: number | string;
  description: string;
  short_description: string;
}

export interface IClassFeature extends IClassFeaturePayload {
  id: number | string;
}

export interface ICompendiumService {
  // Items y Reglas (WebSockets)
  createItem(item: ICompendiumItem): Promise<void>;
  updateItem(id: string | number, item: ICompendiumItem): Promise<void>;
  deleteItem(id: string | number): Promise<void>;
  
  // Rasgos de Clase (REST API via Fetch)
  getFeatures(): Promise<IClassFeature[]>;
  createFeature(feature: IClassFeaturePayload): Promise<IClassFeature>;
  updateFeature(id: string | number, feature: IClassFeaturePayload): Promise<IClassFeature>;
  deleteFeature(id: string | number): Promise<void>;
}
