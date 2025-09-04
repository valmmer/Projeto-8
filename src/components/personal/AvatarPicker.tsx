// src/components/personal/AvatarPicker.tsx
// -------------------------------------------------------------
// AvatarPicker com botões EMPILHADOS (Selecionar acima, Remover abaixo)
// e um divisor entre eles. Assim nada “sai” do quadro.
// • Wrapper sem `items-center` → filhos esticam (w-full) corretamente
// • Botões compactos (btn-sm ou btn-xs) + whitespace-nowrap
// • “Remover” fica desabilitado quando não há foto
// • Valida formato (PNG/JPG/WEBP) e tamanho (≤ 3 MB)
// -------------------------------------------------------------

import { useId, useRef } from 'react';

type Props = {
  foto?: string;
  erro?: string;
  setErro?: (msg: string) => void;
  onChangeUrl: (url: string) => void;
  onClear: () => void;
};

const MAX_MB = 3;
const ACCEPT = ['image/png', 'image/jpeg', 'image/webp'];

export default function AvatarPicker({
  foto,
  erro = '',
  setErro,
  onChangeUrl,
  onClear,
}: Props) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement | null>(null);

  function handleFile(file: File) {
    if (!ACCEPT.includes(file.type)) {
      setErro?.('Formato inválido. Use PNG, JPG ou WEBP.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setErro?.(`Arquivo muito grande. Máx. ${MAX_MB}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setErro?.('');
      onChangeUrl(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // permite selecionar o MESMO arquivo novamente
    e.currentTarget.value = '';
  }

  function openPicker() {
    fileRef.current?.click();
  }

  const canRemove = Boolean(foto && foto.trim().length > 0);

  return (
    <div className="avatar-panel">
      {/* ⚠️ sem items-center: filhos ocupam 100% da largura do painel */}
      <div className="flex flex-col gap-3 items-stretch">
        {/* Avatar centralizado individualmente */}
        <div
          className="mx-auto w-28 h-28 rounded-full border border-slate-300 overflow-hidden bg-white grid place-items-center"
          aria-label="Foto do perfil"
        >
          {canRemove ? (
            <img
              src={foto}
              alt="Foto do perfil"
              className="w-full h-full object-cover"
              width={112}
              height={112}
              decoding="async"
            />
          ) : (
            <span className="text-xs text-slate-500 select-none">Sem foto</span>
          )}
        </div>

        {/* Input nativo escondido */}
        <input
          id={inputId}
          ref={fileRef}
          type="file"
          accept={ACCEPT.join(',')}
          className="hidden"
          onChange={onInputChange}
        />

        {/* Botão Selecionar — sempre visível (topo) */}
        <button
          type="button"
          onClick={openPicker}
          className="btn btn-outline btn-sm w-full whitespace-nowrap"
          title="Selecionar arquivo de imagem (PNG, JPG ou WEBP)"
        >
          Selecionar foto
        </button>

        {/* Divisor entre as ações */}
        <hr className="border-slate-200 my-1" />

        {/* Botão Remover — embaixo; desabilitado quando não há foto */}
        <button
          type="button"
          className="btn btn-outline btn-sm w-full whitespace-nowrap"
          disabled={!canRemove}
          aria-disabled={!canRemove}
          onClick={() => {
            if (!canRemove) return;
            onClear();
            setErro?.('');
          }}
        >
          Remover
        </button>

        {/* Dica + Erro */}
        <p className="avatar-hint">
          PNG/JPG/WEBP · até {MAX_MB}MB • Use fundo neutro.
        </p>
        {erro && (
          <p className="text-xs text-red-600" role="alert" aria-live="polite">
            {erro}
          </p>
        )}
      </div>
    </div>
  );
}
