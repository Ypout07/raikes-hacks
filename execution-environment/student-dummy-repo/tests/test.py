"""
Tests for Luminary.

Expected results:
  PASSING: all tests except test_lead_can_add_member
  FAILING: test_lead_can_add_member  ← bug in _require_lead in board_service.py
"""

from __future__ import annotations

import os
import sys
import unittest
from datetime import datetime, timedelta, timezone

sys.path.insert(
    0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src")
)

from typing import Any

from api.app import LuminaryAPI  # pyright: ignore[reportMissingImports]
from models.core import (  # pyright: ignore[reportMissingImports]
    Board,
    Member,
    Role,
    Status,
)
from models.store import (  # pyright: ignore[reportMissingImports]
    DataStore,
    NotFoundError,
    StoreError,
)
from services.board_service import (  # pyright: ignore[reportMissingImports]
    BoardService,
    MemberService,
    PermissionError,
)
from services.item_service import ItemService  # pyright: ignore[reportMissingImports]

UTC = timezone.utc


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def make_api() -> LuminaryAPI:
    return LuminaryAPI()


def bootstrap(api: LuminaryAPI) -> dict[str, Any]:
    alice = api.members.create_member(
        "alice", "alice@example.com", "Alice Smith", Role.ADMIN
    )
    bob = api.members.create_member("bob", "bob@example.com", "Bob Jones", Role.LEAD)
    carol = api.members.create_member(
        "carol", "carol@example.com", "Carol White", Role.MEMBER
    )

    board = api.boards.create_board("Alpha Project", alice.id, "Main board")
    api.boards.add_member(board.id, bob.id, alice.id)
    api.boards.add_member(board.id, carol.id, alice.id)

    i1 = api.create_item(
        actor_id=alice.id,
        title="Build login page",
        board_id=board.id,
        assignee_ids=[bob.id],
        estimated_hours=4.0,
        due_date=datetime.now(UTC) + timedelta(days=5),
    )
    i2 = api.create_item(
        actor_id=alice.id,
        title="Fix broken nav",
        board_id=board.id,
        assignee_ids=[carol.id],
        estimated_hours=2.0,
        due_date=datetime.now(UTC) - timedelta(days=1),  # overdue
    )
    i3 = api.create_item(
        actor_id=bob.id,
        title="Write unit tests",
        board_id=board.id,
        assignee_ids=[alice.id, bob.id],
        estimated_hours=6.0,
    )

    return {
        "members": {"alice": alice, "bob": bob, "carol": carol},
        "board": board,
        "items": {"i1": i1, "i2": i2, "i3": i3},
    }


# ---------------------------------------------------------------------------
# Store tests
# ---------------------------------------------------------------------------


class TestDataStore(unittest.TestCase):
    def setUp(self) -> None:
        self.store: DataStore = DataStore()
        self.msvc: MemberService = MemberService(self.store)
        self.bsvc: BoardService = BoardService(self.store)
        self.isvc: ItemService = ItemService(self.store)

    def test_create_and_get_member(self) -> None:
        m = self.msvc.create_member("dev1", "dev1@test.com", "Dev One")
        fetched = self.store.get_member(m.id)
        self.assertEqual(fetched.username, "dev1")

    def test_duplicate_username_raises(self) -> None:
        self.msvc.create_member("dup", "dup@test.com", "Dup")
        with self.assertRaises(StoreError):
            self.msvc.create_member("dup", "dup2@test.com", "Dup 2")

    def test_member_not_found_raises(self) -> None:
        with self.assertRaises(NotFoundError):
            self.store.get_member("bad-id")

    def test_create_item_basic(self) -> None:
        owner = self.msvc.create_member("owner1", "o1@test.com", "Owner One")
        board = self.bsvc.create_board("Board", owner.id)
        item = self.isvc.create_item("My Item", board.id, owner.id)
        self.assertEqual(item.title, "My Item")
        self.assertEqual(item.status, Status.OPEN)

    def test_create_item_archived_board_raises(self) -> None:
        owner = self.msvc.create_member("archowner", "arch@test.com", "Arch Owner")
        board = self.bsvc.create_board("Board", owner.id)
        self.bsvc.archive_board(board.id, owner.id)
        with self.assertRaises(StoreError):
            self.isvc.create_item("Oops", board.id, owner.id)

    def test_search_by_status(self) -> None:
        owner = self.msvc.create_member("srch", "srch@test.com", "Srch")
        board = self.bsvc.create_board("Board", owner.id)
        i1 = self.isvc.create_item("Item 1", board.id, owner.id)
        self.isvc.create_item("Item 2", board.id, owner.id)
        self.isvc.update_item(i1.id, status=Status.DONE)
        results = self.isvc.search_items(status=Status.DONE, board_id=board.id)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].id, i1.id)

    def test_overdue_search(self) -> None:
        owner = self.msvc.create_member("od", "od@test.com", "OD")
        board = self.bsvc.create_board("Board", owner.id)
        past = datetime.now(UTC) - timedelta(days=2)
        future = datetime.now(UTC) + timedelta(days=2)
        self.isvc.create_item("Overdue", board.id, owner.id, due_date=past)
        self.isvc.create_item("Future", board.id, owner.id, due_date=future)
        results = self.isvc.search_items(overdue_only=True, board_id=board.id)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].title, "Overdue")


# ---------------------------------------------------------------------------
# Permission tests  (one failing by design)
# ---------------------------------------------------------------------------


class TestPermissions(unittest.TestCase):
    def setUp(self) -> None:
        self.store: DataStore = DataStore()
        self.msvc: MemberService = MemberService(self.store)
        self.bsvc: BoardService = BoardService(self.store)

    def test_admin_can_add_member(self) -> None:
        admin = self.msvc.create_member(
            "admin1", "admin1@test.com", "Admin", Role.ADMIN
        )
        newbie = self.msvc.create_member("newbie", "newbie@test.com", "Newbie")
        board = self.bsvc.create_board("Board", admin.id)
        self.bsvc.add_member(board.id, newbie.id, admin.id)
        self.assertIn(newbie.id, self.store.get_board(board.id).member_ids)

    def test_owner_can_add_member(self) -> None:
        owner = self.msvc.create_member(
            "owner1", "owner1@test.com", "Owner", Role.MEMBER
        )
        newbie = self.msvc.create_member("newbie2", "newbie2@test.com", "Newbie 2")
        board = self.bsvc.create_board("Board", owner.id)
        self.bsvc.add_member(board.id, newbie.id, owner.id)
        self.assertIn(newbie.id, self.store.get_board(board.id).member_ids)

    def test_plain_member_cannot_add_member(self) -> None:
        owner = self.msvc.create_member("owner2", "owner2@test.com", "Owner 2")
        plain = self.msvc.create_member("plain", "plain@test.com", "Plain", Role.MEMBER)
        newbie = self.msvc.create_member("newbie3", "newbie3@test.com", "Newbie 3")
        board = self.bsvc.create_board("Board", owner.id)
        self.bsvc.add_member(board.id, plain.id, owner.id)
        with self.assertRaises(PermissionError):
            self.bsvc.add_member(board.id, newbie.id, plain.id)

    def test_lead_can_add_member(self) -> None:
        """
        A LEAD who is a board member should be able to add other members.
        This test FAILS due to a bug in _require_lead — leads are incorrectly
        rejected unless they are the board owner.
        """
        owner = self.msvc.create_member("owner3", "owner3@test.com", "Owner 3")
        lead = self.msvc.create_member("lead1", "lead1@test.com", "Lead 1", Role.LEAD)
        newbie = self.msvc.create_member("newbie4", "newbie4@test.com", "Newbie 4")
        board = self.bsvc.create_board("Board", owner.id)
        self.bsvc.add_member(board.id, lead.id, owner.id)
        # This should succeed but raises PermissionError due to the bug
        self.bsvc.add_member(board.id, newbie.id, lead.id)
        self.assertIn(newbie.id, self.store.get_board(board.id).member_ids)


# ---------------------------------------------------------------------------
# API / integration tests
# ---------------------------------------------------------------------------


class TestLuminaryAPI(unittest.TestCase):
    def setUp(self) -> None:
        self.api: LuminaryAPI = make_api()
        self.ctx: dict[str, Any] = bootstrap(self.api)

    def _board_id(self) -> str:
        board = self.ctx["board"]
        assert isinstance(board, Board)
        return board.id

    def _member_id(self, key: str) -> str:
        members = self.ctx["members"]
        assert isinstance(members, dict)
        member = members[key]
        assert isinstance(member, Member)
        return member.id

    def _item_id(self, key: str) -> str:
        items = self.ctx["items"]
        assert isinstance(items, dict)
        item = items[key]
        assert isinstance(item, dict)
        return str(item["id"])

    def test_board_stats_total(self) -> None:
        stats = self.api.board_stats(self._board_id())
        self.assertEqual(stats["total_items"], 3)

    def test_board_stats_overdue(self) -> None:
        stats = self.api.board_stats(self._board_id())
        self.assertGreaterEqual(int(stats["overdue_count"]), 1)

    def test_complete_item(self) -> None:
        i1_id = self._item_id("i1")
        result = self.api.complete_item(i1_id)
        self.assertEqual(result["status"], "done")

    def test_workload_report_structure(self) -> None:
        report = self.api.workload_report(self._board_id())
        self.assertIsInstance(report, list)
        self.assertGreater(len(report), 0)
        self.assertIn("open_items", report[0])

    def test_performance_report_structure(self) -> None:
        report = self.api.performance_report(self._board_id())
        self.assertIn("members", report)

    def test_search_items(self) -> None:
        results = self.api.items.search_items(query="login", board_id=self._board_id())
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].title, "Build login page")

    def test_persistence(self) -> None:
        import tempfile

        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as f:
            path = f.name
        try:
            self.api.save(path)
            api2 = LuminaryAPI(persist_path=path)
            alice_id = self._member_id("alice")
            loaded = api2.members.get_member(alice_id)
            self.assertEqual(loaded.username, "alice")
        finally:
            os.unlink(path)


if __name__ == "__main__":
    unittest.main(verbosity=2)
