/**
 * New client page
 */

import { ClientForm } from "../components/client-form";

export default function NewClientPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Nouveau client</h1>
      <div className="max-w-2xl rounded-lg border bg-white p-6">
        <ClientForm />
      </div>
    </div>
  );
}
