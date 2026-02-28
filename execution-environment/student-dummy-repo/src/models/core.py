"""Core data models for Luminary task tracker."""

from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any

UTC = timezone.utc


class Status(Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    CANCELLED = "cancelled"


class Role(Enum):
    VIEWER = "viewer"
    MEMBER = "member"
    LEAD = "lead"
    ADMIN = "admin"


def _new_id() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(UTC)


@dataclass
class Member:
    username: str
    email: str
    display_name: str
    role: Role = Role.MEMBER
    id: str = field(default_factory=_new_id)
    created_at: datetime = field(default_factory=_now)
    is_active: bool = True

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "display_name": self.display_name,
            "role": self.role.value,
            "created_at": self.created_at.isoformat(),
            "is_active": self.is_active,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Member:
        m = cls(
            username=str(data["username"]),
            email=str(data["email"]),
            display_name=str(data["display_name"]),
            role=Role(data.get("role", "member")),
        )
        m.id = str(data.get("id", m.id))
        m.is_active = bool(data.get("is_active", True))
        if "created_at" in data:
            m.created_at = datetime.fromisoformat(str(data["created_at"]))
        return m


@dataclass
class Item:
    title: str
    board_id: str
    creator_id: str
    description: str = ""
    status: Status = Status.OPEN
    assignee_ids: list[str] = field(default_factory=list)
    id: str = field(default_factory=_new_id)
    created_at: datetime = field(default_factory=_now)
    updated_at: datetime = field(default_factory=_now)
    due_date: datetime | None = None
    estimated_hours: float | None = None
    actual_hours: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "board_id": self.board_id,
            "creator_id": self.creator_id,
            "status": self.status.value,
            "assignee_ids": self.assignee_ids,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "estimated_hours": self.estimated_hours,
            "actual_hours": self.actual_hours,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Item:
        item = cls(
            title=str(data["title"]),
            board_id=str(data["board_id"]),
            creator_id=str(data["creator_id"]),
            description=str(data.get("description", "")),
            status=Status(data.get("status", "open")),
        )
        item.id = str(data.get("id", item.id))
        item.assignee_ids = list(data.get("assignee_ids", []))
        item.estimated_hours = (
            float(data["estimated_hours"])
            if data.get("estimated_hours") is not None
            else None
        )
        item.actual_hours = float(data.get("actual_hours", 0.0))
        if data.get("due_date"):
            item.due_date = datetime.fromisoformat(str(data["due_date"]))
        if data.get("created_at"):
            item.created_at = datetime.fromisoformat(str(data["created_at"]))
        if data.get("updated_at"):
            item.updated_at = datetime.fromisoformat(str(data["updated_at"]))
        return item


@dataclass
class Board:
    name: str
    owner_id: str
    description: str = ""
    id: str = field(default_factory=_new_id)
    created_at: datetime = field(default_factory=_now)
    updated_at: datetime = field(default_factory=_now)
    is_archived: bool = False
    member_ids: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "is_archived": self.is_archived,
            "member_ids": self.member_ids,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Board:
        b = cls(
            name=str(data["name"]),
            owner_id=str(data["owner_id"]),
            description=str(data.get("description", "")),
        )
        b.id = str(data.get("id", b.id))
        b.is_archived = bool(data.get("is_archived", False))
        b.member_ids = list(data.get("member_ids", []))
        if data.get("created_at"):
            b.created_at = datetime.fromisoformat(str(data["created_at"]))
        if data.get("updated_at"):
            b.updated_at = datetime.fromisoformat(str(data["updated_at"]))
        return b
