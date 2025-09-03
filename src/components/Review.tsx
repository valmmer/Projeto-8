import React, { useRef } from "react";
import Preview from "./Preview";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Review() {
  const cvRef = useRef<HTMLDivElement>(null);

  const gerarPDF = async () => {
    if (!cvRef.current) {
      console.log("Ref vazio, nada para capturar");
      return;
    }

    try {
      // Captura o conteúdo do Preview
      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Curriculo.pdf");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho e botões */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Revisão Final</h2>
        <div className="space-x-2">
          <button onClick={() => window.print()} className="btn btn-outline">
            Imprimir
          </button>
          <button onClick={gerarPDF} className="btn btn-primary">
            Gerar PDF
          </button>
        </div>
      </div>

      {/* Container capturado pelo PDF */}
      <div className="card">
        <div className="card-body">
          <div
            ref={cvRef}
            className="bg-white p-6 rounded shadow-lg w-full min-h-[600px]"
          >
            <Preview />
          </div>
        </div>
      </div>
    </div>
  );
}


