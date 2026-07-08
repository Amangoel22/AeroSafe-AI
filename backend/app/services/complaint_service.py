from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import extract, cast, Date
from fastapi import HTTPException, status
from datetime import datetime

from app.models.incidents import Incident
from app.schemas.complaint import (
    ComplaintCreateRequest,
    ComplaintUpdateRequest,
)
from app.utils.logger import logger

async def get_complaints(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 10,
    month: str = None,
    date: str = None,
    order_by: str = None,
):
    try:
        logger.info(
            f"Fetching complaints | skip={skip} limit={limit}"
        )

        query = select(Incident).where(
            Incident.is_active == True
        )

        # Filter by Month
        if month:
            if month.isdigit():
                query = query.where(
                    extract("month", Incident.created_at) == int(month)
                )

        # Filter by Date
        if date:
            target_date = datetime.strptime(
                date,
                "%Y-%m-%d"
            ).date()

            query = query.where(
    cast(Incident.created_at, Date) == target_date
)

        # Sorting
        if order_by == "date":
            query = query.order_by(
                Incident.created_at.asc()
            )
        else:
            query = query.order_by(
                Incident.created_at.desc()
            )

        query = query.offset(skip).limit(limit)

        result = await db.execute(query)

        complaints = result.scalars().all()

        return complaints

    except Exception as e:
        logger.error(f"Error fetching complaints : {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch complaints",
        )
    
async def get_complaint_by_id(
    db: AsyncSession,
    complaint_id: int,
):
    try:

        result = await db.execute(
            select(Incident).where(
                Incident.id == complaint_id,
                Incident.is_active == True,
            )
        )

        complaint = result.scalars().first()

        if complaint is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found",
            )

        return complaint

    except HTTPException:
        raise

    except Exception as e:

        logger.error(f"Error : {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch complaint",
        )
    
async def create_complaint(
    db: AsyncSession,
    data: ComplaintCreateRequest,
):
    try:

        logger.info(
            f"Creating complaint at {data.location}"
        )

        now = datetime.now()

        complaint = Incident(
            camera_id=data.camera_id,
            assigned_to=data.assigned_to,

            location=data.location,
            issue_type=data.issue_type,

            image_url=data.image_url,
            description=data.description,

            severity=data.severity,
            status=data.status,

            reported_at=data.reported_at or now,
            resolved_at=data.resolved_at,

            feedback=data.feedback,

            is_active=data.is_active,

            created_at=now,
            updated_at=now,
        )

        db.add(complaint)

        await db.commit()

        await db.refresh(complaint)

        logger.info(
            f"Complaint created successfully : {complaint.id}"
        )

        return complaint

    except Exception as e:

        await db.rollback()

        logger.error(f"Create complaint failed : {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create complaint",
        )
    
async def update_complaint(
    db: AsyncSession,
    complaint_id: int,
    data: ComplaintUpdateRequest,
):
    try:

        result = await db.execute(
            select(Incident).where(
                Incident.id == complaint_id,
                Incident.is_active == True,
            )
        )

        complaint = result.scalars().first()

        if complaint is None:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found",
            )

        if data.camera_id is not None:
            complaint.camera_id = data.camera_id

        if data.assigned_to is not None:
            complaint.assigned_to = data.assigned_to

        if data.location is not None:
            complaint.location = data.location

        if data.issue_type is not None:
            complaint.issue_type = data.issue_type

        if data.image_url is not None:
            complaint.image_url = data.image_url

        if data.description is not None:
            complaint.description = data.description

        if data.severity is not None:
            complaint.severity = data.severity

        if data.status is not None:
            complaint.status = data.status

            if (
                data.status == "Resolved"
                and complaint.resolved_at is None
            ):
                complaint.resolved_at = datetime.now()

        if data.reported_at is not None:
            complaint.reported_at = data.reported_at

        if data.resolved_at is not None:
            complaint.resolved_at = data.resolved_at

        if data.feedback is not None:
            complaint.feedback = data.feedback

        if data.is_active is not None:
            complaint.is_active = data.is_active

        complaint.updated_at = datetime.now()

        await db.commit()

        await db.refresh(complaint)

        logger.info(
            f"Complaint {complaint.id} updated"
        )

        return complaint

    except HTTPException:
        raise

    except Exception as e:

        await db.rollback()

        logger.error(f"Update failed : {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update complaint",
        )
    

async def delete_complaint(
    db: AsyncSession,
    complaint_id: int,
):
    try:

        result = await db.execute(
            select(Incident).where(
                Incident.id == complaint_id,
            )
        )

        complaint = result.scalars().first()

        if complaint is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found",
            )

        await db.delete(complaint)
        await db.commit()

        logger.info(
        f"Complaint {complaint.id} deleted"
        )

        return {
            "message": "Complaint deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:

        await db.rollback()

        logger.error(f"Deactivate failed : {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate complaint",
        )
    
