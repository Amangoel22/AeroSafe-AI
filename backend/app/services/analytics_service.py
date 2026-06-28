from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, text
from app.models.incidents import Incident
from app.models.incident_status import IncidentStatus
from app.utils.logger import logger

async def get_monthly_stats(db: AsyncSession):
    try:
        logger.info("Calculating monthly complaints statistics")
        # Groups active complaints by month (YYYY-MM format)
        query = (
            select(
                func.date_format(Incident.created_at, '%Y-%m').label('month'),
                func.count(Incident.id).label('count')
            )
            .filter(Incident.is_active == True)
            .group_by('month')
            .order_by('month')
        )
        result = await db.execute(query)
        rows = result.all()
        return [{"month": row.month, "count": row.count} for row in rows]
    except Exception as e:
        logger.error(f"Error fetching monthly stats: {str(e)}")
        raise e

async def get_resolution_trends(db: AsyncSession):
    try:
        logger.info("Calculating resolution time trends by issue type")
        # Calculates average difference in seconds between incident creation and status resolution, converted to hours.
        query = (
            select(
                Incident.issue_type,
                func.avg(
                    func.timestampdiff(
                        text('SECOND'), 
                        Incident.created_at, 
                        IncidentStatus.resolution_time
                    )
                ) / 3600.0
            )
            .join(IncidentStatus, Incident.id == IncidentStatus.incident_id)
            .filter(
                Incident.is_active == True,
                IncidentStatus.status == 'Resolved',
                IncidentStatus.resolution_time.isnot(None)
            )
            .group_by(Incident.issue_type)
        )
        result = await db.execute(query)
        rows = result.all()
        
        return [
            {
                "issue_type": row[0],
                "average_resolution_hours": round(row[1], 2) if row[1] is not None else 0.0
            }
            for row in rows
        ]
    except Exception as e:
        logger.error(f"Error fetching resolution trends: {str(e)}")
        raise e
