import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { AnchorHTMLAttributes, forwardRef } from "react";

const linkVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer",
  {
    variants: {
      variant: {
        default: "text-primary hover:text-primary/90",
        destructive: "text-destructive hover:text-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "text-secondary-foreground hover:text-secondary-foreground/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        muted: "text-muted-foreground hover:text-foreground",
      },
      size: {
        default: "h-9 px-3 py-2",
        sm: "h-8 px-2.5 text-xs",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface LinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  asChild?: boolean;
  href: string;
  external?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    { className, children, variant, size, href, external = false, ...props },
    ref
  ) => {
    const externalProps = external
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    return (
      <a
        className={cn(linkVariants({ variant, size, className }))}
        ref={ref}
        href={href}
        {...externalProps}
        {...props}
      >
        {children}
      </a>
    );
  }
);

Link.displayName = "Link";

export { Link };
