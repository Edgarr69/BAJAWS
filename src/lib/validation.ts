import { z } from 'zod';

const uuidSchema = z.string().uuid();

export function parseUuid(id: string | undefined): string | null {
  const r = uuidSchema.safeParse(id);
  return r.success ? r.data : null;
}
