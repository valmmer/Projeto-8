// src/components/preview/index.tsx
import ResumePreviewDefault, { type ResumeTemplateId } from './ResumePreview';

// reexports úteis
export { default as ResumePreview } from './ResumePreview';
export type { ResumeTemplateId } from './ResumePreview';

// Componente default: permite usar `import Preview from '../components/preview'`
type Props = { template?: ResumeTemplateId };
export default function Preview({ template = 'abnt' }: Props) {
  return <ResumePreviewDefault template={template} />;
}
