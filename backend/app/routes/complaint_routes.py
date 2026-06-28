import os
import uuid
import shutil
from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.config.config import get_db
from app.schemas.complaint import ComplaintResponse, ComplaintCreateRequest, ComplaintUpdateRequest
from app.services.complaint_service import (
    get_complaints,
    get_complaint_by_id,
    create_complaint,
    update_complaint,
    deactivate_complaint
)
from app.services.auth_service import get_current_user
from app.models.users import User
from app.utils.logger import logger
from app.utils.security import verify_presigned_url

router = APIRouter(prefix="/api/complaints", tags=["Complaints / Incidents"])

async def save_uploaded_file(image: Optional[UploadFile]) -> Optional[str]:
    """
    Saves an uploaded image to the local uploads directory with a unique UUID filename.
    Returns the relative path to be stored in the database.
    """
    if not image or not image.filename:
        return None
    
    os.makedirs("uploads", exist_ok=True)
    ext = os.path.splitext(image.filename)[1]
    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join("uploads", unique_name)
    
    # Save file locally on server
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)
        
    return f"uploads/{unique_name}"

@router.get("", response_model=List[ComplaintResponse], status_code=status.HTTP_200_OK)
async def read_complaints(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(10, ge=1, le=100, description="Max number of items to return"),
    month: str = Query(None, description="Filter by month (e.g. '2026-06' or '6' or 'June')"),
    date: str = Query(None, description="Filter by date (e.g. '2026-06-28')"),
    order_by: str = Query(None, description="Sort results by 'month' or 'date'"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        complaints = await get_complaints(db, skip=skip, limit=limit, month=month, date=date, order_by=order_by)
        return complaints
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in read_complaints route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error fetching complaints list"
        )

@router.get("/image", response_class=FileResponse, status_code=status.HTTP_200_OK)
async def serve_signed_image(
    file: str,
    expires: int,
    signature: str
):
    # Decode URL-encoded paths if sent by swagger/browser
    from urllib.parse import unquote
    file = unquote(file)

    # 1. Verify the signature and expiry
    if not verify_presigned_url(file, expires, signature):
        logger.warning(f"Failed to verify signature for file: {file}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Signature is invalid or link has expired"
        )
    
    # 2. Prevent directory traversal attacks
    base_dir = os.path.abspath("uploads")
    target_path = os.path.abspath(file)
    if not target_path.startswith(base_dir):
        logger.warning(f"Directory traversal attempt blocked: {file}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to file location"
        )
        
    if not os.path.exists(target_path):
        logger.warning(f"File not found: {target_path}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image file not found"
        )
        
    return FileResponse(target_path, filename=os.path.basename(target_path))

@router.get("/{id}", response_model=ComplaintResponse, status_code=status.HTTP_200_OK)
async def read_complaint_by_id(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        complaint = await get_complaint_by_id(db, id)
        return complaint
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in read_complaint_by_id route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error fetching complaint details"
        )

@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def add_complaint(
    location: str = Form(...),
    issue_type: str = Form(...),
    description: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(True),
    camera_location: Optional[str] = Form(None),
    severity: Optional[Literal['Low', 'Medium', 'High', 'Critical']] = Form('Low'),
    status_val: Optional[Literal['Pending', 'In Progress', 'Resolved']] = Form('Pending'),
    camera_no: Optional[str] = Form(None),
    assigned_to: Optional[int] = Form(None),
    image: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        image_url = await save_uploaded_file(image)
        if image_url:
            logger.info(f"Image uploaded and saved to {image_url}")

        data = ComplaintCreateRequest(
            location=location,
            issue_type=issue_type,
            image_url=image_url,
            description=description,
            is_active=is_active,
            camera_location=camera_location,
            severity=severity,
            status=status_val,
            camera_no=camera_no,
            assigned_to=assigned_to
        )

        complaint = await create_complaint(db, data)
        return complaint
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in add_complaint route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error adding complaint: {str(e)}"
        )

@router.put("/{id}", response_model=ComplaintResponse, status_code=status.HTTP_200_OK)
async def edit_complaint(
    id: int,
    location: Optional[str] = Form(None),
    issue_type: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    camera_location: Optional[str] = Form(None),
    severity: Optional[Literal['Low', 'Medium', 'High', 'Critical']] = Form(None),
    status_val: Optional[Literal['Pending', 'In Progress', 'Resolved']] = Form(None),
    camera_no: Optional[str] = Form(None),
    assigned_to: Optional[int] = Form(None),
    image: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        image_url = await save_uploaded_file(image)
        if image_url:
            logger.info(f"Updated Image uploaded and saved to {image_url}")

        data = ComplaintUpdateRequest(
            location=location,
            issue_type=issue_type,
            image_url=image_url,
            description=description,
            is_active=is_active,
            camera_location=camera_location,
            severity=severity,
            status=status_val,
            camera_no=camera_no,
            assigned_to=assigned_to
        )

        complaint = await update_complaint(db, id, data)
        return complaint
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in edit_complaint route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error updating complaint: {str(e)}"
        )

@router.delete("/{id}", response_model=dict, status_code=status.HTTP_200_OK)
async def remove_complaint(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = await deactivate_complaint(db, id)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in remove_complaint route: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error deactivating complaint"
        )


