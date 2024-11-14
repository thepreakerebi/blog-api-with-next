export function logMiddleware(req: Request) {
    return { req: req.method + " " + req.url }
}