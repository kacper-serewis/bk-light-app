import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight text-balance",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      code: "bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      lead: "text-muted-foreground text-xl",
      large: "text-lg font-semibold",
      small: "text-sm leading-none font-medium",
      muted: "text-muted-foreground text-sm",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

type VariantElementMap = {
  h1: "span";
  h2: "span";
  h3: "span";
  h4: "span";
  p: "span";
  blockquote: "span";
  code: "code";
  lead: "span";
  large: "span";
  small: "span";
  muted: "span";
};

const variantElementMap: VariantElementMap = {
  h1: "span",
  h2: "span",
  h3: "span",
  h4: "span",
  p: "span",
  blockquote: "span",
  code: "code",
  lead: "span",
  large: "span",
  small: "span",
  muted: "span",
};

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: keyof JSX.IntrinsicElements;
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant = "p", as, children, ...props }, ref) => {
    const Component = as || variantElementMap[variant || "p"];

    return React.createElement(
      Component,
      {
        className: cn(textVariants({ variant }), className),
        ref,
        ...props,
      },
      children
    );
  }
);

Text.displayName = "Text";

export { Text, textVariants };
