import { CalendarIndexProvider } from "@/context/CalendarIndexContext";
import { DateProvider } from "@/context/DateContext";
import { EntityProvider } from "@/context/EntityContext";
import { FavoritesProvider } from "@/context/FavoriteContext";
import { LocationProvider } from "@/context/LocationContext";
import { PhotoProvider } from "@/context/PhotoContext";
import { SelectedDrinkProvider } from "@/context/SelectedDrinkContext";
import { SelectedScenarioProvider } from "@/context/SelectedScenarioContext";
import { CustomThemeProvider, useCustomColors } from "@/context/ThemeContext";
import { Stack, useRouter } from "expo-router";
import { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

function ThemedBackground({ children }: { children: ReactNode }) {
  const colors = useCustomColors();
  // const bg = colors.backgroundGradient ?? [colors.background, colors.background];
  const bg = colors.background;
  return (
    // <LinearGradient colors={bg} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor:bg }}>
        {children}
      </SafeAreaView>
    // </LinearGradient>
  );
}

function RootStack() {
  const color = useCustomColors();
  const router = useRouter()
  return (
    <ThemedBackground>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, contentStyle:{backgroundColor: "transparent"} }} />
        <Stack.Screen name="shared/cocktailDetailModal" options={{ headerShown: false, presentation: "modal" , animation: "slide_from_bottom",}}/>
        <Stack.Screen name="shared/ingredientModal" options={{ headerShown: false, presentation: "modal", animation: "slide_from_bottom", }} />
        <Stack.Screen name="shared/AIRecommendation" options={{ headerShown: false, presentation: "modal", animation: "slide_from_bottom", }} />
        <Stack.Screen name="shared/search" options={{ headerShown: false, presentation: "modal", animation: "slide_from_bottom", }} />
        <Stack.Screen name="shared/scenarioModal" options={{ headerShown: false, presentation: "modal", animation: "slide_from_bottom",  }} />
      </Stack>
    </ThemedBackground>
  );
}

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <EntityProvider>
        <DateProvider>
          <CalendarIndexProvider>
            <LocationProvider>
              <PhotoProvider>
                <SelectedDrinkProvider>
                  <SelectedScenarioProvider>
                    <FavoritesProvider>
                      <RootStack />
                    </FavoritesProvider>
                  </SelectedScenarioProvider>
                </SelectedDrinkProvider>
              </PhotoProvider>
            </LocationProvider>
          </CalendarIndexProvider>
        </DateProvider>
      </EntityProvider>
    </CustomThemeProvider>
  );
}