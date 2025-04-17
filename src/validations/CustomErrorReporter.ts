import type { ZodError } from "zod";

export class ZodCustomErrorReporter {
	errors: { [key: string]: string } = {};
	hasErrors = false;

	constructor(error: ZodError) {
		this.hasErrors = true;

		for (const issue of error.issues) {
			const field = issue.path.join(".") || "form";
			this.errors[field] = issue.message;
		}
	}

	createError() {
		return this.errors;
	}
}
