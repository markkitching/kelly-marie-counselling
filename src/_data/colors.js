const content = require("./content.js");

const PALETTES = {
  navy: { dark: "#1c3553", accent: "#4a7fa5", light: "#f5f7fa", cream: "#e8eef5" },
  forest: { dark: "#2f4a2f", accent: "#6b8e5a", light: "#f3f6f1", cream: "#e7efe2" },
  terracotta: { dark: "#8c4a2f", accent: "#c17a52", light: "#faf5f1", cream: "#f1e5dc" },
  plum: { dark: "#4a2d4f", accent: "#8a6b9e", light: "#f7f4f8", cream: "#ece4ef" },
  charcoal: { dark: "#2b2b30", accent: "#b08d4f", light: "#f6f6f4", cream: "#e9e7e0" },
};

module.exports = () => {
  const theme = content().theme || {};
  const pal = PALETTES[theme.palette] || PALETTES.navy;

  return {
    dark: theme.customDark || pal.dark,
    accent: theme.customAccent || pal.accent,
    light: theme.customLight || pal.light,
    cream: theme.customCream || pal.cream,
  };
};
