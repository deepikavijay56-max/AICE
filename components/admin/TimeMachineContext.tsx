"use client";

import React, { createContext, useContext, useState } from "react";

interface TimeMachineContextType {
  simulatedDaysOffset: number;
  simulatedDate: Date;
  advanceDays: (days: number) => void;
  resetTime: () => void;
  isSimulated: boolean;
}

const TimeMachineContext = createContext<TimeMachineContextType>({
  simulatedDaysOffset: 0,
  simulatedDate: new Date(),
  advanceDays: () => {},
  resetTime: () => {},
  isSimulated: false,
});

export function TimeMachineProvider({ children }: { children: React.ReactNode }) {
  const [daysOffset, setDaysOffset] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("aicte_demo_time_offset");
        if (stored) {
          const val = parseInt(stored, 10);
          return isNaN(val) ? 0 : val;
        }
      } catch {
        return 0;
      }
    }
    return 0;
  });

  const [baseDate] = useState<Date>(() => new Date());

  const advanceDays = (additionalDays: number) => {
    setDaysOffset((prev) => {
      const next = prev + additionalDays;
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("aicte_demo_time_offset", next.toString());
        } catch {}
      }
      return next;
    });
  };

  const resetTime = () => {
    setDaysOffset(0);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("aicte_demo_time_offset");
      } catch {}
    }
  };

  const simulatedDate = new Date(baseDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);

  return (
    <TimeMachineContext.Provider
      value={{
        simulatedDaysOffset: daysOffset,
        simulatedDate,
        advanceDays,
        resetTime,
        isSimulated: daysOffset > 0,
      }}
    >
      {children}
    </TimeMachineContext.Provider>
  );
}

export function useTimeMachine() {
  return useContext(TimeMachineContext);
}
