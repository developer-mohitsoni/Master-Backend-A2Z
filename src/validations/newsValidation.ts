import { z } from "zod";

export const newsSchema = z.object({
	title: z
		.string()
		.min(5, "Title must be at least 5 characters")
		.max(190, "Title must be at most 190 characters"),
	content: z
		.string()
		.min(10, "Content must be at least 10 characters")
		.max(3000, "Content must be at most 3000 characters")
});
