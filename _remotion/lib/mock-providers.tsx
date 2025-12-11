import React, { createContext, useContext } from "react";

/**
 * Mock Providers for Next.js Dependencies
 *
 * Remotion can't use Next.js navigation hooks directly since it doesn't
 * run in a Next.js environment. These mocks allow us to reuse components
 * that depend on these hooks.
 */

// Mock Next.js navigation context
interface MockNavigationContextValue {
  pathname: string;
  push: (url: string) => void;
  replace: (url: string) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  prefetch: (url: string) => void;
}

const MockNavigationContext = createContext<MockNavigationContextValue>({
  pathname: "/",
  push: () => {},
  replace: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
  prefetch: () => {},
});

// Mock useRouter hook
export function useRouter() {
  return useContext(MockNavigationContext);
}

// Mock usePathname hook
export function usePathname() {
  return useContext(MockNavigationContext).pathname;
}

// Mock useSearchParams hook
export function useSearchParams() {
  return new URLSearchParams();
}

// Mock Link component - renders as a span since we can't navigate in videos
interface MockLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

export function MockLink({ children, className, ...props }: MockLinkProps) {
  return (
    <span className={className} {...props}>
      {children}
    </span>
  );
}

// Provider wrapper for components needing navigation context
interface MockProvidersProps {
  children: React.ReactNode;
  pathname?: string;
}

export function MockProviders({ children, pathname = "/" }: MockProvidersProps) {
  const value: MockNavigationContextValue = {
    pathname,
    push: () => {},
    replace: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
    prefetch: () => {},
  };

  return (
    <MockNavigationContext.Provider value={value}>
      {children}
    </MockNavigationContext.Provider>
  );
}

// Mock next/image - renders as a regular img
interface MockImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  [key: string]: unknown;
}

export function MockImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  style,
  ...props
}: MockImageProps) {
  const imgStyle: React.CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }
    : style || {};

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={imgStyle}
      {...props}
    />
  );
}
