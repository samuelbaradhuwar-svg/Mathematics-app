// Server-only: checks the parent PIN with a lock-out after repeated wrong tries.
import bcrypt from "bcryptjs";
import { db } from "./db";
import { HttpError } from "./serverAuth";

const MAX_TRIES = 5;
const LOCK_MINUTES = 5;

export async function verifyParentPin(learnerId: number, pin: string): Promise<void> {
  const row = await db
    .selectFrom("learners")
    .select(["parentPinHash", "pinFailedAttempts", "pinLockedUntil"])
    .where("id", "=", learnerId)
    .executeTakeFirst();
  if (!row || !row.parentPinHash) throw new HttpError(403, "No parent PIN has been set up.", "NO_PIN");

  if (row.pinLockedUntil && new Date(row.pinLockedUntil).getTime() > Date.now()) {
    const mins = Math.ceil((new Date(row.pinLockedUntil).getTime() - Date.now()) / 60000);
    throw new HttpError(429, `Too many tries. Please wait about ${mins} minute${mins === 1 ? "" : "s"} and try again.`, "PIN_LOCKED");
  }

  const ok = await bcrypt.compare(pin, row.parentPinHash);
  if (ok) {
    if (row.pinFailedAttempts > 0 || row.pinLockedUntil) {
      await db.updateTable("learners").set({ pinFailedAttempts: 0, pinLockedUntil: null }).where("id", "=", learnerId).execute();
    }
    return;
  }
  const failed = row.pinFailedAttempts + 1;
  if (failed >= MAX_TRIES) {
    await db
      .updateTable("learners")
      .set({ pinFailedAttempts: 0, pinLockedUntil: new Date(Date.now() + LOCK_MINUTES * 60000) })
      .where("id", "=", learnerId)
      .execute();
    throw new HttpError(429, `Too many tries. Please wait ${LOCK_MINUTES} minutes and try again.`, "PIN_LOCKED");
  }
  await db.updateTable("learners").set({ pinFailedAttempts: failed }).where("id", "=", learnerId).execute();
  throw new HttpError(403, "That PIN isn't right.", "BAD_PIN");
}