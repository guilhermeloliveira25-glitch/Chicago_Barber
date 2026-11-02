"use client";

type TimeSelectorProps = {
  selectedTime: string;
  availableTimes: string[];
  // Horários já ocupados (opcional): aparecem riscados e bloqueados.
  unavailableTimes?: string[];
  onChange: (time: string) => void;
};

const QUARTERS = ["00", "15", "30", "45"];

// "09:15" -> { hour: "09", minute: "15" }
function splitTime(time: string) {
  const [hour, minute] = time.split(":");
  return { hour, minute };
}

function PeriodPanel({
  title,
  icon,
  times,
  selectedTime,
  unavailableTimes,
  onChange,
}: {
  title: string;
  icon: "sun" | "moon";
  times: string[];
  selectedTime: string;
  unavailableTimes: string[];
  onChange: (time: string) => void;
}) {
  if (times.length === 0) {
    return null;
  }

  // Agrupa por hora: cada linha tem 4 colunas fixas (:00 :15 :30 :45)
  const hours = Array.from(new Set(times.map((time) => splitTime(time).hour)));

  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-300">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-5 w-5 text-[#00D1FF]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {icon === "sun" ? (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </>
            ) : (
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            )}
          </svg>
          {title}
        </p>

        <span className="text-xs text-zinc-500">
          {times.length} {times.length === 1 ? "horário" : "horários"}
        </span>
      </div>

      <div className="space-y-2">
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[2.75rem_repeat(4,minmax(0,1fr))] items-center gap-2"
          >
            <span className="text-sm font-bold text-zinc-500">{hour}h</span>

            {QUARTERS.map((minute) => {
              const time = `${hour}:${minute}`;

              if (!times.includes(time)) {
                return <span key={minute} aria-hidden />;
              }

              const isSelected = selectedTime === time;
              const isUnavailable = unavailableTimes.includes(time);

              return (
                <button
                  key={minute}
                  type="button"
                  disabled={isUnavailable}
                  aria-pressed={isSelected}
                  aria-label={`${hour} horas e ${minute} minutos`}
                  onClick={() => onChange(time)}
                  className={`rounded-md border py-2.5 text-sm font-bold tabular-nums transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00D1FF] ${
                    isSelected
                      ? "border-[#DC2626] bg-[#DC2626] text-white shadow-[0_6px_20px_-8px_rgba(220,38,38,0.9)]"
                      : isUnavailable
                        ? "cursor-not-allowed border-dashed border-zinc-800 text-zinc-700 line-through"
                        : "border-zinc-700 bg-zinc-900/70 text-zinc-100 hover:border-[#00D1FF] hover:text-[#00D1FF]"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        ))}
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

      <div className="space-y-4">
        <PeriodPanel
          title="Manhã"
          icon="sun"
          times={morning}
          selectedTime={selectedTime}
          unavailableTimes={unavailableTimes}
          onChange={onChange}
        />
        <PeriodPanel
          title="Tarde"
          icon="moon"
          times={afternoon}
          selectedTime={selectedTime}
          unavailableTimes={unavailableTimes}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
