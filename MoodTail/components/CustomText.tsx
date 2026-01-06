import { useCustomColors } from "@/context/ThemeContext";
import { Text, TextProps, TextStyle } from "react-native";

type Variant = "title" | "subtitle" | "body";


type CustomTextProps = TextProps & {
  variant?: Variant;
};

export function CustomText({
  variant = "body",
  style,
  ...rest
}: CustomTextProps) {
  const colors = useCustomColors();
  const VARIANT_STYLES: Record<Variant, TextStyle> = {
    title: { color: colors.text1, fontSize: 24, fontWeight: "700" },
    subtitle: { color: colors.text2, fontSize: 18, fontWeight: "600" },
    body: { color: colors.text3, fontSize: 14 },
  };
  
  return (
    <Text
      {...rest}
      style={[{ color: colors.text1 }, VARIANT_STYLES[variant], style]}
    />
  );
}
