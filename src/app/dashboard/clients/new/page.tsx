import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ClientForm } from "../client-form";

export const metadata: Metadata = { title: "Nouveau client" };

export default function NewClientPage() {
  return (
    <>
      <PageHeader
        title="Nouveau client"
        breadcrumb={[
          { label: "Clients", href: "/dashboard/clients" },
          { label: "Nouveau" },
        ]}
      />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <ClientForm />
        </CardContent>
      </Card>
    </>
  );
}
