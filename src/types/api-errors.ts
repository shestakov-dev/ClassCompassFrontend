export interface StandardApiError {
	message: string;
	error: string;
	statusCode: number;
}

export interface OryApiError {
	error: {
		code: number;
		status: string;
		message: string;
	};
}
