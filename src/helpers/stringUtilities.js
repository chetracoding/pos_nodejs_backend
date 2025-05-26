export function kebabToCamel(string) {
  return string.replace(/-./g, (m) => m.toUpperCase()[1])
}
export function snakeToCamel(string) {
  return string.toLowerCase().replace(/_./g, (m) => m.toUpperCase()[1])
}
export function camelToKebab(string) {
  return string.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}
export function camelToSnake(string) {
  return string.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
}
