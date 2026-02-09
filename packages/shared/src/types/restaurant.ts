export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  phone: string;
  email?: string;
  address: string;
  description: string;
  hours: Record<string, { open?: string; close?: string; closed?: boolean }>;
  branding: Branding;
  features: Features;
  active: boolean;
  status?: string;
}

export interface Branding {
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_family: string | null;
  logo_url: string | null;
}

export interface Features {
  catering?: boolean;
  multi_location?: boolean;
  merchandise?: boolean;
  pos?: boolean;
  rewards?: boolean;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  hours: Record<string, { open?: string; close?: string; closed?: boolean }>;
  active: boolean;
}
