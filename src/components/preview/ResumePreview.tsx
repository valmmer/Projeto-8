// src/components/preview/ResumePreview.tsx
// Despacha para o template escolhido.

import React from 'react';
import { ClassicABNT, ModernClean } from './templates';

export type ResumeTemplateId = 'classico' | 'clean';

export default function ResumePreview({
  template,
}: {
  template: ResumeTemplateId;
}) {
  switch (template) {
    case 'clean':
      return <ModernClean />;
    case 'classico':
    default:
      return <ClassicABNT />;
  }
}
