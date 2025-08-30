// src/components/Stepper.tsx
import React from "react";

interface Step {
  id: number;
  label: string;
}

interface StepperProps {
  steps: Step[];
  current: number;
}

export default function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex items-center justify-between relative">
      {steps.map((step, index) => {
        const isActive = index === current;
        const isCompleted = index < current;

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Círculo */}
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full font-bold transition-colors duration-300
                ${
                  isActive
                    ? "bg-brand-500 text-white ring-4 ring-brand-500/30"
                    : isCompleted
                    ? "bg-brand-200 text-brand-700"
                    : "bg-slate-200 text-slate-500"
                }`}
            >
              {isCompleted ? "✓" : step.id}
            </div>

            {/* Label */}
            <span
              className={`ml-2 text-sm font-medium ${
                isActive ? "text-brand-600" : "text-slate-500"
              }`}
            >
              {step.label}
            </span>

            {/* Linha entre steps */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                  isCompleted ? "bg-brand-500" : "bg-slate-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
