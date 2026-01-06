/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */


const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#F5F2EA',
    backgroundGradient: ['#ADE8FD', '#FCF3CE'] as const,
    tint: tintColorLight,
    icon: '#687076',
    // customed starts here
    text1: "#5A3E15",
    text2: "#5c4e3b",
    text3: "#5A3E15",
    background1: "#FCD06A",
    background2: "#fff",
    background3: "#FFB200",
    background4: "#F5F2EA",
    enableAddScenario: "#6E562A",
    disableAddScenario: "#9E9E9E",
    enableAddScenarioBtnbg: "#EFE9DA",
    enableAddScenarioBtnborder: "#E5D7B5",
    disableAddScenarioBtnbg: "#E5E5E5",
    disableAddScenarioBtnborder: "#D6D6D6",

    gradientStart1: "white",
    gradientEnd1: "#EAE5D7",
    gradientStart2: "#FEF4E1",
    gradientEnd2: "#FFE98E",

    icon1: "#C0901A",
    btnbg1: "#FFF4CF",
    btnbg2: "#EAE5D7",
    btnborder1: "#F2D489",
    btntext1: "#C0901A",
    calendarbg: "white",
    calendarArrowColor: "#C0901A",
    calendarMonthTextColor: "#6E562A",
    calendarTextSectionTitleColor: "#927643",
    calendarDayTextColor: "#6E562A",
    calendarTodayTextColor: "#ff0000",
    calendarTextDisabledColor: "#C7C7C7",
    calendarSelectedDayBackgroundColor: "transparent",
    calendarSelectedDayTextColor: "#fff",

    photoSecbg1: "#FFFDF7",
    photoSecbg2: "#FFF4CF",

    tabMain: "#FCD06A",
    tabIconSelected: "#563E11",
    tabIconDefault: "#6E562A",

    newScenariodialogbg: "#FFFDF6",
    newScenariodialogborder: "#EADAA8",
    newScenariodialoginputbg: "#FFF9EA",
    newScenariodialoginputborder: "#E5D7B5",
    newScenariodialoginputtext: "#2b2b2b",
    newScenariodialogcancelbg: "#F4F1E3",
    newScenariodialogokbg: "#FFB200",

  },
    dark: {
    text: '#ECEDEE',
    background: '#0F1B30',
    backgroundGradient: [' #0E1B2E ', '#091426'] as const,
    tint: tintColorDark,
    icon: '#9BA1A6',

    // customed starts here
    text1: "#E4C280",
    text2: "#5c4e3b",
    text3: "#a9a9a9",
    background1: "#7089C8",
    background2: "#ffffff1a", // "#374768",
    background3: "#E4C280",
    background4: "#374768",
    enableAddScenario: "#E4C280",
    disableAddScenario: "#6E562A",
    enableAddScenarioBtnbg: "black",
    enableAddScenarioBtnborder: "#E4C280",
    disableAddScenarioBtnbg: "black",
    disableAddScenarioBtnborder: "#E4C280",

    gradientStart1: "#7089C8",
    gradientEnd1: "#1B3168",
    gradientStart2: "#E4C280",
    gradientEnd2: "#374768",
    
    icon1: "#F2D489",
    btnbg1: "#374768",
    btnbg2: "#374768",
    btnborder1: "#F2D489",
    btntext1: "#C0901A",
    calendarbg: "black",
    calendarArrowColor: "#927643",
    calendarMonthTextColor: "#6E562A",
    calendarTextSectionTitleColor: "#927643",
    calendarDayTextColor: "#927643",
    calendarTodayTextColor: "red",
    calendarTextDisabledColor: "gray",
    calendarSelectedDayBackgroundColor: "transparent",
    calendarSelectedDayTextColor: "lightgreen",

    photoSecbg1: "black",
    photoSecbg2: "black",

    // tabMain: "black",
    // tabIconSelected: "green",
    // tabIconDefault: "red",
    tabMain: "#546994",
    tabIconSelected: "#FFE98E",
    tabIconDefault: "#949FB4",

    newScenariodialogbg: "black",
    newScenariodialogborder: "#E4C280",
    newScenariodialoginputbg: "rgba(120, 120, 128, 0.16)",
    newScenariodialoginputborder: "#E5D7B5",
    newScenariodialoginputtext: "#E5D7B5",
    newScenariodialogcancelbg: "#E4C280",
    newScenariodialogokbg: "#E4C280",

  },
};

export type CustomColorSet = typeof Colors.light | typeof Colors.dark;

