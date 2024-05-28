export function setLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
export const getLocal = (key: string) => {
  const savedValue = localStorage.getItem(key);
  return savedValue !== null ? JSON.parse(savedValue) : null;
};
