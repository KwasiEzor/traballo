import { Phone, MessageCircle } from "lucide-react";

export function FloatingContact({
  phone,
  whatsapp,
  raised = false,
}: {
  phone: string | null;
  whatsapp: string | null;
  /** Shift up to clear the AI chat launcher when it's present. */
  raised?: boolean;
}) {
  const wa = whatsapp?.replace(/[^\d+]/g, "");
  if (!phone && !wa) return null;

  return (
    <div
      className={`fixed right-4 z-40 flex flex-col gap-2 sm:right-6 ${
        raised ? "bottom-24 sm:bottom-28" : "bottom-4 sm:bottom-6"
      }`}
    >
      {wa && (
        <a
          href={`https://wa.me/${wa.replace(/^\+/, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
          aria-label="Contacter par WhatsApp"
        >
          <MessageCircle className="size-5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          className="flex items-center gap-2 rounded-full bg-[var(--sp)] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
          aria-label="Appeler"
        >
          <Phone className="size-5" />
          <span className="hidden sm:inline">Appeler</span>
        </a>
      )}
    </div>
  );
}
