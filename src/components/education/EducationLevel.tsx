import React from 'react';

export type Escol = 'medio' | 'superior';
export type MedioStatus = 'Completo' | 'Incompleto';

export type EducationLevelValue = {
  escolaridade: Escol;
  /** Só é usado quando escolaridade === 'medio' */
  medioStatus?: MedioStatus;
};

type Props = {
  value: EducationLevelValue;
  onChange: (v: EducationLevelValue) => void;
  label?: string;
  help?: string;
  error?: string;
  className?: string;
};

export default function EducationLevel({
  value,
  onChange,
  label = 'Escolaridade',
  help,
  error,
  className = '',
}: Props) {
  const { escolaridade, medioStatus } = value;

  const setEscolaridade = (esc: Escol) => {
    if (esc === 'superior') {
      // ao trocar para superior, limpamos o status do médio
      onChange({ escolaridade: 'superior' });
    } else {
      onChange({
        escolaridade: 'medio',
        medioStatus: medioStatus ?? 'Completo',
      });
    }
  };

  const setMedioStatus = (st: MedioStatus) => {
    onChange({ escolaridade: 'medio', medioStatus: st });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="label">{label}</label>

      {/* radios: Médio / Superior */}
      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="education-level"
            checked={escolaridade === 'medio'}
            onChange={() => setEscolaridade('medio')}
          />
          Ensino Médio
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="education-level"
            checked={escolaridade === 'superior'}
            onChange={() => setEscolaridade('superior')}
          />
          Superior
        </label>
      </div>

      {/* se Médio, mostra o select com status */}
      {escolaridade === 'medio' && (
        <div>
          <label className="label">Status</label>
          <select
            className={`input ${error ? 'border-red-500 ring-red-500/20' : ''}`}
            value={medioStatus ?? 'Completo'}
            onChange={(e) => setMedioStatus(e.target.value as MedioStatus)}
          >
            <option>Completo</option>
            <option>Incompleto</option>
          </select>
        </div>
      )}

      {error ? (
        <p className="help text-red-600">{error}</p>
      ) : help ? (
        <p className="help text-slate-500">{help}</p>
      ) : null}
    </div>
  );
}
