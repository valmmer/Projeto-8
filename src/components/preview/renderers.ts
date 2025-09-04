// Renderers: registra e resolve templates de CV
import type { JSX } from "react";
import type { ResumeState } from "../../types";
import ClassicABNT from "./templates/ClassicABNT";
import ModernClean from "./templates/ModernClean";

export type TemplateId = "classic-abnt" | "modern-clean";

export type TemplateEntry = {
  id: TemplateId;
  name: string;
  Component: (props: { state: ResumeState }) => JSX.Element;
};

export const TEMPLATES: TemplateEntry[] = [
  { id: "classic-abnt", name: "Clássico (ABNT)", Component: ClassicABNT },
  { id: "modern-clean", name: "Moderno (Clean)", Component: ModernClean },
];

export function getTemplateById(id: TemplateId): TemplateEntry {
  return TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0];
}
