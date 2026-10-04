const STEPS = ["Serviços", "Data", "Horário", "Confirmar"];

type StepIndicatorProps = {
  current: 1 | 2 | 3 | 4;
};

export default function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <ol
      aria-label="Etapas do agendamento"
      className="flex items-center gap-2 sm:gap-3"
    >
      {STEPS.map((label, index) => {
        const number = index + 1;
        const done = number < current;
        const active = number === current;

        return (
          <li
            key={label}
            aria-current={active ? "step" : undefined}
            className="flex items-center gap-2 sm:gap-3"
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition ${
                done
                  ? "border-[#00D1FF] bg-[#00D1FF]/15 text-[#00D1FF]"
                  : active
                    ? "border-[#FF5A00] bg-[#FF5A00] text-white"
                    : "border-zinc-700 text-zinc-500"
              }`}
            >
              {done ? "✓" : number}
            </span>

            <span
              className={`text-xs font-semibold uppercase tracking-wider ${
                active ? "inline text-white" : "hidden text-zinc-500 sm:inline"
              }`}
            >
              {label}
            </span>

            {number < STEPS.length && (
              <span aria-hidden className="h-px w-3 bg-zinc-700 sm:w-8" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
