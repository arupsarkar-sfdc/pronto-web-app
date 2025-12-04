export class TokenService {
    static processTokenResponse(response) {
        if (!response || !response.token) {
            throw new Error("Invalid token response structure");
        }

        const { access_token, expires_in } = response.token;

        if (!access_token) {
            throw new Error("Access token missing from response");
        }

        const last8Digits = this.getLast8Digits(access_token);
        const expirationDate = this.calculateExpirationDate(expires_in);
        const formattedExpiration = this.formatExpiration(expirationDate);

        return {
            fullToken: response.token,
            accessToken: access_token,
            last8Digits,
            expirationDate,
            formattedExpiration
        };
    }

    static getLast8Digits(token) {
        if (!token || token.length < 8) return token;
        return token.slice(-8);
    }

    static calculateExpirationDate(expiresInSeconds) {
        if (!expiresInSeconds) return null;
        const now = new Date();
        return new Date(now.getTime() + expiresInSeconds * 1000);
    }

    static formatExpiration(date) {
        if (!date) return "Unknown";
        // Format: "HH:mm:ss" or similar relative time if preferred
        // Using a simple readable format for now
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}
