// libs/api-client.ts
// Wrapper around fetch for standardized API calls with error handling

import { ERROR_MESSAGES } from "@/libs/constants/messages";

export class ApiError extends Error {
    status: number;
    code: string;

    constructor(message: string, status: number, code: string = "UNKNOWN") {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

interface ApiResponse<T> {
    data?: T;
    error?: string;
    code?: string;
}

/**
 * Standardized API client for internal API calls
 */
export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        // Send client timezone for rate limiting
        "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...options.headers,
    };

    try {
        const response = await fetch(endpoint, {
            ...options,
            headers,
        });

        const json: ApiResponse<T> = await response.json();

        if (!response.ok) {
            // Handle specific error codes
            if (response.status === 429) {
                throw new ApiError(
                    ERROR_MESSAGES.GLOBAL.DAILY_LIMIT,
                    429,
                    "RATE_LIMIT"
                );
            }

            if (response.status === 401) {
                throw new ApiError(
                    ERROR_MESSAGES.GLOBAL.SESSION_ENDED,
                    401,
                    "UNAUTHORIZED"
                );
            }

            throw new ApiError(
                json.error || "An unexpected error occurred",
                response.status,
                json.code
            );
        }

        return json.data as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Network error
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            throw new ApiError(
                ERROR_MESSAGES.GLOBAL.NETWORK_ERROR,
                0,
                "NETWORK_ERROR"
            );
        }

        throw new ApiError(
            ERROR_MESSAGES.GLOBAL.NETWORK_ERROR,
            0,
            "UNKNOWN"
        );
    }
}
