export interface Color {
  id?: number;
  ENG: string;
  SP: string;
  created_at?: string;
  updated_at?: string;
}

export interface ColorInsert {
  ENG: string;
  SP: string;
}

export interface ColorUpdate extends ColorInsert {
  id: number;
}

