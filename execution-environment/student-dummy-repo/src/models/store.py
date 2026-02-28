"""In-memory store for Luminary."""

from __future__ import annotations

import json
import os
import threading
from datetime import datetime, timezone
from typing import Any

from models.core import Board, Item, Member

UTC = timezone.utc


class StoreError(Exception):
    pass


class NotFoundError(StoreError):
    pass


class DataStore:
    def __init__(self, persist_path: str | None = None) -> None:
        self._lock = threading.RLock()
        self._members: dict[str, Member] = {}
        self._boards: dict[str, Board] = {}
        self._items: dict[str, Item] = {}
        self._persist_path = persist_path

        if persist_path and os.path.exists(persist_path):
            self.load(persist_path)

    # ------------------------------------------------------------------
    # Members
    # ------------------------------------------------------------------

    def add_member(self, member: Member) -> Member:
        with self._lock:
            if member.id in self._members:
                raise StoreError(f"Member {member.id} already exists")
            for m in self._members.values():
                if m.username == member.username:
                    raise StoreError(f"Username '{member.username}' already taken")
            self._members[member.id] = member
            return member

    def get_member(self, member_id: str) -> Member:
        with self._lock:
            if member_id not in self._members:
                raise NotFoundError(f"Member {member_id} not found")
            return self._members[member_id]

    def get_member_by_username(self, username: str) -> Member | None:
        with self._lock:
            for m in self._members.values():
                if m.username == username:
                    return m
            return None

    def list_members(self, active_only: bool = False) -> list[Member]:
        with self._lock:
            members = list(self._members.values())
        if active_only:
            members = [m for m in members if m.is_active]
        return members

    def update_member(self, member: Member) -> Member:
        with self._lock:
            if member.id not in self._members:
                raise NotFoundError(f"Member {member.id} not found")
            self._members[member.id] = member
            return member

    # ------------------------------------------------------------------
    # Boards
    # ------------------------------------------------------------------

    def add_board(self, board: Board) -> Board:
        with self._lock:
            if board.id in self._boards:
                raise StoreError(f"Board {board.id} already exists")
            self._boards[board.id] = board
            return board

    def get_board(self, board_id: str) -> Board:
        with self._lock:
            if board_id not in self._boards:
                raise NotFoundError(f"Board {board_id} not found")
            return self._boards[board_id]

    def list_boards(self, include_archived: bool = False) -> list[Board]:
        with self._lock:
            boards = list(self._boards.values())
        if not include_archived:
            boards = [b for b in boards if not b.is_archived]
        return boards

    def list_boards_for_member(
        self, member_id: str, include_archived: bool = False
    ) -> list[Board]:
        with self._lock:
            boards = list(self._boards.values())
        return [
            b
            for b in boards
            if (include_archived or not b.is_archived)
            and (b.owner_id == member_id or member_id in b.member_ids)
        ]

    def update_board(self, board: Board) -> Board:
        with self._lock:
            if board.id not in self._boards:
                raise NotFoundError(f"Board {board.id} not found")
            board.updated_at = datetime.now(UTC)
            self._boards[board.id] = board
            return board

    # ------------------------------------------------------------------
    # Items
    # ------------------------------------------------------------------

    def add_item(self, item: Item) -> Item:
        with self._lock:
            if item.id in self._items:
                raise StoreError(f"Item {item.id} already exists")
            self._items[item.id] = item
            return item

    def get_item(self, item_id: str) -> Item:
        with self._lock:
            if item_id not in self._items:
                raise NotFoundError(f"Item {item_id} not found")
            return self._items[item_id]

    def list_items(self, board_id: str | None = None) -> list[Item]:
        with self._lock:
            items = list(self._items.values())
        if board_id is not None:
            items = [i for i in items if i.board_id == board_id]
        return items

    def list_items_for_member(self, member_id: str) -> list[Item]:
        with self._lock:
            return [i for i in self._items.values() if member_id in i.assignee_ids]

    def update_item(self, item: Item) -> Item:
        with self._lock:
            if item.id not in self._items:
                raise NotFoundError(f"Item {item.id} not found")
            item.updated_at = datetime.now(UTC)
            self._items[item.id] = item
            return item

    def delete_item(self, item_id: str) -> None:
        with self._lock:
            if item_id not in self._items:
                raise NotFoundError(f"Item {item_id} not found")
            del self._items[item_id]

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def save(self, path: str | None = None) -> None:
        target = path or self._persist_path
        if not target:
            return
        with self._lock:
            data: dict[str, Any] = {
                "members": {mid: m.to_dict() for mid, m in self._members.items()},
                "boards": {bid: b.to_dict() for bid, b in self._boards.items()},
                "items": {iid: i.to_dict() for iid, i in self._items.items()},
                "saved_at": datetime.now(UTC).isoformat(),
            }
        with open(target, "w") as f:
            json.dump(data, f, indent=2)

    def load(self, path: str) -> None:
        with open(path) as f:
            data: dict[str, Any] = json.load(f)
        with self._lock:
            for mid, mdata in data.get("members", {}).items():
                self._members[mid] = Member.from_dict(mdata)
            for bid, bdata in data.get("boards", {}).items():
                self._boards[bid] = Board.from_dict(bdata)
            for iid, idata in data.get("items", {}).items():
                self._items[iid] = Item.from_dict(idata)

    def clear(self) -> None:
        with self._lock:
            self._members.clear()
            self._boards.clear()
            self._items.clear()
