"""Database seed helpers."""

from loguru import logger
from sqlalchemy import select

from app.auth.passwords import hash_password, verify_password
from app.core.config import Settings, get_settings
from app.db.models import User
from app.db.session import SessionLocal
from app.services.auth_service import is_insecure_password


async def seed_default_admin(settings: Settings | None = None) -> None:
    """Ensure a default admin account exists for initial login."""
    config = settings or get_settings()
    if not config.seed_default_admin:
        return

    email = config.default_admin_email.lower().strip()
    if not email or not config.default_admin_password:
        logger.warning(
            "Default admin seed skipped | set DEFAULT_ADMIN_EMAIL (username) and DEFAULT_ADMIN_PASSWORD in backend/.env"
        )
        return

    insecure = is_insecure_password(config.default_admin_password)

    async with SessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        existing = result.scalar_one_or_none()
        if existing:
            # Existing installs that still use the insecure seed password must rotate.
            if insecure and verify_password(config.default_admin_password, existing.password_hash):
                if not existing.must_change_password:
                    existing.must_change_password = True
                    await session.commit()
                    logger.warning(
                        "Default admin still uses an insecure password | email={} must_change_password=true",
                        email,
                    )
            else:
                logger.info("Default admin account already exists | email={}", email)
            return

        session.add(
            User(
                email=email,
                password_hash=hash_password(config.default_admin_password),
                must_change_password=insecure,
            )
        )
        await session.commit()
        if insecure:
            logger.warning(
                "Default admin created with insecure password | email={} must_change_password=true",
                email,
            )
        else:
            logger.info("Default admin account created | email={}", email)
