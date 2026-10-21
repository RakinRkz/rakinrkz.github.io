export interface Profile {
  name: string;
  shortName: string;
  headline: string;
  location: string;
  availability: string;
  email: string;
  github: string;
  linkedin: string;
  about: string;
}

export interface Position {
  title: string;
  /** Display string, e.g. "Jan 2026 – Present". */
  dates: string;
}

export interface Role {
  org: string;
  location?: string;
  context?: string;
  positions: Position[];
  highlights: string[];
}

export interface Education {
  degree: string;
  school: string;
  location: string;
  dates: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface Award {
  title: string;
  detail: string;
}
