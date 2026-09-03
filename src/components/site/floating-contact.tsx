import { Phone, MessageCircle } from "lucide-react";

export function FloatingContact({
  phone,
  whatsapp,
}: {
  phone: string | null;
  whatsapp: string | null;
}) {
  const wa = whatsapp?.replace(/[^\d+]/g, "");
  if (!phone && !wa) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 sm:bottom-6 sm:right-6">
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
