"""Board and Member services for Luminary."""

from __future__ import annotations

from models.core import Board, Member, Role
from models.store import DataStore, NotFoundError, StoreError


class PermissionError(Exception):
    pass


class MemberService:
    def __init__(self, store: DataStore) -> None:
        self._store = store

    def create_member(
        self,
        username: str,
        email: str,
        display_name: str,
        role: Role = Role.MEMBER,
    ) -> Member:
        if not username or not email:
            raise StoreError("Username and email are required")
        if "@" not in email:
            raise StoreError("Invalid email address")
        for m in self._store.list_members():
            if m.email.lower() == email.lower():
                raise StoreError(f"Email '{email}' already registered")
        member = Member(
            username=username, email=email, display_name=display_name, role=role
        )
        return self._store.add_member(member)

    def get_member(self, member_id: str) -> Member:
        return self._store.get_member(member_id)

    def get_by_username(self, username: str) -> Member | None:
        return self._store.get_member_by_username(username)

    def deactivate(self, member_id: str) -> Member:
        member = self._store.get_member(member_id)
        member.is_active = False
        return self._store.update_member(member)

    def list_members(self, active_only: bool = True) -> list[Member]:
        return self._store.list_members(active_only=active_only)


class BoardService:
    def __init__(self, store: DataStore) -> None:
        self._store = store

    def create_board(
        self,
        name: str,
        owner_id: str,
        description: str = "",
    ) -> Board:
        if not name:
            raise StoreError("Board name is required")
        self._store.get_member(owner_id)
        board = Board(name=name, owner_id=owner_id, description=description)
        board.member_ids.append(owner_id)
        return self._store.add_board(board)

    def get_board(self, board_id: str) -> Board:
        return self._store.get_board(board_id)

    def archive_board(self, board_id: str, actor_id: str) -> Board:
        board = self._store.get_board(board_id)
        self._require_lead(board, actor_id)
        board.is_archived = True
        return self._store.update_board(board)

    def add_member(self, board_id: str, member_id: str, actor_id: str) -> Board:
        board = self._store.get_board(board_id)
        self._require_lead(board, actor_id)
        self._store.get_member(member_id)
        if member_id not in board.member_ids:
            board.member_ids.append(member_id)
        return self._store.update_board(board)

    def remove_member(self, board_id: str, member_id: str, actor_id: str) -> Board:
        board = self._store.get_board(board_id)
        self._require_lead(board, actor_id)
        if member_id == board.owner_id:
            raise StoreError("Cannot remove the board owner")
        if member_id in board.member_ids:
            board.member_ids.remove(member_id)
        return self._store.update_board(board)

    def list_boards(self, member_id: str | None = None) -> list[Board]:
        if member_id is not None:
            return self._store.list_boards_for_member(member_id)
        return self._store.list_boards()

    def get_board_members(self, board_id: str) -> list[Member]:
        board = self._store.get_board(board_id)
        members: list[Member] = []
        for uid in board.member_ids:
            try:
                members.append(self._store.get_member(uid))
            except NotFoundError:
                pass
        return members

    def _require_lead(self, board: Board, actor_id: str) -> None:
        """
        Enforce that the actor has lead or admin privileges on this board.
        Admins always pass. Board owners always pass.
        Leads who are board members should pass — but currently don't due to
        incorrect ordering of role and membership checks.
        """
        actor = self._store.get_member(actor_id)
        if actor.role == Role.ADMIN:
            return
        if actor_id not in board.member_ids and actor_id != board.owner_id:
            raise PermissionError("You are not a member of this board")
        if actor_id != board.owner_id:
            raise PermissionError("Only the board owner or an admin can do this")
