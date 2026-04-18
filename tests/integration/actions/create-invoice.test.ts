import { beforeEach, describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createInvoice } from "@/app/dashboard/invoices/actions/create-invoice";
import { requireAuth } from "@/lib/auth";

const mocks = vi.hoisted(() => {
  const invoiceFindFirst = vi.fn();
  const transaction = vi.fn();

  return {
    invoiceFindFirst,
    transaction,
  };
});

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      invoices: {
        findFirst: mocks.invoiceFindFirst,
      },
    },
    transaction: mocks.transaction,
  },
}));

describe("createInvoice", () => {
  let insertStep = 0;
  const invoiceReturning = vi.fn();
  const invoiceValues = vi.fn(() => ({
    returning: invoiceReturning,
  }));
  const itemsValues = vi.fn();
  const txInsert = vi.fn(() => {
    if (insertStep === 0) {
      insertStep += 1;
      return { values: invoiceValues };
    }

    return { values: itemsValues };
  });

  beforeEach(() => {
    insertStep = 0;
    vi.mocked(requireAuth).mockResolvedValue({
      tenantId: "tenant_test_001",
      userId: "user_test_001",
      email: "owner@test.traballo",
      plan: "pro",
      role: "owner",
    });

    mocks.invoiceFindFirst.mockResolvedValue({
      invoiceNumber: "INV-0042",
    });

    invoiceReturning.mockResolvedValue([
      {
        id: "inv_new_001",
        invoiceNumber: "INV-0043",
      },
    ]);

    itemsValues.mockResolvedValue(undefined);

    mocks.transaction.mockImplementation(
      async (callback: (tx: { insert: typeof txInsert }) => Promise<unknown>) =>
        callback({
          insert: txInsert,
        })
    );
  });

  it("creates a tenant-scoped invoice, inserts its items, and redirects to the detail page", async () => {
    await createInvoice({
      clientId: "550e8400-e29b-41d4-a716-446655440000",
      issueDate: "2026-04-16",
      dueDate: "2026-05-16",
      items: [
        {
          description: "Installation chauffe-eau",
          quantity: 2,
          unitPrice: 450,
          taxRate: 21,
        },
      ],
    });

    expect(mocks.invoiceFindFirst).toHaveBeenCalled();
    expect(invoiceValues).toHaveBeenCalledWith({
      tenantId: "tenant_test_001",
      clientId: "550e8400-e29b-41d4-a716-446655440000",
      invoiceNumber: "INV-0043",
      issueDate: "2026-04-16",
      dueDate: "2026-05-16",
      subtotal: "900.00",
      taxAmount: "189.00",
      total: "1089.00",
      status: "draft",
    });
    expect(itemsValues).toHaveBeenCalledWith([
      {
        tenantId: "tenant_test_001",
        invoiceId: "inv_new_001",
        description: "Installation chauffe-eau",
        quantity: "2",
        unitPrice: "450",
        taxRate: "21",
        total: "1089.00",
      },
    ]);
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/invoices");
    expect(redirect).toHaveBeenCalledWith("/dashboard/invoices/inv_new_001");
  });

  it("starts numbering at INV-0001 when the tenant has no prior invoice", async () => {
    mocks.invoiceFindFirst.mockResolvedValueOnce(undefined);

    await createInvoice({
      clientId: "550e8400-e29b-41d4-a716-446655440000",
      issueDate: "2026-04-16",
      dueDate: "2026-05-16",
      items: [
        {
          description: "Diagnostic",
          quantity: 1,
          unitPrice: 100,
          taxRate: 0,
        },
      ],
    });

    expect(invoiceValues).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceNumber: "INV-0001",
      })
    );
  });

  it("returns a validation error when the payload is invalid", async () => {
    const result = await createInvoice({
      clientId: "not-a-uuid",
      issueDate: "",
      dueDate: "",
      items: [],
    });

    expect(result).toEqual({
      error: expect.stringContaining("Client invalide"),
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("rejects an invoice whose due date is before the issue date", async () => {
    const result = await createInvoice({
      clientId: "550e8400-e29b-41d4-a716-446655440000",
      issueDate: "2026-05-16",
      dueDate: "2026-04-16",
      items: [
        {
          description: "Diagnostic",
          quantity: 1,
          unitPrice: 100,
          taxRate: 0,
        },
      ],
    });

    expect(result).toEqual({
      error:
        "La date d'échéance doit être postérieure ou égale à la date d'émission",
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
