import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Tipagem dos dados do CV
interface Experiencia {
  empresa: string;
  cargo: string;
  data: string;
  realizacoes: string[];
}

interface DadosCV {
  nome: string;
  cidade: string;
  telefone: string;
  email: string;
  linkedin: string;
  github: string;
  resumo: string;
  experiencias: Experiencia[];
  formacao: string;
  habilidades: string[];
}

interface CVProps {
  dados: DadosCV;
}

const CV: React.FC<CVProps> = ({ dados }) => {
  const cvRef = useRef<HTMLDivElement>(null);

  const gerarPDF = () => {
    if (!cvRef.current) return;

    html2canvas(cvRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Curriculo.pdf");
    });
  };

  return (
    <div>
      {/* Container estilizado */}
      <div ref={cvRef} className="bg-white p-6 rounded shadow-lg font-sans max-w-2xl mx-auto">
        {/* Dados pessoais */}
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold">{dados.nome}</h1>
          <p className="text-sm text-gray-700">
            {dados.cidade} | {dados.telefone} | {dados.email} | {dados.linkedin} | {dados.github}
          </p>
          <hr className="mt-2 border-gray-300" />
        </header>

        {/* Resumo Profissional */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg border-b border-gray-300">Resumo Profissional</h2>
          <p className="mt-2 text-justify">{dados.resumo}</p>
        </section>

        {/* Experiências */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg border-b border-gray-300">Experiências</h2>
          {dados.experiencias.map((exp, i) => (
            <div key={i} className="mt-3">
              <p className="font-bold">{exp.empresa}</p>
              <p className="italic">{exp.cargo} | {exp.data}</p>
              <ul className="list-disc ml-5 mt-1">
                {exp.realizacoes.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Formação Acadêmica */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg border-b border-gray-300">Formação Acadêmica</h2>
          <p className="mt-2">{dados.formacao}</p>
        </section>

        {/* Habilidades */}
        <section>
          <h2 className="font-semibold text-lg border-b border-gray-300">Habilidades</h2>
          <p className="mt-2">{dados.habilidades.join(" • ")}</p>
        </section>
      </div>

      <button
        onClick={gerarPDF}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Gerar PDF
      </button>
    </div>
  );
};

export default CV;
