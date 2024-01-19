export const normalizePathname = (pathname) =>
    pathname.replace(/\/+S/, "").replace(/^\/*/, "/");
