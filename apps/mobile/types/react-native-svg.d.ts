// Ambient module declaration for react-native-svg.
// Replaces class-based exports with ComponentType to fix React 18 JSX type errors.
declare module "react-native-svg" {
  import type { ComponentType } from "react";
  import type { ViewProps } from "react-native";

  interface SvgProps extends ViewProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    children?: React.ReactNode;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    color?: string;
    title?: string;
    opacity?: number | string;
  }

  interface CircleProps {
    cx?: number | string;
    cy?: number | string;
    r?: number | string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeLinecap?: string;
    strokeDasharray?: string;
    strokeDashoffset?: number | string;
    rotation?: number;
    origin?: string;
    opacity?: number | string;
  }

  interface PathProps {
    d?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    strokeLinecap?: string;
    strokeLinejoin?: string;
    strokeDasharray?: string;
    opacity?: number | string;
    mask?: string;
  }

  interface RectProps {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    rx?: number | string;
    ry?: number | string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    opacity?: number | string;
  }

  interface GProps {
    children?: React.ReactNode;
    mask?: string;
    opacity?: number | string;
    fill?: string;
    transform?: string;
    translate?: string;
  }

  interface MaskProps {
    id?: string;
    children?: React.ReactNode;
  }

  interface DefsProps {
    children?: React.ReactNode;
  }

  interface LinearGradientProps {
    id?: string;
    x1?: string | number;
    y1?: string | number;
    x2?: string | number;
    y2?: string | number;
    children?: React.ReactNode;
  }

  interface StopProps {
    offset?: string | number;
    stopColor?: string;
    stopOpacity?: number | string;
  }

  export type { SvgProps, CircleProps, PathProps, RectProps, GProps, MaskProps, DefsProps, LinearGradientProps, StopProps };

  const Svg: ComponentType<SvgProps>;
  const Circle: ComponentType<CircleProps>;
  const Path: ComponentType<PathProps>;
  const Rect: ComponentType<RectProps>;
  const G: ComponentType<GProps>;
  const Mask: ComponentType<MaskProps>;
  const Defs: ComponentType<DefsProps>;
  const LinearGradient: ComponentType<LinearGradientProps>;
  const Stop: ComponentType<StopProps>;

  export default Svg;
  export { Circle, Path, Rect, G, Mask, Defs, LinearGradient, Stop };
}
