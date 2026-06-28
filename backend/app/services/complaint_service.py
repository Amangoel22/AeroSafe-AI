from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from fastapi import HTTPException, status
from datetime import datetime
from app.models.incidents import Incident
from app.models.incident_status import IncidentStatus
from app.schemas.complaint import ComplaintCreateRequest, ComplaintUpdateRequest
from app.utils.logger import logger

async def get_complaints(
    db: AsyncSession, 
    skip: int = 0, 
    limit: int = 10,
    month: str = None,
    date: str = None,
    order_by: str = None
):
    try:
        logger.info(f"Fetching active complaints with skip={skip}, limit={limit}, month={month}, date={date}, order_by={order_by}")
        query = select(Incident, IncidentStatus).outerjoin(
            IncidentStatus, Incident.id == IncidentStatus.incident_id
        ).filter(Incident.is_active == True)
        
        # Filter by Month
        if month:
            # Check YYYY-MM
            if "-" in month and len(month) == 7:
                query = query.filter(func.date_format(Incident.created_at, '%Y-%m') == month)
            # Check Month Number (e.g. 06 or 6)
            elif month.isdigit():
                query = query.filter(func.month(Incident.created_at) == int(month))
            else:
                # Case-insensitive month name, e.g. "june" -> "June"
                query = query.filter(func.date_format(Incident.created_at, '%M') == month.capitalize())
                
        # Filter by Date (YYYY-MM-DD)
        if date:
            query = query.filter(func.date(Incident.created_at) == date)
            
        # Order by Logic
        if order_by == "month":
            query = query.order_by(func.date_format(Incident.created_at, '%Y-%m').asc(), Incident.created_at.asc())
        elif order_by == "date":
            query = query.order_by(Incident.created_at.asc())
        else:
            # Default fallback order by created_at descending
            query = query.order_by(Incident.created_at.desc())
            
        query = query.offset(skip).limit(limit)
        
        result = await db.execute(query)
        rows = result.all()
        
        complaints = []
        for incident, status_record in rows:
            complaints.append({
                "id": incident.id,
                "location": incident.location,
                "issue_type": incident.issue_type,
                "image_url": incident.image_url,
                "description": incident.description,
                "created_at": incident.created_at,
                "is_active": incident.is_active,
                "status": status_record
            })
        return complaints
    except Exception as e:
        logger.error(f"Error fetching complaints: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching complaints"
        )

async def get_complaint_by_id(db: AsyncSession, complaint_id: int):
    try:
        logger.info(f"Fetching complaint by ID: {complaint_id}")
        query = select(Incident, IncidentStatus).outerjoin(
            IncidentStatus, Incident.id == IncidentStatus.incident_id
        ).filter(Incident.id == complaint_id, Incident.is_active == True)
        
        result = await db.execute(query)
        row = result.first()
        if not row:
            logger.warning(f"Complaint not found or inactive for ID: {complaint_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )
        
        incident, status_record = row
        return {
            "id": incident.id,
            "location": incident.location,
            "issue_type": incident.issue_type,
            "image_url": incident.image_url,
            "description": incident.description,
            "created_at": incident.created_at,
            "is_active": incident.is_active,
            "status": status_record
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error fetching complaint {complaint_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching complaint details"
        )

async def create_complaint(db: AsyncSession, data: ComplaintCreateRequest):
    try:
        logger.info(f"Creating new complaint at location: {data.location}")
        
        now_time = datetime.now()
        
        # 1. Create Incident record
        new_incident = Incident(
            location=data.location,
            issue_type=data.issue_type,
            image_url=data.image_url,
            description=data.description,
            is_active=data.is_active if data.is_active is not None else True,
            created_at=now_time
        )
        db.add(new_incident)
        await db.flush()  # Extract the newly generated incident ID
        
        # 2. Create IncidentStatus record
        camera_location = data.camera_location or data.location
        severity = data.severity or "Low"
        status_val = data.status or "Pending"
        
        new_status = IncidentStatus(
            incident_id=new_incident.id,
            camera_location=camera_location,
            severity=severity,
            status=status_val,
            camera_no=data.camera_no,
            reported_at=now_time,  # Enforce current time on creation
            resolution_time=None,   # Set to None on initial creation
            assigned_to=data.assigned_to,
            created_at=now_time,    # Enforce current time on creation
            updated_at=now_time     # Enforce current time on creation
        )
        db.add(new_status)
        await db.commit()
        
        await db.refresh(new_incident)
        await db.refresh(new_status)
        
        logger.info(f"Complaint and Status successfully created. ID: {new_incident.id}")
        return {
            "id": new_incident.id,
            "location": new_incident.location,
            "issue_type": new_incident.issue_type,
            "image_url": new_incident.image_url,
            "description": new_incident.description,
            "created_at": new_incident.created_at,
            "is_active": new_incident.is_active,
            "status": new_status
        }
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating complaint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create complaint: {str(e)}"
        )

async def update_complaint(db: AsyncSession, complaint_id: int, data: ComplaintUpdateRequest):
    try:
        logger.info(f"Updating complaint with ID: {complaint_id}")
        
        # Fetch Incident
        inc_query = await db.execute(select(Incident).filter(Incident.id == complaint_id))
        incident = inc_query.scalars().first()
        if not incident:
            logger.warning(f"Update failed: Complaint not found for ID {complaint_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )
            
        if not incident.is_active:
            logger.warning(f"Update failed: Complaint {complaint_id} is inactive")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update an inactive complaint"
            )
        
        # Fetch Incident Status
        stat_query = await db.execute(select(IncidentStatus).filter(IncidentStatus.incident_id == complaint_id))
        status_record = stat_query.scalars().first()
        
        # Update Incident fields
        if data.location is not None:
            incident.location = data.location
        if data.issue_type is not None:
            incident.issue_type = data.issue_type
        if data.image_url is not None:
            incident.image_url = data.image_url
        if data.description is not None:
            incident.description = data.description
        if data.is_active is not None:
            incident.is_active = data.is_active
            
        # Update Incident Status fields
        if status_record:
            if data.camera_location is not None:
                status_record.camera_location = data.camera_location
            if data.severity is not None:
                status_record.severity = data.severity
            if data.status is not None:
                status_record.status = data.status
                # Auto-fill resolution time if marked resolved or completed
                if data.status in ["Resolved", "Completed"] and not status_record.resolution_time:
                    status_record.resolution_time = datetime.now()
            if data.camera_no is not None:
                status_record.camera_no = data.camera_no
            if data.reported_at is not None:
                status_record.reported_at = data.reported_at
            if data.resolution_time is not None:
                status_record.resolution_time = data.resolution_time
            if data.assigned_to is not None:
                status_record.assigned_to = data.assigned_to
            status_record.updated_at = datetime.now()
            
        await db.commit()
        await db.refresh(incident)
        if status_record:
            await db.refresh(status_record)
            
        logger.info(f"Complaint with ID {complaint_id} updated successfully")
        return {
            "id": incident.id,
            "location": incident.location,
            "issue_type": incident.issue_type,
            "image_url": incident.image_url,
            "description": incident.description,
            "created_at": incident.created_at,
            "is_active": incident.is_active,
            "status": status_record
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating complaint {complaint_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update complaint: {str(e)}"
        )

async def deactivate_complaint(db: AsyncSession, complaint_id: int):
    try:
        logger.info(f"Deactivating complaint with ID: {complaint_id}")
        query = await db.execute(select(Incident).filter(Incident.id == complaint_id))
        incident = query.scalars().first()
        if not incident:
            logger.warning(f"Deactivation failed: Complaint not found for ID {complaint_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Complaint not found"
            )
            
        if not incident.is_active:
            logger.warning(f"Deactivation warning: Complaint {complaint_id} is already inactive")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Complaint is already inactive"
            )
            
        incident.is_active = False
        await db.commit()
        logger.info(f"Complaint {complaint_id} deactivated successfully")
        return {"message": "Complaint deactivated successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deactivating complaint {complaint_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deactivate complaint: {str(e)}"
        )
