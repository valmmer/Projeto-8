import Preview from './Preview';

export default function Review() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Revisão Final</h2>
        <button onClick={() => window.print()} className="btn btn-outline">
          Imprimir / PDF
        </button>
      </div>
      <div className="card">
        <div className="card-body">
          <Preview />
        </div>
      </div>
    </div>
  );
}
