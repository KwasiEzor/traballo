/**
 * Pattern Result<T, E> — gestion d'erreurs sans exceptions
 *
 * Usage :
 *   const result = await createInvoiceAction(formData);
 *   if (!result.ok) { toast.error(result.error.message); return; }
 *   router.push(`/dashboard/invoices/${result.value.id}`);
 */

export type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ─── Types d'erreurs applicatives ──────────────────────────────────────────

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "DB_ERROR"
  | "EXTERNAL_API_ERROR"
  | "INTERNAL_ERROR";

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

// Helpers pour créer des erreurs typées
export const errors = {
  validation: (details: unknown): AppError => ({
    code: "VALIDATION_ERROR",
    message: "Les données saisies sont invalides",
    details,
  }),
  unauthorized: (): AppError => ({
    code: "UNAUTHORIZED",
    message: "Authentification requise",
  }),
  forbidden: (): AppError => ({
    code: "FORBIDDEN",
    message: "Vous n'avez pas accès à cette ressource",
  }),
  notFound: (resource: string): AppError => ({
    code: "NOT_FOUND",
    message: `${resource} introuvable`,
  }),
  conflict: (message: string): AppError => ({
    code: "CONFLICT",
    message,
  }),
  internal: (context?: string): AppError => ({
    code: "INTERNAL_ERROR",
    message: "Une erreur inattendue est survenue",
    details: context,
  }),
};
