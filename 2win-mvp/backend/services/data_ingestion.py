"""
Data Ingestion & Feature Engineering Service
Processes IoT sensor readings and generates health risk predictions.
Uses exact weight formulas from the 2WIN.AI specification.
"""

from typing import Dict, List, Any
from datetime import datetime
from database import db


# ─── NORMALIZATION FUNCTIONS ──────────────────────────────────────────────

def normalize_hrv(hrv: float) -> float:
    if hrv < 30:
        return 1.0
    if hrv > 60:
        return 0.0
    return (60 - hrv) / 30.0


def normalize_rhr(rhr: float) -> float:
    if rhr < 60:
        return 0.0
    if rhr > 100:
        return 1.0
    return (rhr - 60) / 40.0


def normalize_spo2(spo2: float) -> float:
    if spo2 > 98:
        return 0.0
    if spo2 < 90:
        return 1.0
    return (98 - spo2) / 8.0


def normalize_sleep(hours: float) -> float:
    if hours >= 8:
        return 0.0
    if hours <= 4:
        return 1.0
    return (8 - hours) / 4.0


def normalize_activity(steps: float) -> float:
    if steps >= 10000:
        return 0.0
    if steps <= 2000:
        return 1.0
    return (10000 - steps) / 8000.0


# ─── RISK SCORE COMPUTATION ──────────────────────────────────────────────

def compute_risk_scores(features: Dict[str, float]) -> Dict[str, float]:
    """
    Compute all risk scores using the exact specified weights.
    Each score ranges from 0 to 100.
    """
    h = normalize_hrv(features.get("hrv_avg", 45))
    r = normalize_rhr(features.get("rhr", 70))
    s = features.get("stress_score", 0.5)
    a = normalize_activity(features.get("steps", 5000))
    sl = normalize_sleep(features.get("sleep_hours", 7))
    o = normalize_spo2(features.get("spo2_avg", 97))

    cvd      = (0.25 * h + 0.25 * r + 0.20 * s + 0.15 * a + 0.15 * sl) * 100
    apnea    = (0.40 * o + 0.20 * sl + 0.20 * r + 0.20 * s) * 100
    htn      = (0.35 * r + 0.35 * h + 0.20 * s + 0.10 * sl) * 100
    diabetes = (0.40 * a + 0.30 * sl + 0.30 * s) * 100
    fatigue  = (0.35 * h + 0.35 * sl + 0.30 * s) * 100
    vitality = 100 - ((cvd + apnea + htn + diabetes + fatigue) / 5)

    return {
        "cvd": round(cvd, 1),
        "sleep_apnea": round(apnea, 1),
        "hypertension": round(htn, 1),
        "diabetes": round(diabetes, 1),
        "fatigue": round(fatigue, 1),
        "vitality_index": round(vitality, 1),
    }


# ─── EXPLANATION BUILDER ─────────────────────────────────────────────────

FACTOR_LABELS = {
    "hrv": "Low heart rate variability",
    "rhr": "Elevated resting heart rate",
    "stress": "Elevated stress levels",
    "sleep": "Insufficient sleep",
    "activity": "Low physical activity",
    "spo2": "Reduced oxygen saturation",
}

RECOMMENDATIONS = {
    "sleep": "Aim for 7–8 hours of sleep per night",
    "activity": "Increase daily steps above 7,000",
    "stress": "Practice stress reduction — breathing exercises or meditation",
    "hrv": "Improve HRV with consistent sleep schedule and moderate exercise",
    "rhr": "Cardiovascular exercise 3–4x per week can reduce resting heart rate",
    "spo2": "Consult a doctor if SpO₂ consistently below 95%",
}


def build_explanation(features: Dict[str, float], scores: Dict[str, float], prediction_type: str) -> Dict[str, Any]:
    """Build human-readable explanation with top contributing factors."""
    norm_map = {
        "hrv": normalize_hrv(features.get("hrv_avg", 45)),
        "rhr": normalize_rhr(features.get("rhr", 70)),
        "stress": features.get("stress_score", 0.5),
        "sleep": normalize_sleep(features.get("sleep_hours", 7)),
        "activity": normalize_activity(features.get("steps", 5000)),
        "spo2": normalize_spo2(features.get("spo2_avg", 97)),
    }

    factors = sorted(norm_map.items(), key=lambda x: x[1], reverse=True)[:3]
    main_factors = [{"name": FACTOR_LABELS[k], "contribution": round(v, 2)} for k, v in factors]
    recommendations = [RECOMMENDATIONS[k] for k, v in factors if v > 0.5]

    risk_value = scores.get(prediction_type, 50)
    risk_level = "HIGH" if risk_value > 66 else "MODERATE" if risk_value > 33 else "LOW"

    return {
        "main_factors": main_factors,
        "recommendations": recommendations,
        "risk_level": risk_level,
    }


# ─── FEATURE EXTRACTION FROM READINGS ────────────────────────────────────

def extract_features_from_readings(readings: List[Dict[str, Any]], user_data: Dict[str, Any] = None) -> Dict[str, float]:
    """
    Extract feature vector from raw sensor readings.
    Groups readings by metric and computes averages.
    """
    features: Dict[str, float] = {}

    # Group readings by metric
    by_metric: Dict[str, List[float]] = {}
    for r in readings:
        metric = r.get("metric", "")
        value = r.get("value")
        if value is not None:
            by_metric.setdefault(metric, []).append(float(value))

    # Compute averages
    if "heart_rate" in by_metric:
        hr_values = by_metric["heart_rate"]
        features["rhr"] = sum(hr_values) / len(hr_values)
        # Simple HRV approximation: std dev of heart rate
        if len(hr_values) > 1:
            mean_hr = features["rhr"]
            variance = sum((x - mean_hr) ** 2 for x in hr_values) / len(hr_values)
            features["hrv_avg"] = variance ** 0.5 * 2  # rough RMSSD-like estimate
        else:
            features["hrv_avg"] = 45  # default

    if "spo2" in by_metric:
        vals = by_metric["spo2"]
        features["spo2_avg"] = sum(vals) / len(vals)

    if "steps_per_minute" in by_metric:
        vals = by_metric["steps_per_minute"]
        # Extrapolate steps/minute to daily steps (assuming 16 active hours)
        avg_spm = sum(vals) / len(vals)
        features["steps"] = avg_spm * 60 * 16
    elif "steps" in by_metric:
        vals = by_metric["steps"]
        features["steps"] = sum(vals) / len(vals)
    else:
        features["steps"] = 5000  # default

    if "sleep_hours" in by_metric:
        vals = by_metric["sleep_hours"]
        features["sleep_hours"] = sum(vals) / len(vals)
    else:
        features["sleep_hours"] = 7  # default

    # Stress score: derived from HRV and RHR
    hrv_norm = normalize_hrv(features.get("hrv_avg", 45))
    rhr_norm = normalize_rhr(features.get("rhr", 70))
    features["stress_score"] = round((hrv_norm * 0.6 + rhr_norm * 0.4), 3)

    return features


# ─── FULL PREDICTION PIPELINE ────────────────────────────────────────────

async def run_prediction_pipeline(user_id: str, readings: List[Dict[str, Any]]):
    """
    Full pipeline: extract features → compute risks → build explanations → save.
    """
    if not readings:
        return

    # Get user profile for context
    user_data = await db.get_user(user_id)
    features = extract_features_from_readings(readings, user_data)
    scores = compute_risk_scores(features)

    # Save each prediction
    for pred_type, score in scores.items():
        explanation = build_explanation(features, scores, pred_type)
        confidence = 0.7 if len(readings) >= 10 else 0.5
        await db.insert_prediction(
            user_id=user_id,
            prediction_type=pred_type,
            value=score,
            model_version="rule-v1",
            confidence=confidence,
            explanation=explanation,
        )

    # Update body parts status based on scores
    body_map = {
        "head": {"risk_types": ["sleep_apnea", "fatigue"]},
        "chest": {"risk_types": ["cvd", "hypertension"]},
        "abdomen": {"risk_types": ["diabetes"]},
    }

    for body_part, config in body_map.items():
        relevant_scores = [scores.get(rt, 0) for rt in config["risk_types"]]
        max_score = max(relevant_scores) if relevant_scores else 0

        if max_score > 66:
            status = "critical"
        elif max_score > 33:
            status = "warning"
        else:
            status = "healthy"

        description = ", ".join(
            f"{rt.replace('_', ' ').title()}: {scores.get(rt, 0):.1f}%"
            for rt in config["risk_types"]
        )

        await db.upsert_body_part_status({
            "user_id": user_id,
            "body_part": body_part,
            "status": status,
            "description": description,
        })
