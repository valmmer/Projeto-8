import { createContext, useState, useContext, ReactNode } from "react";

type CurriculoData = {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  linkedin?: string;
  github?: string;
  resumo?: string;
  formacoes?: string[];
  habilidades?: string[];
  experiencias?: string[];
  certificacoes?: string[];
  idiomas?: string[];
};

type CurriculoContextType = {
  data: CurriculoData;
  setData: (data: CurriculoData) => void;
};

const CurriculoContext = createContext<CurriculoContextType | undefined>(undefined);

export const CurriculoProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<CurriculoData>({
    nome: "",
    email: "",
    telefone: "",
    cidade: "",
  });

  return (
    <CurriculoContext.Provider value={{ data, setData }}>
      {children}
    </CurriculoContext.Provider>
  );
};

export const useCurriculo = () => {
  const context = useContext(CurriculoContext);
  if (!context) throw new Error("useCurriculo deve ser usado dentro de CurriculoProvider");
  return context;
};
