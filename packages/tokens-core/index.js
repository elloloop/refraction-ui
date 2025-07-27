import fs from 'fs';

export function loadTokens(file) {
  const data = fs.readFileSync(file, 'utf8');
  return JSON.parse(data);
}

function flatten(obj, prefix = []) {
  const out = {};
  for (const [key, value] of Object.entries(obj || {})) {
    if (typeof value === 'object' && value !== null) {
      Object.assign(out, flatten(value, [...prefix, key]));
    } else {
      out[[...prefix, key].join('-')] = value;
    }
  }
  return out;
}

function resolveValue(value) {
  const refMatch = /^\{(.+)\}$/.exec(value);
  if (refMatch) {
    const path = refMatch[1].split('.').join('-');
    return `var(--${path})`;
  }
  return value;
}

export function buildTokens(tokens) {
  const result = {};
  for (const [themeName, theme] of Object.entries(tokens.themes)) {
    for (const [modeName, mode] of Object.entries(theme.modes)) {
      const flat = {
        ...flatten(mode.global, ['global']),
        ...flatten(mode.semantic, ['semantic']),
        ...flatten(mode.components, ['components']),
      };
      const resolved = {};
      for (const [path, value] of Object.entries(flat)) {
        resolved[path] = typeof value === 'string' ? resolveValue(value) : value;
      }
      result[`${themeName}_${modeName}`] = resolved;
    }
  }
  return result;
}

export function generateCSS(built) {
  let css = '';
  for (const [key, tokens] of Object.entries(built)) {
    const [theme, mode] = key.split('_');
    css += `[data-theme="${theme}"][data-mode="${mode}"]{\n`;
    for (const [name, value] of Object.entries(tokens)) {
      css += `  --${name}: ${value};\n`;
    }
    css += `}\n`;
  }
  return css;
}

export function generateTailwind(built) {
  const categories = { colors: {}, spacing: {}, borderRadius: {}, fontSize: {}, components: {} };
  const first = Object.values(built)[0] || {};
  for (const name of Object.keys(first)) {
    const parts = name.split('-');
    const varRef = `var(--${name})`;
    if (parts[0] === 'global' && parts[1] === 'color') {
      categories.colors[parts.slice(2).join('-')] = varRef;
    } else if (parts[0] === 'global' && parts[1] === 'spacing') {
      categories.spacing[parts.slice(2).join('-')] = varRef;
    } else if (parts[0] === 'global' && parts[1] === 'radius') {
      categories.borderRadius[parts.slice(2).join('-')] = varRef;
    } else if (parts[0] === 'global' && (parts[1] === 'font' || parts[1] === 'typography')) {
      categories.fontSize[parts.slice(2).join('-')] = varRef;
    } else {
      categories.components[name] = varRef;
    }
  }
  return `module.exports = {\n  theme: {\n    extend: {\n      colors: ${JSON.stringify(categories.colors, null, 2)},\n      spacing: ${JSON.stringify(categories.spacing, null, 2)},\n      borderRadius: ${JSON.stringify(categories.borderRadius, null, 2)},\n      fontSize: ${JSON.stringify(categories.fontSize, null, 2)},\n    }\n  }\n};\n`;
}
