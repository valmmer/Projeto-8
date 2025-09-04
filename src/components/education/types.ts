// src/components/education/types.ts

// Um alias simples para ID de string
export type ID = string;

// Define a estrutura de uma formação acadêmica
export type Education = {
  id: ID;                // Identificador único (gerado com uuid)
  instituicao: string;   // Nome da instituição
  curso: string;         // Nome do curso
  cidade?: string;       // Cidade (opcional)
  periodo: string;       // Período: "MM/AAAA - MM/AAAA" ou "MM/AAAA - Atual"
};
