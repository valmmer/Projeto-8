// Dropdown de escolha do template
import { TEMPLATES, type TemplateId } from './renderers';

export default function TemplateSwitcher({
  value,
  onChange,
}: {
  value: TemplateId;
  onChange: (v: TemplateId) => void;
}) {
  return (
    <select
      className="input w-[220px]"
      value={value}
      onChange={(e) => onChange(e.currentTarget.value as TemplateId)}
      title="Escolha o modelo do currículo"
    >
      {TEMPLATES.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
