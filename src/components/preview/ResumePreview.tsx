// src/components/preview/ResumePreview.tsx
import React from 'react';

// ajuste o import conforme seus caminhos/barrel:
import ClassicABNT from './templates/ClassicABNT';
import ModernClean from './templates/ModernClean';

export type ResumeTemplateId = 'abnt' | 'modern';

const TEMPLATES = {
  abnt: ClassicABNT,
  modern: ModernClean,
} as const;

export default function ResumePreview({
  template,
}: {
  template: ResumeTemplateId;
}) {
  const Comp = TEMPLATES[template] ?? ClassicABNT; // fallback
  // ⚠️ NÃO renderize wrappers extras aqui; cada template já cria #cv-page/#cv-content
  return <Comp />;
}
