import React from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Defs, Mask, Rect, Path, G } from "react-native-svg";

interface BrandMarkProps {
  size?: number;
  style?: ViewStyle;
}

export function BrandMark({ size = 40, style }: BrandMarkProps) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
      >
        <Defs>
          <Mask id="exitplan-arrow-gap">
            <Rect width="200" height="200" fill="white" />
            <Path
              d="M 40 170 C 40 125, 60 100, 100 90 L 95 81 L 145 75 L 115 115 L 110 107 C 70 120, 45 150, 40 170 Z"
              fill="black"
              stroke="black"
              strokeWidth={12}
              strokeLinejoin="round"
            />
          </Mask>
        </Defs>
        <G translate="8, 0">
          <Path
            d="M 40 30 H 140 V 60 H 70 V 140 H 140 V 170 H 40 Z"
            fill="#14213D"
            mask="url(#exitplan-arrow-gap)"
          />
          <Path
            d="M 40 170 C 40 125, 60 100, 100 90 L 95 81 L 145 75 L 115 115 L 110 107 C 70 120, 45 150, 40 170 Z"
            fill="#55C48A"
          />
        </G>
      </Svg>
    </View>
  );
}
