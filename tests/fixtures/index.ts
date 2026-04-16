/**
 * tests/fixtures/index.ts
 * Fixtures de test réutilisables pour toutes les entités Traballo
 * Pattern : objet de base + builder avec overrides
 */

// ─── Tenant ───────────────────────────────────────────────────────────────

export const mockTenant = {
  id: "tenant_test_001",
  slug: "jean-plombier",
  plan: "pro" as const,
  stripeCustomerId: "cus_test_001",
  stripeSubscriptionId: "sub_test_001",
  createdAt: new Date("2026-01-01T10:00:00Z"),
};

export const buildTenant = (o: Partial<typeof mockTenant> = {}) => ({
  ...mockTenant,
  ...o,
});

// ─── Artisan Profile ──────────────────────────────────────────────────────

export const mockArtisanProfile = {
  id: "profile_test_001",
  tenantId: "tenant_test_001",
  businessName: "Jean Plombier SPRL",
  ownerName: "Jean Dupont",
  email: "jean@dupont-plomberie.be",
  phone: "+32 477 12 34 56",
  whatsappNumber: "+32477123456",
  address: "Rue du Plombier 1, 1000 Bruxelles",
  vatNumber: "BE0123456789",
  iban: "BE12 3456 7890 1234",
  logoUrl: null,
  tradeType: "plombier",
};

// ─── Client ───────────────────────────────────────────────────────────────

export const mockClient = {
  id: "client_test_001",
  tenantId: "tenant_test_001",
  name: "Martin Martin",
  email: "martin@example.be",
  phone: "+32 02 123 45 67",
  address: "Avenue du Client 42, 1050 Bruxelles",
  notes: null,
  createdAt: new Date("2026-02-01T09:00:00Z"),
};

export const buildClient = (o: Partial<typeof mockClient> = {}) => ({
  ...mockClient,
  ...o,
});

// ─── Invoice ──────────────────────────────────────────────────────────────

export const mockInvoice = {
  id: "inv_test_001",
  tenantId: "tenant_test_001",
  clientId: "client_test_001",
  invoiceNumber: "FAC-2026-001",
  status: "draft" as const,
  issueDate: new Date("2026-04-01"),
  dueDate: new Date("2026-05-01"),
  subtotal: "100.00",
  taxAmount: "21.00",
  total: "121.00",
  notes: null,
  pdfUrl: null,
  sentAt: null,
  paidAt: null,
  createdAt: new Date("2026-04-01T10:00:00Z"),
  updatedAt: new Date("2026-04-01T10:00:00Z"),
};

export const buildInvoice = (o: Partial<typeof mockInvoice> = {}) => ({
  ...mockInvoice,
  ...o,
});

export const mockOverdueInvoice = buildInvoice({
  id: "inv_test_overdue",
  invoiceNumber: "FAC-2026-000",
  status: "overdue",
  dueDate: new Date("2026-01-01"), // passé
  sentAt: new Date("2026-01-15"),
});

export const mockPaidInvoice = buildInvoice({
  id: "inv_test_paid",
  invoiceNumber: "FAC-2025-099",
  status: "paid",
  paidAt: new Date("2026-03-15"),
  sentAt: new Date("2026-03-01"),
});

// ─── Invoice Items ────────────────────────────────────────────────────────

export const mockInvoiceItem = {
  id: "item_test_001",
  invoiceId: "inv_test_001",
  description: "Remplacement robinet cuisine",
  quantity: "1.00",
  unitPrice: "80.00",
  taxRate: "21.00",
  total: "96.80",
};

// ─── Appointment ──────────────────────────────────────────────────────────

export const mockAppointment = {
  id: "apt_test_001",
  tenantId: "tenant_test_001",
  clientId: "client_test_001",
  title: "Réparation fuite cuisine",
  startTime: new Date("2026-04-20T09:00:00Z"),
  endTime: new Date("2026-04-20T11:00:00Z"),
  status: "confirmed" as const,
  notes: "Accès par la porte de derrière",
  reminderSent: false,
};

export const buildAppointment = (o: Partial<typeof mockAppointment> = {}) => ({
  ...mockAppointment,
  ...o,
});

// ─── AI Agent Config ──────────────────────────────────────────────────────

export const mockAiAgentConfig = {
  id: "ai_config_test_001",
  tenantId: "tenant_test_001",
  agentName: "Assistant Jean",
  isEnabled: true,
  tone: "informal" as const,
  languages: ["fr"],
  businessContext: "Plomberie et chauffage. Zone : Bruxelles et périphérie. Disponible du lundi au vendredi 8h-18h.",
  openingMessage: "Bonjour ! Je suis l'assistant de Jean Plombier. Comment puis-je vous aider ?",
  offHoursMessage: "Nous sommes fermés pour le moment. Jean vous recontactera dès lundi matin.",
};

// ─── Auth context (pour les mocks requireAuth) ────────────────────────────

export const mockAuthContext = {
  tenantId: "tenant_test_001",
  userId: "user_test_001",
  plan: "pro" as const,
};

export const mockFreemiumAuthContext = {
  ...mockAuthContext,
  plan: "free" as const,
};

export const mockBusinessAuthContext = {
  ...mockAuthContext,
  plan: "business" as const,
};
