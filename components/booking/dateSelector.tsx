"use client";

import {
  getTodayString,
  getMaxDateString,
  isClosedDay,
} from "./bookingUtils";

type DateSelectorProps = {
  selectedDate: string;
  onChange: (date: string) => void;
};

export default function DateSelector({
  selectedDate,
  onChange,
}: DateSelectorProps) {
  const todayString = getTodayString();
  const maxDateString = getMaxDateString();

  function handleDateChange(date: string) {
    // Não permite data anterior a hoje
    if (date < todayString) {
      return;
    }

    // Não permite data além de 1 mês
    if (date > maxDateString) {
      return;
    }

    // Não permite domingo
    if (isClosedDay(date)) {
      return;
    }

    onChange(date);
  }

  return (
    <div className="mt-8">
      <label
        htmlFor="booking-date"
        className="block text-sm font-black uppercase tracking-widest text-zinc-400"
      >
        Escolha a data
      </label>

      <input
        id="booking-date"
        type="date"
        value={selectedDate}
        onChange={(event) => handleDateChange(event.target.value)}
        min={todayString}
        max={maxDateString}
        className="mt-3 w-full border border-zinc-700 bg-zinc-900 px-4 py-3 text-[#F5F1E8] outline-none focus:border-red-500 sm:max-w-sm"
      />

      {selectedDate && (
        <p className="mt-3 text-zinc-300">
          Data escolhida:{" "}
          <strong className="text-[#F5F1E8]">
            {new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
              "pt-BR",
            )}
          </strong>
        </p>
      )}
    </div>
  );
}