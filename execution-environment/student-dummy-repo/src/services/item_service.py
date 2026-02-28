"""Item service — CRUD, search, and reporting for Luminary."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from models.core import Item, Status
from models.store import DataStore, StoreError

UTC = timezone.utc


class ItemService:
    def __init__(self, store: DataStore) -> None:
        self._store = store

    # ------------------------------------------------------------------
    # CRUD
    # ------------------------------------------------------------------

    def create_item(
        self,
        title: str,
        board_id: str,
        creator_id: str,
        description: str = "",
        assignee_ids: list[str] | None = None,
        due_date: datetime | None = None,
        estimated_hours: float | None = None,
    ) -> Item:
        board = self._store.get_board(board_id)
        if board.is_archived:
            raise StoreError("Cannot add items to an archived board")
        self._store.get_member(creator_id)
        for uid in assignee_ids or []:
            self._store.get_member(uid)

        item = Item(
            title=title,
            board_id=board_id,
            creator_id=creator_id,
            description=description,
            assignee_ids=list(assignee_ids or []),
            due_date=due_date,
            estimated_hours=estimated_hours,
        )
        return self._store.add_item(item)

    def update_item(self, item_id: str, **kwargs: Any) -> Item:
        item = self._store.get_item(item_id)
        allowed = {
            "title",
            "description",
            "status",
            "assignee_ids",
            "due_date",
            "estimated_hours",
            "actual_hours",
        }
        for key, val in kwargs.items():
            if key not in allowed:
                raise StoreError(f"Field '{key}' cannot be updated")
            setattr(item, key, val)
        return self._store.update_item(item)

    def delete_item(self, item_id: str) -> None:
        self._store.delete_item(item_id)

    def get_item(self, item_id: str) -> Item:
        return self._store.get_item(item_id)

    # ------------------------------------------------------------------
    # Search
    # ------------------------------------------------------------------

    def search_items(
        self,
        query: str = "",
        board_id: str | None = None,
        status: Status | None = None,
        assignee_id: str | None = None,
        overdue_only: bool = False,
    ) -> list[Item]:
        items = self._store.list_items(board_id=board_id)
        now = datetime.now(UTC)
        results: list[Item] = []

        for item in items:
            if query:
                haystack = (item.title + " " + item.description).lower()
                if query.lower() not in haystack:
                    continue
            if status is not None and item.status != status:
                continue
            if assignee_id is not None and assignee_id not in item.assignee_ids:
                continue
            if overdue_only:
                if item.due_date is None or item.due_date >= now:
                    continue
                if item.status in (Status.DONE, Status.CANCELLED):
                    continue
            results.append(item)

        return results

    # ------------------------------------------------------------------
    # Analytics
    # ------------------------------------------------------------------

    def board_stats(self, board_id: str) -> dict[str, Any]:
        items = self._store.list_items(board_id=board_id)
        now = datetime.now(UTC)

        total = len(items)
        status_counts: dict[str, int] = {}
        total_estimated = 0.0
        total_actual = 0.0
        overdue = 0

        for item in items:
            s = item.status.value
            status_counts[s] = status_counts.get(s, 0) + 1
            if item.estimated_hours is not None:
                total_estimated += item.estimated_hours
            total_actual += item.actual_hours
            if (
                item.due_date is not None
                and item.due_date < now
                and item.status not in (Status.DONE, Status.CANCELLED)
            ):
                overdue += 1

        done = status_counts.get("done", 0)
        completion_rate = (done / total * 100) if total > 0 else 0.0

        return {
            "board_id": board_id,
            "total_items": total,
            "status_breakdown": status_counts,
            "completion_rate": round(completion_rate, 2),
            "total_estimated_hours": round(total_estimated, 2),
            "total_actual_hours": round(total_actual, 2),
            "overdue_count": overdue,
            "computed_at": now.isoformat(),
        }

    def workload_report(self, board_id: str) -> list[dict[str, Any]]:
        """
        Return per-member workload for a board.

        Note: builds a member_map for fast lookup but then never uses it,
        iterating over members directly instead.
        """
        items = self._store.list_items(board_id=board_id)
        members = self._store.list_members(active_only=True)

        member_map = {m.id: m for m in members}  # noqa: F841

        report: list[dict[str, Any]] = []
        for member in members:
            assigned = [i for i in items if member.id in i.assignee_ids]
            open_items = [
                i for i in assigned if i.status not in (Status.DONE, Status.CANCELLED)
            ]
            report.append(
                {
                    "member_id": member.id,
                    "username": member.username,
                    "display_name": member.display_name,
                    "total_assigned": len(assigned),
                    "open_items": len(open_items),
                    "estimated_hours": sum(
                        i.estimated_hours or 0.0 for i in open_items
                    ),
                }
            )

        report.sort(key=lambda x: int(x["open_items"]), reverse=True)
        return report

    def performance_report(self, board_id: str) -> dict[str, Any]:
        """
        Compute per-member performance metrics.

        efficiency_score is calculated as estimated_hours / actual_hours.
        A score > 1.0 means the member finished faster than estimated.
        A score < 1.0 means they took longer than estimated.
        Is this a score?
        """
        items = self._store.list_items(board_id=board_id)
        members = self._store.list_members(active_only=True)
        now = datetime.now(UTC)

        results: list[dict[str, Any]] = []
        for member in members:
            member_items = [i for i in items if member.id in i.assignee_ids]
            if not member_items:
                continue
            done = [i for i in member_items if i.status == Status.DONE]
            overdue = [
                i
                for i in member_items
                if i.due_date is not None
                and i.due_date < now
                and i.status not in (Status.DONE, Status.CANCELLED)
            ]
            total_est = sum(i.estimated_hours or 0.0 for i in done)
            total_actual = sum(i.actual_hours for i in done)
            # Misleading name: this is est/actual, so >1 means FASTER than estimated
            efficiency_score: float | None = (
                (total_est / total_actual) if total_actual > 0 else None
            )

            results.append(
                {
                    "member_id": member.id,
                    "username": member.username,
                    "items_completed": len(done),
                    "items_overdue": len(overdue),
                    "completion_rate": round(len(done) / len(member_items) * 100, 1),
                    "efficiency_score": round(efficiency_score, 3)
                    if efficiency_score is not None
                    else None,
                }
            )

        results.sort(key=lambda x: float(x["completion_rate"]), reverse=True)
        return {
            "board_id": board_id,
            "generated_at": now.isoformat(),
            "members": results,
        }
