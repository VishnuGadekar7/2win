"""
Scheduled prediction jobs using APScheduler.
Runs periodic health risk calculations for all active users.
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from database import db


scheduler = AsyncIOScheduler()


@scheduler.scheduled_job("interval", minutes=60, id="hourly_fatigue_scan")
async def run_fatigue_prediction():
    """
    Hourly: run fatigue scoring for all users with recent readings.
    """
    try:
        # Get all users who have recent sensor data
        response = db.supabase.rpc("get_active_user_ids", {}).execute()
        user_ids = [r["user_id"] for r in (response.data or [])] if hasattr(response, "data") and response.data else []

        if not user_ids:
            # Fallback: query distinct user_ids from recent readings
            from datetime import datetime, timedelta
            cutoff = (datetime.utcnow() - timedelta(hours=2)).isoformat()
            resp = db.supabase.table("readings").select("user_id").gte("ts", cutoff).execute()
            user_ids = list(set(r.get("user_id") for r in (resp.data or []) if r.get("user_id")))

        from services.data_ingestion import run_prediction_pipeline

        for user_id in user_ids:
            readings = await db.get_recent_readings(user_id, hours=6)
            if len(readings) >= 5:
                await run_prediction_pipeline(user_id, readings)
                print(f"⏰ Hourly fatigue scan complete for user {user_id}")

    except Exception as e:
        print(f"❌ Hourly fatigue job error: {str(e)}")


@scheduler.scheduled_job("cron", hour=23, minute=0, id="daily_disease_prediction")
async def run_daily_disease_prediction():
    """
    Daily at 23:00: full-day disease risk prediction for all active users.
    """
    try:
        from datetime import datetime, timedelta
        cutoff = (datetime.utcnow() - timedelta(hours=24)).isoformat()
        resp = db.supabase.table("readings").select("user_id").gte("ts", cutoff).execute()
        user_ids = list(set(r.get("user_id") for r in (resp.data or []) if r.get("user_id")))

        from services.data_ingestion import run_prediction_pipeline

        for user_id in user_ids:
            readings = await db.get_recent_readings(user_id, hours=24)
            if len(readings) >= 5:
                await run_prediction_pipeline(user_id, readings)
                print(f"🌙 Daily disease prediction complete for user {user_id}")

    except Exception as e:
        print(f"❌ Daily prediction job error: {str(e)}")
