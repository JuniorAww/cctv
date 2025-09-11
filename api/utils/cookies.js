const createCookies = () => {

}

const extractCookies = (request) => {
    const cookieHeader = request.headers.get("cookie");
    if(!cookieHeader) return {}
    return Object.fromEntries(
        cookieHeader.split("; ").map(c => {
            const index = c.indexOf("=");
            const key = c.slice(0, index);
            const value = c.slice(index + 1);
            return [key, value];
        })
    );
}

export { createCookies, extractCookies }
