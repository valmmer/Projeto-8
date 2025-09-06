// src/components/preview/ResumePreview.tsx
import ClassicABNT from './templates/ClassicABNT';
import ModernClean from './templates/ModernClean';

export type ResumeTemplateId = 'classico' | 'modern';

type Props = { template: ResumeTemplateId };

export default function ResumePreview({ template }: Props) {
  switch (template) {
    case 'classico':
      return <ClassicABNT />; // ⚠️ o template já renderiza <div id="cv-page" class="page abnt">
    case 'modern':
      return <ModernClean />; // ⚠️ o template já renderiza <div id="cv-page" class="page modern">
    default:
      return <ClassicABNT />;
  }
}
