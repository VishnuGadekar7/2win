import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  timestamp?: string;
}

export interface Prediction {
  disease?: string;
  prediction_type?: string;
  risk?: number;
  value?: number;
  level?: string;
  factors?: string[];
  recommendations?: string[];
  confidence?: number;
  explanation?: any;
}

export interface BodyPart {
  id?: string;
  body_part: string;
  status: "healthy" | "warning" | "critical";
  temperature?: number;
  pain_level?: number;
  description?: string;
}

export interface MedicalAlert {
  id: string;
  type: "warning" | "info" | "success" | "critical";
  message: string;
  timestamp: string;
  user_id: string;
  read?: boolean;
}

export function useMetrics() {
  const { token } = useAuth();
  return useQuery<HealthMetric[]>({
    queryKey: ["metrics"],
    queryFn: () => apiFetch("/api/health/metrics", token),
    enabled: !!token,
    refetchInterval: 30000,
    retry: 1,
  });
}

export function usePredictions() {
  const { token } = useAuth();
  return useQuery<Prediction[]>({
    queryKey: ["predictions"],
    queryFn: () => apiFetch("/api/health/predictions", token),
    enabled: !!token,
    refetchInterval: 60000,
    retry: 1,
  });
}

export function useBodyScan() {
  const { token } = useAuth();
  return useQuery<BodyPart[]>({
    queryKey: ["bodyscan"],
    queryFn: () => apiFetch("/api/health/body-scan", token),
    enabled: !!token,
    retry: 1,
  });
}

export function useAlerts() {
  const { token } = useAuth();
  return useQuery<MedicalAlert[]>({
    queryKey: ["alerts"],
    queryFn: () => apiFetch("/api/health/alerts", token),
    enabled: !!token,
    refetchInterval: 30000,
    retry: 1,
  });
}
