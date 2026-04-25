"use client";

import * as React from "react";
import { subscribePartnerRealtime } from "@/src/services/realtime/realtime.service";
import type {
  PartnerRealtimeEvent,
  PartnerRealtimeEventType,
} from "@/src/services/realtime/realtime.types";

type Options = {
  events: PartnerRealtimeEventType[];
  onRefresh: (event: PartnerRealtimeEvent) => void;
  enabled?: boolean;
};

export function usePartnerRealtimeRefresh({
  events,
  onRefresh,
  enabled = true,
}: Options) {
  const eventKey = events.join("|");

  React.useEffect(() => {
    if (!enabled) return;
    const allowedEvents = new Set(eventKey.split("|").filter(Boolean));
    return subscribePartnerRealtime({
      onEvent(event) {
        if (allowedEvents.has(event.type as PartnerRealtimeEventType)) {
          onRefresh(event);
        }
      },
    });
  }, [enabled, eventKey, onRefresh]);
}

