export interface Campaign {
  id: number;
  name: string;
  description: string;
  image: string;
  active_heroes: string;
  is_ai_dm: number;
  is_active: number;
  owner?: string;
  created_at: string;
  long_description?: string;
  max_players?: number;
}

export interface DiaryEntry {
  id: number;
  campaign_id: number;
  author: string;
  content: string;
  image: string;
  created_at: string;
}
