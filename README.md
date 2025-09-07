# Projeto-8 — Gerador de Currículo Inteligente

Aplicação **React + TypeScript + TailwindCSS v4 + Vite** para criar **currículos com preview em tempo real**, suporte a **múltiplos templates (ABNT & Modern)** e **exportação para PDF** no **cliente** _ou_ no **servidor (Puppeteer)**.

---

## 👥 Grupo 12 — Devcore

- Catarine Formiga de Farias
- Valmer Benedito Mariano
- Cassia Deiro Brito Mota
- Paola Pontes
- Samille Menezes

---

## ✨ Recursos principais

- **Formulário → Preview em tempo real** (split‑screen).
- **Dois templates prontos**:
  - `abnt` → 1 coluna, Times 12pt, entrelinha 1.5 (ABNT).
  - `modern` → 2 colunas, sans-serif, barras de proficiência.
- **Revisão com troca de template** na etapa final.
- **PDF cliente** (html2canvas + jsPDF) **ou servidor** (Puppeteer).
- **Validações úteis** (e‑mail, telefone, cidade‑estado, data de nascimento, período da experiência).
- **UX**: zoom & auto‑fit do preview, placeholders, teclas protegidas em inputs, seções “no-split” para impressão.

---

## 🗂️ Estrutura (resumo)

```
src/
├─ components/
│  ├─ preview/
│  │  ├─ ResumePreview.tsx          # escolhe o template
│  │  └─ templates/
│  │     ├─ ClassicABNT.tsx         # template 'abnt'
│  │     └─ ModernClean.tsx         # template 'modern'
│  ├─ Review.tsx                    # painel final (PDF cliente/servidor + troca de template)
│  ├─ PersonalForm.tsx              # dados pessoais
│  ├─ ObjectiveForm.tsx             # objetivo
│  ├─ SkillsForm.tsx                # hard/soft skills
│  ├─ experience/
│  │  ├─ ExperienceForm.tsx         # seção de experiências (com validação)
│  │  ├─ ExperienceItem.tsx         # item + PeriodPicker
│  │  └─ PeriodPicker.tsx           # MM/AAAA - MM/AAAA | MM/AAAA - Atual
│  ├─ education/
│  │  ├─ EducationForm.tsx          # seção de formação
│  │  └─ EducationItem.tsx          # item com "Ensino Médio", status e ano
│  └─ ui/…                          # botões etc.
│
├─ lib/
│  ├─ format.ts                     # helpers: formatPeriod, splitBullets, sort…
│  ├─ validators.ts                 # e‑mail, telefone, cidade‑estado, etc.
│  ├─ pdf/export.ts                 # PDF cliente (html2canvas + jsPDF)
│  └─ serverPrint.ts                # chamada ao endpoint /api/print/pdf
│
├─ state/
│  ├─ ResumeContext.tsx             # estado global (Provider + reducer + hooks)
│  └─ …
│
├─ styles/
│  ├─ print.css                     # regras @page, .page, .content, utilidades de impressão
│  └─ modern.css                    # CSS do template Modern
│
├─ App.tsx                          # wizard (6 etapas) + preview sticky
├─ main.tsx                         # entry
└─ index.css                        # Tailwind, print.css e modern.css importados
```

---

## 🧰 Stack

- **React 19**, **TypeScript**, **Vite**
- **TailwindCSS v4**
- **html2canvas** + **jsPDF** (PDF no cliente)
- **(Opcional) Puppeteer** no servidor para PDF fiel ao CSS de impressão

---

## 🚀 Rodando local

```bash
# 1) Instalar dependências
npm install

# 2) Rodar o dev server
npm run dev
```

Build e preview de produção:

```bash
npm run build
npm run preview
```

---

## ⚙️ Variáveis de ambiente

Para exportação **no servidor** (Puppeteer) você pode configurar a URL do endpoint:

```bash
# .env.local
VITE_PRINT_API=/api/print/pdf
```

Se não definir, o código usa `/api/print/pdf` por padrão.

---

## 🧾 Exportação para PDF

### 1) **Cliente** (html2canvas + jsPDF)

- Arquivo: `src/lib/pdf/export.ts`
- Função: `elementToPDF(element, { fileName, scale, imageQuality })`
- Usado no botão **“Baixar PDF (Cliente)”** do componente `Review.tsx`.

Prós: sem servidor.  
Contras: texto vira imagem (não é “selecionável”), fidelidade limitada em casos complexos.

### 2) **Servidor** (Puppeteer)

- Cliente chama `downloadServerPDF(urlOuHtml)` via `src/lib/serverPrint.ts`.
- Endpoint esperado: `POST /api/print/pdf` recebendo **`{ url }`** _ou_ **`{ html }`** e respondendo com `application/pdf`.

**Exemplo (Express) do endpoint**:

```ts
import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/api/print/pdf', async (req, res) => {
  const { url, html } = req.body || {};
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    if (url) {
      await page.goto(url, { waitUntil: 'networkidle0' });
    } else if (html) {
      await page.setContent(html, { waitUntil: 'networkidle0' });
    } else {
      return res.status(400).send('url ou html é obrigatório');
    }
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="curriculo.pdf"',
    );
    res.send(pdf);
  } catch (e) {
    res.status(500).send('Falha ao gerar PDF');
  } finally {
    await browser.close();
  }
});

app.listen(3000, () => console.log('print api on :3000'));
```

No **`Review.tsx`** já existe o botão **“Baixar PDF (Servidor)”** que aciona isso.

---

## 🧩 Templates

- **ABNT (`abnt`)**: `ClassicABNT.tsx` — 1 coluna, Times 12pt, entrelinha 1.5, recuo 1.25 cm.
- **Modern (`modern`)**: `ModernClean.tsx` — 2 colunas, contato compacto, barras de proficiência, soft skills em tags.

Ambos rendem `#cv-page > #cv-content`. O wrapper **não** deve ser duplicado.

Seleção de template no **preview** (lado direito) e na **revisão** (etapa 6).

---

## 🎛️ Validações & UX

- **Dados pessoais**: e‑mail/telefone, **Cidade - Estado** com normalização (“São Paulo - SP”).
- **Resumo**: mínimo recomendado (180+ caracteres).
- **Experiências**: período **`MM/AAAA - MM/AAAA`** ou **`MM/AAAA - Atual`** (regex unificada).
- **Formação (Education)**:
  - Checkbox **Ensino Médio** com rótulo automático `Ensino Médio (Completo|Incompleto)`.
  - Situação: `Completo` → **Concluído em YYYY**; `Incompleto` → **Término em YYYY**.
  - **Anos futuros** suportados (até “agora + 10”).

---

## 🖨️ CSS de Impressão / Modern

- `src/styles/print.css`: regras @page, `.page`, `.content`, util classes (`.no-split`, `.keep-with-next`), etc.
- `src/styles/modern.css`: layout do Modern (`.modern-*`), contato empilhado (Email / Site / LinkedIn / GitHub), listas, barras, etc.
- `src/index.css` importa **Tailwind**, **print.css** e **modern.css**.

---

## 🔧 Troubleshooting comum

- **`The requested module '…/Review.tsx' does not provide an export named 'default'`**  
  → Garanta `export default function Review(...) { … }` e **import padrão** em `App.tsx`:  
  `import Review from './components/Review'`.

- **`does not provide an export named 'elementToPDF'`**  
  → Verifique `src/lib/pdf/export.ts` exportando:  
  `export async function elementToPDF(...) { … }` (e o caminho do import em `Review.tsx`).

- **`Elemento não encontrado: #cv-page` ao exportar**  
  → O template precisa renderizar `id="cv-page"` (ex.: `ClassicABNT.tsx`, `ModernClean.tsx`).  
  Confira que **ResumePreview** apenas escolhe o template e **não** cria outro wrapper.

- **Server PDF 500**  
  → Confira a API: `POST /api/print/pdf` aceitando `{ url }` **ou** `{ html }`.  
  Em Vite dev, teste no console de rede se a resposta é `application/pdf`.

- **IDs de template**  
  → Use **`'abnt' | 'modern'`**. Strings antigas como `'classic-abnt'` quebram a tipagem.

---

## 🧪 Scripts

```jsonc
// package.json (exemplo)
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
  },
}
```

---

## ✅ Roadmap curto

- Exportação para **PNG** por página (cliente).
- Terceiro template (ex.: minimal “one‑page”).
- IA plugável para “melhorar descrição” (já há fallback local).
- Testes unitários dos formatadores/validadores.

---

## 📄 Licença

Uso educacional — ajuste conforme a necessidade do seu curso/time.
