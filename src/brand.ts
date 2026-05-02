import logoSvg from "./assets/logo.svg?raw";

export const BRAND = {
  company: "Jito",
  homepage: "https://www.jito.network",
  logoSvg,
  // Mandatory non-affiliation disclaimer (rendered in footer of every app).
  attribution: "An independent tool by Ryan Lacerda · Not affiliated with Jito.",
} as const;
