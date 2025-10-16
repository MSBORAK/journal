// themes.ts
// Evrensel & Pastel tabanlı tema seti

export interface Theme {
  name: string;
  background: string;
  card: string;
  primary: string;
  secondary: string;
  text: string;
  muted: string;
  success: string;
  danger: string;
}

export const themes = {
  cozy: {
    name: "Cozy Mode",
    background: "#EEEFE8",
    card: "#FFF9E5", // daha soft yüzey (parlaklığı azaltır)
    primary: "#000000", // siyah for maximum contrast
    secondary: "#000000", // siyah for unselected elements
    text: "#000000", // siyah for maximum readability
    muted: "#1A1A1A", // neredeyse siyah muted text
    success: "#FCEBBF",
    danger: "#BA7878",
  },
  luxury: {
    name: "Luxury Mode",
    background: "#0E141C",
    card: "#2D423B",
    primary: "#E38792",
    secondary: "#4D3A38",
    text: "#EDE3DE",
    muted: "#9CB5AD",
    success: "#9C866F",
    danger: "#E38792",
  },
  dark: {
    name: "Dark",
    background: "#121212",
    card: "#1E1E1E",
    primary: "#9CB5AD",
    secondary: "#7A948B",
    text: "#E5E5E5",
    muted: "#9E9E9E",
    success: "#22c55e",
    danger: "#ef4444",
  },

  
  // Soft Minimal Mind — minimalist, sıcak ve dingin
  softMinimal: {
    name: "Soft Minimal Mind",
    background: "#EDE3DE", // Linen - yumuşak arka plan
    card: "#E5D5C8", // Çok daha koyu beige - maksimum kontrast
    primary: "#000000", // siyah for maximum contrast
    secondary: "#000000", // siyah for unselected elements
    text: "#000000", // siyah for maximum readability
    muted: "#1A1A1A", // neredeyse siyah muted text
    success: "#6C857E", // Primary'in bir ton koyusu (hover/aktif)
    danger: "#BA7878", // Old Rose - duygusal/uyarı vurguları
  },

  // Soft Minimal Mind (Dark) — yumuşak koyu, sert değil
  softMinimalDark: {
    name: "Soft Minimal Mind Dark",
    background: "#2D423B", // Deep Mind - koyu ama yumuşak
    card: "#344A43", // Bir ton açık - içerik yüzeyi
    primary: "#9CB5AD",
    secondary: "#D0B9A3", // Khaki %10 parlak
    text: "#EDECE8",
    muted: "#6F837C", // Nötr/grimsi alt metin
    success: "#83A59A", // Başarı/aktif vurgular
    danger: "#C68D8D", // Old Rose'un açık tonu
  },

  // 5 Renk Merkezli Soft Temalar
  alabaster: {
    name: "Alabaster",
    background: "#EEEFE8",
    card: "#FFFFFF",
    primary: "#000000", // siyah for maximum contrast
    secondary: "#000000", // siyah for unselected elements
    text: "#000000", // siyah for maximum readability
    muted: "#1A1A1A", // neredeyse siyah muted text
    success: "#83A59A",
    danger: "#E9ACBB",
  },
  // Light temayı alabaster ile birleştirdiğimiz için ayrı light anahtarı göstermek istemiyorsak
  // light anahtarını alabaster'a alias yapmak yerine kaldırdık. Tema seçim ekranı Object.entries ile geliyor.
  columbia: {
    name: "Columbia Blue",
    background: "#E6EEF3", // bir tık koyu
    card: "#FAFBFC",
    primary: "#000000", // siyah for maximum contrast
    secondary: "#000000", // siyah for unselected elements
    text: "#000000", // siyah for maximum readability
    muted: "#1A1A1A", // neredeyse siyah muted text
    success: "#9CB4C6",
    danger: "#E9ACBB",
  },
  cherry: {
    name: "Cherry Blossom",
    background: "#F4DDE5", // bir tık koyu
    card: "#FFFFFF",
    primary: "#000000", // siyah for maximum contrast
    secondary: "#000000", // siyah for unselected elements
    text: "#000000", // siyah for maximum readability
    muted: "#1A1A1A", // neredeyse siyah muted text
    success: "#F6CCD7",
    danger: "#BA7878",
  },
  
  

  // Premium Navy/Dark Blues set
  chineseBlack: {
    name: "Chinese Black",
    background: "#0E141C",
    card: "#314B6E", // Police Blue as surface
    primary: "#607EA2", // Rackley
    secondary: "#8197AC", // Weldon Blue
    text: "#EDE3DE",
    muted: "#BDB3A3", // Silver Pink
    success: "#83A59A",
    danger: "#BA7878",
  },
  policeBlue: {
    name: "Police Blue",
    background: "#314B6E",
    card: "#607EA2",
    primary: "#8197AC",
    secondary: "#BDB3A3",
    text: "#EDE3DE",
    muted: "#BDB3A3",
    success: "#83A59A",
    danger: "#BA7878",
  },
  
  weldonBlue: {
    name: "Weldon Blue",
    background: "#8197AC",
    card: "#FFFFFF",
    primary: "#2D423B", // darker for better contrast
    secondary: "#314B6E",
    text: "#1A1A1A", // darker for better readability
    muted: "#666666", // darker muted text
    success: "#83A59A",
    danger: "#BA7878",
  },
  

  // Vintage Garden set (soft minimal light)
  
  

  // New requests
  garnet: {
    name: "Garnet",
    background: "#5A1A1D",
    card: "#702529",
    primary: "#E3A2A8",
    secondary: "#F6EDEC",
    text: "#F6EDEC",
    muted: "#C79AA0",
    success: "#83A59A",
    danger: "#E3A2A8",
  },
  oldBurgundy: {
    name: "Old Burgundy",
    background: "#43302E",
    card: "#5C4340",
    primary: "#C1DBE8", // pastel blue as accent
    secondary: "#FFF1B5", // buttermilk soft secondary
    text: "#EDE3DE",
    muted: "#BBAEAA",
    success: "#83A59A",
    danger: "#BA7878",
  },
  buttermilk: {
    name: "Buttermilk",
    background: "#F7E9A6",
    card: "#FFF9E5",
    primary: "#000000", // siyah for maximum contrast
    secondary: "#000000", // siyah for unselected elements
    text: "#000000", // siyah for maximum readability
    muted: "#1A1A1A", // neredeyse siyah muted text
    success: "#83A59A",
    danger: "#BA7878",
  },
} as const;

export type ThemeName = keyof typeof themes;
