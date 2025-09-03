import Preview from './Preview';

export default function Review() {
  // 👉 Aqui declaramos a função handleVoltar
  const handleVoltar = () => {
    window.history.back(); // ou outro comportamento que você quiser
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center no-print">
        <h2 className="text-xl font-semibold">Revisão Final</h2>
        <button onClick={() => window.print()} className="btn btn-outline">
          Imprimir / PDF
        </button>
      </div>

      <div className="card print-full">
        <div className="card-body">
          <Preview />
        </div>
      </div>

      {/* Voltar - com no-print para esconder na impressão */}
      <div className="no-print">
        <button className="btn btn-outline" onClick={handleVoltar}>
          Voltar
        </button>
      </div>
    </div>
  );
}
