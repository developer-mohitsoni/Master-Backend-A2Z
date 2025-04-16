import type { JwtPayload } from "jsonwebtoken";

export interface User {
	id: number;
	name: string;
	email: string;
	password: string;
	profile?: string | null;
	created_at: Date;
	updated_at: Date;
}

export interface MyJwtPayload extends JwtPayload {
	userId: string;
	name: string;
	email: string;
	profile?: string | undefined;
}

export interface ValidateNews {
	title: string;
	content: string;
	image?: string;
	userId?: string;
}

export interface SendMail {
	from?: string;
	toMail: string;
	subject: string;
	body: string;
}
