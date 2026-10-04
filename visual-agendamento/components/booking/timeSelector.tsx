"use client";

type TimeSelectorProps = {
  selectedTime: string;
  availableTimes: string[];
  // Horários já ocupados (opcional): aparecem riscados e bloqueados.
  unavailableTimes?: string[];
  onChange: (time: string) => void;
};

function TimeGroup({
  title,
  times,
  selectedTime,
  unavailableTimes,
  onChange,
}: {
  title: string;
  times: string[];
  selectedTime: string;
  unavailableTimes: string[];
  onChange: (time: string) => void;
}) {
  if (times.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
        {title}
      </p>

      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {times.map((time) => {
          const isSelected = selectedTime === time;
          const isUnavailable = unavailableTimes.includes(time);

          return (
            <button
              key={time}
              type="button"
              disabled={isUnavailable}
              aria-pressed={isSelected}
              onClick={() => onChange(time)}
              className={`rounded-md border px-2 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF] ${
                isSelected
                  ? "border-[#FF5A00] bg-[#FF5A00] text-white shadow-[0_6px_20px_-8px_rgba(255,90,0,0.9)]"
                  : isUnavailable
                    ? "cursor-not-allowed border-zinc-800 bg-zinc-900/40 text-zinc-600 line-through"
                    : "border-zinc-700 bg-zinc-900/80 text-zinc-100 hover:border-[#00D1FF] hover:text-[#00D1FF]"
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TimeSelector({
  selectedTime,
  availableTimes,
  unavailableTimes = [],
  onChange,
}: TimeSelectorProps) {
  if (availableTimes.length === 0) {
    return (
      <div className="mt-8 rounded-md border border-white/10 bg-black/30 p-6">
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
          Horários
        </p>

        <p className="mt-3 text-zinc-400">
          Não há horários disponíveis para esta data.
        </p>
      </div>
    );
  }

  const morning = availableTimes.filter((time) => time < "12:00");
  const afternoon = availableTimes.filter((time) => time >= "12:00");

  return (
    <div className="mt-8">
      <div className="mb-5">
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
          Horários disponíveis
        </p>

        <p className="mt-1 text-sm text-zinc-500">
          Selecione um horário para continuar.
        </p>
      </div>

      <div className="space-y-6">
        <TimeGroup
          title="Manhã"
          times={morning}
          selectedTime={selectedTime}
          unavailableTimes={unavailableTimes}
          onChange={onChange}
        />
        <TimeGroup
          title="Tarde"
          times={afternoon}
          selectedTime={selectedTime}
          unavailableTimes={unavailableTimes}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
