import { errors } from "@vinejs/vine";
import type { ErrorReporterContract, FieldContext } from "@vinejs/vine/types";

export class CustomErrorReporter implements ErrorReporterContract {
	hasErrors = false;

	errors: { [key: string]: string } = {};

	report(message: string, rule: string, field: FieldContext, meta?: any) {
		this.hasErrors = true;

		this.errors[field.wildCardPath] = message;
	}

	createError() {
		return new errors.E_VALIDATION_ERROR(this.errors);
	}
}
