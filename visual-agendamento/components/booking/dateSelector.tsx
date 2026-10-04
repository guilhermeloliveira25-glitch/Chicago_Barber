"use client";

import { useState } from "react";
import {
  getTodayString,
  getMaxDateString,
  isClosedDay,
  formatDateLong,
  formatTime,
  OPENING_TIME,
  CLOSING_TIME,
} from "./bookingUtils";

type DateSelectorProps = {
  selectedDate: string;
  onChange: (date: string) => void;
};

export default function DateSelector({
  selectedDate,
  onChange,
}: DateSelectorProps) {
  const [notice, setNotice] = useState("");

  const todayString = getTodayString();
  const maxDateString = getMaxDateString();

  function handleDateChange(date: string) {
    setNotice("");

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
      setNotice("Não abrimos aos domingos. Escolha outro dia.");
      return;
    }

    onChange(date);
  }

  return (
    <div className="mt-8">
      <label
        htmlFor="booking-date"
        className="block text-sm font-bold uppercase tracking-widest text-zinc-400"
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
        className="mt-3 w-full rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-white outline-none transition [color-scheme:dark] focus:border-[#FF5A00] focus:ring-2 focus:ring-[#FF5A00]/30 sm:max-w-sm"
      />

      <p className="mt-2 text-sm text-zinc-500">
        Atendemos de segunda a sábado, das {formatTime(OPENING_TIME)} às{" "}
        {formatTime(CLOSING_TIME)}.
      </p>

      {notice && (
        <p
          role="status"
          className="mt-3 border-l-4 border-[#FF5A00] bg-black/40 p-3 text-sm text-zinc-200"
        >
          {notice}
        </p>
      )}

      {selectedDate && (
        <p className="mt-3 text-zinc-300">
          Data escolhida:{" "}
          <strong className="font-bold capitalize text-white">
            {formatDateLong(selectedDate)}
          </strong>
        </p>
      )}
    </div>
  );
}
