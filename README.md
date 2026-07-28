# Hack Computer Architecture

This project is an interactive, browser-based simulator and portfolio project for exploring the construction of the Hack computer from first principles. It walks through the journey from a primitive NAND gate to a complete 16-bit computer, combining visual diagrams, logic simulation, and educational explanations.

## What this project covers

- The building blocks of digital logic, including NAND, NOT, AND, OR, XOR, and multiplexers
- The design of key chips such as Adders, ALU, Registers, RAM, and the CPU
- A visual hierarchy of the Hack computer architecture
- Interactive labs for understanding the ALU and computer-level behavior
- A portfolio-style presentation of the system as a learning experience

## Key features

- Interactive chip explorer with hierarchical navigation
- ALU lab for testing and visualizing arithmetic and logical operations
- CPU and computer simulator views for seeing the architecture in action
- Educational diagrams and explanations for each stage of the build
- Responsive React + Vite interface for local exploration

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Motion for UI animations

## Getting started

### Prerequisites

- Node.js 18+ recommended
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

### Build for production

```bash
npm run build
```

## Project structure

- src/components — UI views, diagrams, and interactive simulators
- src/data — HDL chip database and educational content
- src/utils — logic simulation helpers
- src/types.ts — shared TypeScript types

## Purpose

This project is designed for learners, educators, and enthusiasts who want to see how a computer is assembled from simple logic gates and how the Hack architecture emerges step by step.
