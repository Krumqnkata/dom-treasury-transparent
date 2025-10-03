import { z } from "zod";

// Expense validation schema
export const expenseSchema = z.object({
  amount: z.number().positive({ message: "Сумата трябва да е положително число" }),
  date: z.string().min(1, { message: "Датата е задължителна" }),
  description: z.string().max(500, { message: "Описанието не може да е по-дълго от 500 символа" }).optional(),
  recipient: z.string().max(200, { message: "Името на получателя не може да е по-дълго от 200 символа" }).optional(),
  categoryId: z.string().optional(),
});

// Goal validation schema
export const goalSchema = z.object({
  title: z.string()
    .trim()
    .min(1, { message: "Заглавието е задължително" })
    .max(200, { message: "Заглавието не може да е по-дълго от 200 символа" }),
  target: z.number()
    .positive({ message: "Целевата сума трябва да е положително число" })
    .max(999999999, { message: "Целевата сума е твърде голяма" }),
  saved: z.number()
    .min(0, { message: "Спестената сума не може да е отрицателна" })
    .max(999999999, { message: "Спестената сума е твърде голяма" }),
}).refine((data) => data.saved <= data.target, {
  message: "Спестената сума не може да надвишава целевата",
  path: ["saved"],
});

// Category validation schema
export const categorySchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Името е задължително" })
    .max(100, { message: "Името не може да е по-дълго от 100 символа" }),
});

// Template validation schema
export const templateSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Името на шаблона е задължително" })
    .max(200, { message: "Името не може да е по-дълго от 200 символа" }),
  description: z.string()
    .max(500, { message: "Описанието не може да е по-дълго от 500 символа" })
    .optional(),
  amount: z.number()
    .positive({ message: "Сумата трябва да е положително число" })
    .max(999999999, { message: "Сумата е твърде голяма" })
    .optional()
    .nullable(),
  categoryId: z.string().optional(),
});

// Receipt file validation
export const receiptFileSchema = z.instanceof(File).refine(
  (file) => file.size <= 10 * 1024 * 1024, // 10MB
  { message: "Файлът не може да е по-голям от 10MB" }
).refine(
  (file) => file.type.startsWith('image/'),
  { message: "Файлът трябва да е изображение" }
);