"""Luminary API — top-level facade."""

from __future__ import annotations

from typing import Any

from models.core import Status
from models.store import DataStore
from services.board_service import BoardService, MemberService
from services.item_service import ItemService


class LuminaryAPI:
    def __init__(self, persist_path: str | None = None) -> None:
        self._store = DataStore(persist_path=persist_path)
        self.members = MemberService(self._store)
        self.boards = BoardService(self._store)
        self.items = ItemService(self._store)

    def create_item(self, actor_id: str, **kwargs: Any) -> dict[str, Any]:
        item = self.items.create_item(creator_id=actor_id, **kwargs)
        return item.to_dict()

    def complete_item(self, item_id: str) -> dict[str, Any]:
        item = self.items.update_item(item_id, status=Status.DONE)
        return item.to_dict()

    def board_stats(self, board_id: str) -> dict[str, Any]:
        return self.items.board_stats(board_id)

    def workload_report(self, board_id: str) -> list[dict[str, Any]]:
        return self.items.workload_report(board_id)

    def performance_report(self, board_id: str) -> dict[str, Any]:
        return self.items.performance_report(board_id)

    def save(self, path: str | None = None) -> None:
        self._store.save(path)

    def load(self, path: str) -> None:
        self._store.load(path)
