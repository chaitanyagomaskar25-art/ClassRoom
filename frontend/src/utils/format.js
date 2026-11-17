export function idOf(item) {
  return item?._id || item?.id || '';
}

export function nameOf(item) {
  return item?.name || item?.title || item?.label || 'Untitled';
}

export function listFrom(value, key) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.[key])) return value[key];
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

export function percentage(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : 0;
}

export function firstName(name = '') {
  return name.trim().split(/\s+/)[0] || 'there';
}
