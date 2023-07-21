
export const strHandle = (str: string): string | null => {
  if (!str || !str.trim()) return '';
  return str.split('').reduce((prev, next, i) => `${prev}${i >= 5 && i <= 10 ? '*' : next}`);
};

