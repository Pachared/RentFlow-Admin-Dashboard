import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE = "rentflow_partner_session";
const STORE_COOKIE = "rf_store_domain";
const STORE_SETUP_PATH = "/admin/store-setup";

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (!pathname.startsWith("/admin")) return NextResponse.next();

    const token = req.cookies.get(TOKEN_COOKIE)?.value;

    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    const storeDomain = req.cookies.get(STORE_COOKIE)?.value;
    if (!storeDomain && !pathname.startsWith(STORE_SETUP_PATH)) {
        const url = req.nextUrl.clone();
        url.pathname = STORE_SETUP_PATH;
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
