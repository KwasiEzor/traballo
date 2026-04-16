# Règles API Routes — src/app/api/

> Ce fichier surcharge le CLAUDE.md racine pour toutes les routes dans ce dossier.

## Structure obligatoire d'une route

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { z } from "zod";

// Schema de validation du body — défini EN DEHORS du handler
const bodySchema = z.object({ /* ... */ });

export async function POST(req: NextRequest) {
  // 1. Auth — toujours en premier
  const { tenantId } = await requireAuth();
  
  // 2. Parse + validation body
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }
  
  // 3. Logique métier (avec tenantId)
  try {
    const result = await doSomething(parsed.data, tenantId);
    return NextResponse.json({ data: result });
  } catch (error) {
    // Log interne, message générique au client
    console.error("[api/route]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Une erreur est survenue" } },
      { status: 500 }
    );
  }
}
```

## Réponse format standard

```typescript
// Succès
{ data: T, meta?: { page, total } }

// Erreur
{ error: { code: string, message: string, details?: unknown } }
```

## Codes d'erreur standard

```
VALIDATION_ERROR    → 400 — input invalide
UNAUTHORIZED        → 401 — non authentifié  
FORBIDDEN           → 403 — pas les droits
NOT_FOUND           → 404 — ressource introuvable
CONFLICT            → 409 — conflit (ex: numéro facture dupliqué)
INTERNAL_ERROR      → 500 — erreur serveur
```

## Webhooks (Stripe, WhatsApp)

Les webhooks ont leur propre vérification — ne pas utiliser `requireAuth()` :

```typescript
// src/app/api/webhooks/stripe/route.ts
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  
  // traiter l'event...
}
```
