"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { GenerationStatus, StatusUpdatePayload } from "@/types";
import { getApiBaseUrl } from "@/lib/api";

interface UseAssignmentSocketOptions {
  assignmentId: string | null;
  enabled?: boolean;
  onStatusChange: (status: GenerationStatus, error?: string) => void;
}

export function useAssignmentSocket({
  assignmentId,
  enabled = true,
  onStatusChange,
}: UseAssignmentSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || !assignmentId) {
      disconnect();
      return;
    }

    const socket = io(getApiBaseUrl(), {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    const joinRoom = () => {
      socket.emit("assignment:join", assignmentId);
    };

    socket.on("connect", joinRoom);
    socket.on("reconnect", joinRoom);

    socket.on("assignment:status", (payload: StatusUpdatePayload) => {
      if (payload.assignmentId === assignmentId) {
        onStatusChangeRef.current(payload.status, payload.error);
      }
    });

    if (socket.connected) {
      joinRoom();
    }

    return () => {
      socket.emit("assignment:leave", assignmentId);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [assignmentId, enabled, disconnect]);

  return { disconnect };
}
