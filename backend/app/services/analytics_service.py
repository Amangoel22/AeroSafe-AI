from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.incidents import Incident
from app.utils.logger import logger


async def get_monthly_stats(db: AsyncSession):
    try:
        logger.info("Calculating monthly incident statistics")

        query = (
            select(
                func.to_char(
                    Incident.created_at,
                    "YYYY-MM"
                ).label("month"),
                func.count(Incident.id).label("count"),
            )
            .where(Incident.is_active == True)
            .group_by("month")
            .order_by("month")
        )

        result = await db.execute(query)

        rows = result.all()

        return [
            {
                "month": row.month,
                "count": row.count,
            }
            for row in rows
        ]

    except Exception as e:

        logger.error(f"Error fetching monthly stats: {e}")

        raise


async def get_resolution_trends(db: AsyncSession):
    try:

        logger.info("Calculating resolution trends")

        query = (
            select(
                Incident.issue_type,
                (
                    func.avg(
                        func.extract(
                            "epoch",
                            Incident.resolved_at
                            - Incident.reported_at,
                        )
                    )
                    / 3600
                ).label("avg_hours"),
            )
            .where(
                Incident.is_active == True,
                Incident.status == "Resolved",
                Incident.resolved_at.is_not(None),
            )
            .group_by(Incident.issue_type)
        )

        result = await db.execute(query)

        rows = result.all()

        return [
            {
                "issue_type": row.issue_type,
                "average_resolution_hours":
                    round(row.avg_hours, 2)
                    if row.avg_hours
                    else 0.0,
            }
            for row in rows
        ]

    except Exception as e:

        logger.error(
            f"Error fetching resolution trends: {e}"
        )

        raise