export type StorefrontBlock = {
  id?: string;
  type?:
    | "hero"
    | "text"
    | "feature"
    | "promo"
    | "steps"
    | "testimonial"
    | "faq"
    | "cta"
    | "announcement";
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  buttonLabel?: string;
  href?: string;
  tone?: "default" | "highlight" | "dark" | "success";
  align?: "left" | "center";
};

export type StorefrontPage = {
  id?: string;
  scope: "tenant" | "marketplace";
  page: string;
  blocks: StorefrontBlock[];
  theme?: {
    primaryColor?: string;
    accentColor?: string;
    surfaceColor?: string;
  };
  isPublished?: boolean;
};
