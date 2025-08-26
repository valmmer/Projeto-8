# Projeto-8 — Gerador de Currículo Inteligente

Aplicação React + TypeScript + TailwindCSS + Vite que permite criar **currículos profissionais com preview em tempo real**.  
O foco é em **conceitos fundamentais de React**: formulários controlados, estado compartilhado, listas dinâmicas e componentização.

---

## 👥 Grupo 12 — Devcore

**Participantes do projeto:**

- Catarine Formiga de Farias
- Valmer Benedito Mariano
- Cassia Deiro Brito Mota
- Paola Pontes

---

## 🎯 Objetivo

- Criar um currículo em tempo real, digitando no formulário à esquerda e visualizando no preview à direita.
- Exercitar conceitos avançados de **React** e **TailwindCSS v4**.

---

## 🖥️ Requisitos Funcionais

1. **Layout Split-Screen**

   - Tela dividida 50% Formulário / 50% Preview.
   - Scroll independente em cada lado.

2. **Formulário de Dados Pessoais**

   - Nome, Email, Telefone, LinkedIn.
   - Resumo profissional com contador de caracteres.

3. **Gerenciamento de Habilidades**

   - Lista dinâmica de habilidades.
   - Seletor de nível (Básico, Intermediário, Avançado).
   - Adicionar/remover itens.

4. **Gerenciamento de Experiências**

   - Campos: Empresa, Cargo, Período, Descrição.
   - Checkbox “Trabalho atual”.
   - Validação de datas.

5. **Preview em Tempo Real**
   - Atualização instantânea ao digitar.
   - Layout profissional e placeholders para campos vazios.

---

## ⚙️ Stack

- **React 19**
- **TypeScript**
- **TailwindCSS v4**
- **Vite**

---

## 🚀 Como rodar

```bash
# instalar dependências
npm install

# rodar dev server
npm run dev
```

📂 Estrutura de pastas

src/
├─ components/ # Formulários e Preview
├─ state/ # Contexto e reducer
├─ types.ts # Tipagens globais
├─ App.tsx # Layout split-screen
├─ main.tsx # Entry point
└─ index.css # Tailwind e estilos globais

📌 Próximos passos

Implementar SkillsForm e ExperienceForm.

Melhorar validações e feedback visual.

Exportar currículo em PDF (fase 2 do projeto).
