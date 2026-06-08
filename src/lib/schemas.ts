import { z } from 'zod';

export const dateField = z.string().date();

export const dateRangeSchema = z.object({
  date_from: dateField.optional(),
  date_to:   dateField.optional(),
});
