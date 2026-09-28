"use client";

type TimeSelectorProps = {
  selectedTime: string;
  availableTimes: string[];
  onChange: (time: string) => void;
};

export default function TimeSelector({
  selectedTime,
  availableTimes,
  onChange,
}: TimeSelectorProps) {
  if (availableTimes.length === 0) {
    return (
      <div className="mt-8 border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-sm font-black uppercase tracking-widest text-zinc-400">
          Horários
        </p>

        <p className="mt-3 text-zinc-400">
          Não há horários disponíveis para esta data.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-4">
        <p className="text-sm font-black uppercase tracking-widest text-zinc-400">
          Horários disponíveis
        </p>

        <p className="mt-1 text-sm text-zinc-500">
          Selecione um horário para continuar.
        </p>
      </div>

      <div className="overflow-hidden border border-zinc-800">
        <div className="grid grid-cols-[100px_1fr] bg-zinc-950">
          <div className="border-b border-r border-zinc-800 px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-500">
            Horário
          </div>

          <div className="border-b border-zinc-800 px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-500">
            Disponibilidade
          </div>

          {availableTimes.map((time) => {
            const isSelected = selectedTime === time;

            return (
              <button
                key={time}
                type="button"
                onClick={() => onChange(time)}
                className={`contents`}
              >
                <div
                  className={`border-b border-r border-zinc-800 px-4 py-4 text-left font-bold transition ${
                    isSelected
                      ? "bg-red-500 text-white"
                      : "bg-zinc-950 text-[#F5F1E8] hover:bg-zinc-900"
                  }`}
                >
                  {time}
                </div>

                <div
                  className={`border-b border-zinc-800 px-4 py-4 text-left text-sm transition ${
                    isSelected
                      ? "bg-red-500 font-bold text-white"
                      : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900"
                  }`}
                >
                  {isSelected ? "✓ Horário selecionado" : "Disponível"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}