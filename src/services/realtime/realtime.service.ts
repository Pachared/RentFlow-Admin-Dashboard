"use client";

import { getPartnerApiBaseUrl } from "@/src/services/core/api-client.service";
import type { PartnerRealtimeEvent } from "./realtime.types";

type SubscribeOptions = {
  onEvent: (event: PartnerRealtimeEvent) => void;
  onError?: () => void;
};

function partnerRealtimeUrl() {
  const url = new URL(getPartnerApiBaseUrl());
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws/realtime";
  url.search = "";
  url.searchParams.set("app", "partner");
  return url.toString();
}

export function subscribePartnerRealtime(options: SubscribeOptions) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  let socket: WebSocket | null = null;
  let closed = false;
  let reconnectTimer: number | undefined;
  let attempts = 0;

  const connect = () => {
    if (closed) return;
    socket = new WebSocket(partnerRealtimeUrl());
    socket.onmessage = (message) => {
      try {
        options.onEvent(JSON.parse(message.data) as PartnerRealtimeEvent);
      } catch {
        // Keep realtime connection alive if a malformed message arrives.
      }
    };
    socket.onopen = () => {
      attempts = 0;
    };
    socket.onerror = () => {
      options.onError?.();
    };
    socket.onclose = () => {
      if (closed) return;
      attempts += 1;
      reconnectTimer = window.setTimeout(
        connect,
        Math.min(1000 + attempts * 700, 5000)
      );
    };
  };

  connect();

  return () => {
    closed = true;
    if (reconnectTimer) window.clearTimeout(reconnectTimer);
    socket?.close();
  };
}

