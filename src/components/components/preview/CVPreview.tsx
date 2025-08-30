import { useCurriculo } from "../../context/CurriculoContext";

export default function CVPreview() {
  const { data } = useCurriculo();

  return (
    <div className="border rounded-lg p-6 max-w-2xl bg-white shadow">
      <h1 className="text-2xl font-bold">{data.nome || "Seu Nome"}</h1>
      <p className="text-sm">
        {data.email} | {data.telefone} | {data.linkedin || "LinkedIn"}
      </p>
      <hr className="my-3" />

      <h2 className="font-bold">Resumo Profissional</h2>
      <p>{data.resumo || "Adicione um resumo profissional..."}</p>
    </div>
  );
}
