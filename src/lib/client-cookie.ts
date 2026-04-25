"use client";

type CookieOptions = {
    maxAge?: number;
    sameSite?: "Strict" | "Lax";
};

export function readClientCookie(name: string) {
    if (typeof document === "undefined") return "";

    const target = `${encodeURIComponent(name)}=`;
    const item = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith(target));

    return item ? decodeURIComponent(item.slice(target.length)) : "";
}

export function writeClientCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
) {
    if (typeof document === "undefined") return;

    const maxAge = options.maxAge ?? 60 * 60 * 24 * 365;
    const sameSite = options.sameSite ?? "Strict";
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
        value
    )}; path=/; max-age=${maxAge}; SameSite=${sameSite}`;
}

export function deleteClientCookie(name: string) {
    if (typeof document === "undefined") return;
    document.cookie = `${encodeURIComponent(
        name
    )}=; path=/; max-age=0; SameSite=Strict`;
}
