import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { artisanProfiles } from "@/db/schema";
import { sendEmail } from "@/lib/email/send";

/**
 * E-mail the artisan at their business address (the one on invoices and
 * lead e-mails). Owner connection with an explicit `tenant_id` filter, like
 * the rest of the notification write path.
 *
 * Never throws: returns whether the e-mail went out.
 */
export async function sendArtisanEmail(
  tenantId: string,
  mail: { subject: string; react: React.ReactElement }
): Promise<boolean> {
  try {
    const [profile] = await db
      .select({ email: artisanProfiles.email })
      .from(artisanProfiles)
      .where(eq(artisanProfiles.tenantId, tenantId))
      .limit(1);
    if (!profile?.email) return false;

    const res = await sendEmail({ to: profile.email, ...mail });
    if ("error" in res && res.error) {
      console.error("sendArtisanEmail: not sent", res.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("sendArtisanEmail failed", err);
    return false;
  }
}
