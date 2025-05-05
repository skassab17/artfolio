/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const themecolors = {
  background:    "#F5F1E9",  // off-white “paper”
  primary:       "#D08E60",  // terracotta
  accent:        "#7A5F3C",  // muted forest green
  neutralLight:  "#FFFFFF",
  textPrimary:   "#333333",
  textSecondary: "#666666",
};

export const typography = {
  header: { fontFamily: "Caveat", fontSize: 20 , fontweight: "bold"},
  body:   { fontFamily: "Roboto", fontSize: 16 },
};
