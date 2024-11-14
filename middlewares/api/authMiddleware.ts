// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validate = (token: any) => {
    const validateToken = true;

    if (!validateToken || !token) {
        // throw new Error("Unauthorized");
        return false;
    } else {
        return true;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function authMiddleware(req: Request): any {
    const token = req.headers.get("Authorization")?.split(" ")[1];

    return { isValid: validate(token) };
}