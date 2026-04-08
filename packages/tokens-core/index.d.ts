export interface TokenFile {
  themes: Record<string, {
    modes: Record<string, {
      global?: Record<string, unknown>;
      semantic?: Record<string, unknown>;
      components?: Record<string, unknown>;
    }>;
  }>;
}

export interface BuiltTokens {
  [themeMode: string]: Record<string, string | number>;
}

export function loadTokens(file: string): TokenFile;
export function buildTokens(tokens: TokenFile): BuiltTokens;
export function generateCSS(built: BuiltTokens): string;
export function generateTailwind(built: BuiltTokens): string;
