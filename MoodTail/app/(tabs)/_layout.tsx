import MyTabBar from "@/components/MyTabBar";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarInactiveTintColor: "#343434",
        sceneStyle: { backgroundColor: "transparent" },
      }}
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tabs.Screen
        name="calendar"
      />

      <Tabs.Screen
        name="home"
      />

      <Tabs.Screen
        name="favorites"
      />
    </Tabs>
  );
}
