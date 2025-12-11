import React from "react";
import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

/**
 * Transition Components
 *
 * Reusable transition effects for scene animations.
 */

interface TransitionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

/**
 * FadeIn - Simple opacity fade
 */
export function FadeIn({ children, delay = 0, duration = 20 }: TransitionProps) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return <div style={{ opacity }}>{children}</div>;
}

/**
 * FadeInUp - Fade in with upward motion
 */
export function FadeInUp({ children, delay = 0, duration = 30 }: TransitionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 80, stiffness: 200, mass: 0.5 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [30, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * FadeInLeft - Fade in from left
 */
export function FadeInLeft({ children, delay = 0 }: TransitionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 80, stiffness: 200, mass: 0.5 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateX = interpolate(progress, [0, 1], [-40, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * FadeInRight - Fade in from right
 */
export function FadeInRight({ children, delay = 0 }: TransitionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 80, stiffness: 200, mass: 0.5 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateX = interpolate(progress, [0, 1], [40, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * ScaleIn - Scale up from smaller size
 */
export function ScaleIn({ children, delay = 0 }: TransitionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 60, stiffness: 200, mass: 0.5 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.8, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Stagger - Applies staggered delays to children
 */
interface StaggerProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  baseDelay?: number;
  animation?: "fadeInUp" | "fadeInLeft" | "fadeInRight" | "scaleIn";
}

export function Stagger({
  children,
  staggerDelay = 5,
  baseDelay = 0,
  animation = "fadeInUp",
}: StaggerProps) {
  const AnimationComponent = {
    fadeInUp: FadeInUp,
    fadeInLeft: FadeInLeft,
    fadeInRight: FadeInRight,
    scaleIn: ScaleIn,
  }[animation];

  return (
    <>
      {React.Children.map(children, (child, index) => (
        <AnimationComponent delay={baseDelay + index * staggerDelay}>
          {child}
        </AnimationComponent>
      ))}
    </>
  );
}

/**
 * TypeWriter - Animated text reveal character by character
 */
interface TypeWriterProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  showCursor?: boolean;
}

export function TypeWriter({
  text,
  delay = 0,
  speed = 2,
  className,
  style,
  showCursor: showCursorProp = true,
}: TypeWriterProps) {
  const frame = useCurrentFrame();

  const charsToShow = Math.floor(Math.max(0, frame - delay) / speed);
  const displayText = text.slice(0, charsToShow);
  const showCursor = showCursorProp && frame % 30 < 15 && charsToShow < text.length;

  return (
    <span className={className} style={style}>
      {displayText}
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            backgroundColor: "currentColor",
            marginLeft: 2,
          }}
        />
      )}
    </span>
  );
}

/**
 * CountUp - Animated number counter with spring physics
 */
interface CountUpProps {
  from: number;
  to: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}

export function CountUp({
  from,
  to,
  delay = 0,
  prefix = "",
  suffix = "",
  style,
}: CountUpProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 80, stiffness: 100 },
  });

  const currentValue = Math.round(interpolate(progress, [0, 1], [from, to]));

  return (
    <span style={style}>
      {prefix}
      {currentValue.toLocaleString()}
      {suffix}
    </span>
  );
}

/**
 * MessageTypeWriter - Types chat message text with optional avatar context
 */
interface MessageTypeWriterProps {
  text: string;
  delay?: number;
  speed?: number;
  style?: React.CSSProperties;
}

export function MessageTypeWriter({
  text,
  delay = 0,
  speed = 1.5,
  style,
}: MessageTypeWriterProps) {
  const frame = useCurrentFrame();

  const charsToShow = Math.floor(Math.max(0, frame - delay) / speed);
  const displayText = text.slice(0, charsToShow);
  const isTyping = charsToShow < text.length && charsToShow > 0;

  return (
    <span style={style}>
      {displayText}
      {isTyping && (
        <span
          style={{
            display: "inline-block",
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: "currentColor",
            marginLeft: 4,
            opacity: frame % 20 < 10 ? 1 : 0.3,
          }}
        />
      )}
    </span>
  );
}

/**
 * CodeTypeWriter - Types code with syntax highlighting
 * Supports Python syntax: keywords (purple), functions (yellow), strings (green)
 */
interface CodeTypeWriterProps {
  code: string;
  delay?: number;
  speed?: number;
  style?: React.CSSProperties;
}

// Python keywords for syntax highlighting
const PYTHON_KEYWORDS = [
  "def",
  "return",
  "if",
  "else",
  "elif",
  "for",
  "while",
  "class",
  "import",
  "from",
  "in",
  "not",
  "and",
  "or",
  "True",
  "False",
  "None",
];

export function CodeTypeWriter({
  code,
  delay = 0,
  speed = 1,
  style,
}: CodeTypeWriterProps) {
  const frame = useCurrentFrame();

  const charsToShow = Math.floor(Math.max(0, frame - delay) / speed);
  const displayCode = code.slice(0, charsToShow);
  const isTyping = charsToShow < code.length && charsToShow > 0;

  // Parse and colorize the displayed code
  const colorizedCode = colorizeCode(displayCode);

  return (
    <code style={{ ...style, display: "inline" }}>
      {colorizedCode}
      {isTyping && (
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 16,
            backgroundColor: "#e2e8f0",
            marginLeft: 2,
            opacity: frame % 20 < 10 ? 1 : 0,
          }}
        />
      )}
    </code>
  );
}

// Helper function to colorize code
function colorizeCode(code: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let remaining = code;
  let key = 0;

  while (remaining.length > 0) {
    let matched = false;

    // Check for strings (f-strings and regular strings)
    const stringMatch = remaining.match(/^(f?"[^"]*"|f?'[^']*')/);
    if (stringMatch) {
      result.push(
        <span key={key++} style={{ color: "#4ade80" }}>
          {stringMatch[0]}
        </span>
      );
      remaining = remaining.slice(stringMatch[0].length);
      matched = true;
      continue;
    }

    // Check for keywords
    for (const keyword of PYTHON_KEYWORDS) {
      if (remaining.startsWith(keyword) && !/[a-zA-Z0-9_]/.test(remaining[keyword.length] || "")) {
        result.push(
          <span key={key++} style={{ color: "#c084fc" }}>
            {keyword}
          </span>
        );
        remaining = remaining.slice(keyword.length);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Check for function names (word followed by parenthesis)
    const funcMatch = remaining.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\(/);
    if (funcMatch) {
      result.push(
        <span key={key++} style={{ color: "#fbbf24" }}>
          {funcMatch[1]}
        </span>
      );
      result.push(<span key={key++}>(</span>);
      remaining = remaining.slice(funcMatch[0].length);
      matched = true;
      continue;
    }

    // Default: add single character
    result.push(<span key={key++}>{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return result;
}
