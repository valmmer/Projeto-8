import { useResume } from '../state/ResumeContext';

export default function ObjectiveForm() {
  const { state, dispatch } = useResume();
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Objetivo Profissional</h2>
      <div className="grid grid-cols-2 gap-3">
        <input
          className="input col-span-2"
          placeholder="Ex.: Gestor de Infraestrutura de TI com foco em cloud e segurança"
          value={state.dados.objetivo ?? ''}
          onChange={(e) =>
            dispatch({
              type: 'SET_DADOS',
              payload: { objetivo: e.target.value },
            })
          }
        />
        <input
          className="input"
          placeholder="Cidade / País (opcional)"
          value={state.dados.cidadePais ?? ''}
          onChange={(e) =>
            dispatch({
              type: 'SET_DADOS',
              payload: { cidadePais: e.target.value },
            })
          }
        />
      </div>
    </section>
  );
}
