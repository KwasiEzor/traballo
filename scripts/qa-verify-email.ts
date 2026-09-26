/**
 * scripts/qa-verify-email.ts
 * Marks a QA auth user's email as verified, so a test account created through
 * the real signup flow can sign in without receiving the verification email
 * (Resend rejects `.test` recipients: nothing is ever sent to them).
 *
 * Refuses any address outside the reserved `.test` TLD: it cannot touch a
 * real artisan's account.
 *
 * Run: npx tsx --env-file=.env.local scripts/qa-verify-email.ts qa-claude@traballo.test
 */
import postgres from "postgres";

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^@\s]+@[^@\s]+\.test$/.test(email)) {
  console.error("Usage: qa-verify-email.ts <address@domain.test> (.test only)");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!, {
  prepare: false,
  onnotice: () => {},
});

async function main() {
  const rows = await sql/*sql*/ `
    update "user"
    set email_verified = true, updated_at = now()
    where lower(email) = ${email}
    returning id, email_verified
  `;
  if (rows.length === 0) {
    console.error(`No auth user with email ${email}. Sign up first.`);
    process.exitCode = 1;
    return;
  }
  console.log(`Verified: ${email}`);
}

main()
  .then(() => sql.end())
  .catch((e) => {
    console.error(e);
    return sql.end().then(() => process.exit(1));
  });
