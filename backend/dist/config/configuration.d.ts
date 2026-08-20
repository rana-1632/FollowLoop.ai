declare const _default: () => {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    jwt: {
        secret: string;
        expiresIn: string;
    };
    groq: {
        apiKey: string;
    };
    ai: {
        apiKey: string;
        model: string;
        baseUrl: string;
    };
    resend: {
        apiKey: string;
        fromEmail: string;
    };
    sentry: {
        dsn: string;
    };
    frontendUrl: string;
};
export default _default;
