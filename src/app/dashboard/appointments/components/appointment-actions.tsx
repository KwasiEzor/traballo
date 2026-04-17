"use client";

/**
 * Appointment actions component
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAppointmentStatus } from "../actions/update-status";
import type { Appointment } from "@/db/schema";

interface AppointmentActionsProps {
  appointment: Appointment;
}

export function AppointmentActions({ appointment }: AppointmentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (
    status: "confirmed" | "cancelled" | "completed"
  ) => {
    setLoading(true);
    try {
      const result = await updateAppointmentStatus(appointment.id, status);

      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    } catch (error) {
      alert("Failed to update appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {appointment.status === "pending" && (
        <button
          onClick={() => handleUpdateStatus("confirmed")}
          disabled={loading}
          className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
        >
          ✓ Confirmer
        </button>
      )}
      {(appointment.status === "pending" ||
        appointment.status === "confirmed") && (
        <>
          <button
            onClick={() => handleUpdateStatus("completed")}
            disabled={loading}
            className="rounded-lg border bg-white px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            Terminer
          </button>
          <button
            onClick={() => handleUpdateStatus("cancelled")}
            disabled={loading}
            className="rounded-lg border border-red-600 bg-white px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Annuler
          </button>
        </>
      )}
    </div>
  );
}
