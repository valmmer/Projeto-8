import InputField from "../components/forms/InputField";
import { useCurriculo } from "../context/CurriculoContext";

export default function PersonalData() {
  const { data, setData } = useCurriculo();

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold">Dados Pessoais</h2>
      <InputField
        label="Nome Completo"
        value={data.nome}
        onChange={(val) => setData({ ...data, nome: val })}
      />
      <InputField
        label="Email"
        value={data.email}
        onChange={(val) => setData({ ...data, email: val })}
        type="email"
      />
      <InputField
        label="Telefone"
        value={data.telefone}
        onChange={(val) => setData({ ...data, telefone: val })}
      />
      <InputField
        label="Cidade / País"
        value={data.cidade}
        onChange={(val) => setData({ ...data, cidade: val })}
      />
    </div>
  );
}
