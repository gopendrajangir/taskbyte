export const applyOpacity = (hex: string, opacity: number) => {
  // Remove leading #
  hex = hex.replace(/^#/, '');

  // Expand shorthand hex (#RGB → #RRGGBB)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(c => c + c)
      .join('');
  }

  // Clamp opacity between 0 and 1
  opacity = Math.max(0, Math.min(1, opacity));

  // Convert opacity to alpha hex
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

  return `#${hex.toUpperCase()}${alpha}`;
};
