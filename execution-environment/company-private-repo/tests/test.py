"""Tests for TaskFlow."""

from __future__ import annotations

import os
import sys
import unittest
from datetime import datetime, timedelta
from typing import Any

sys.path.insert(
    0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src")
)

from api.app import TaskFlowAPI  # pyright: ignore[reportMissingImports]
from models.core import (  # pyright: ignore[reportMissingImports]
    Priority,
    Status,
    UserRole,
)
from models.store import (  # pyright: ignore[reportMissingImports]
    DataStore,
    NotFoundError,
    StorageError,
)
from services.project_service import (  # pyright: ignore[reportMissingImports]
    ProjectService,
    UserService,
)
from services.task_service import TaskService  # pyright: ignore[reportMissingImports]
from utils.helpers import (  # pyright: ignore[reportMissingImports]
    business_days_until,
    days_until,
    extract_mentions,
    generate_task_key,
    is_overdue,
    mask_email,
    paginate,
    short_id,
    slugify,
    truncate,
    validate_hex_color,
    validate_story_points,
)

# ---------------------------------------------------------------------------
# Bootstrap helpers
# ---------------------------------------------------------------------------


def make_api() -> TaskFlowAPI:
    return TaskFlowAPI()


def bootstrap(api: TaskFlowAPI) -> dict[str, Any]:
    alice = api.users.create_user(
        "alice", "alice@example.com", "Alice Smith", UserRole.ADMIN
    )
    bob = api.users.create_user("bob", "bob@example.com", "Bob Jones")
    carol = api.users.create_user(
        "carol", "carol@example.com", "Carol White", UserRole.MANAGER
    )

    proj = api.projects.create_project(
        "TaskFlow Core", alice.id, "Main product project"
    )
    api.projects.add_member(proj.id, bob.id, alice.id)
    api.projects.add_member(proj.id, carol.id, alice.id)

    bug_tag = api.tags.create_tag("bug", "#ef4444")
    feat_tag = api.tags.create_tag("feature", "#22c55e")

    sprint = api.sprints.create_sprint(
        proj.id,
        "Sprint 1",
        datetime.utcnow() - timedelta(days=7),
        datetime.utcnow() + timedelta(days=7),
        goal="Ship the MVP",
    )
    api.sprints.activate_sprint(sprint.id)

    t1 = api.create_task(
        actor_id=alice.id,
        title="Set up CI pipeline",
        project_id=proj.id,
        description="Configure GitHub Actions",
        priority=Priority.HIGH,
        assignee_ids=[bob.id],
        tag_ids=[feat_tag.id],
        sprint_id=sprint.id,
        story_points=5,
        estimated_hours=8.0,
    )
    t2 = api.create_task(
        actor_id=alice.id,
        title="Fix login redirect bug",
        project_id=proj.id,
        priority=Priority.CRITICAL,
        assignee_ids=[carol.id],
        tag_ids=[bug_tag.id],
        sprint_id=sprint.id,
        story_points=3,
        due_date=datetime.utcnow() - timedelta(days=1),
    )
    t3 = api.create_task(
        actor_id=carol.id,
        title="Write API documentation",
        project_id=proj.id,
        assignee_ids=[alice.id, bob.id],
        sprint_id=sprint.id,
        story_points=8,
        estimated_hours=16.0,
    )

    return {
        "users": {"alice": alice, "bob": bob, "carol": carol},
        "project": proj,
        "sprint": sprint,
        "tags": {"bug": bug_tag, "feature": feat_tag},
        "tasks": {"t1": t1, "t2": t2, "t3": t3},
    }


# ---------------------------------------------------------------------------
# Helper tests
# ---------------------------------------------------------------------------


class TestHelpers(unittest.TestCase):
    def test_slugify_basic(self) -> None:
        self.assertEqual(slugify("Hello World"), "hello-world")

    def test_slugify_special_chars(self) -> None:
        self.assertEqual(slugify("C++ is great!"), "c-is-great")

    def test_truncate_short(self) -> None:
        self.assertEqual(truncate("hi", 80), "hi")

    def test_truncate_long(self) -> None:
        result = truncate("a" * 100, 20)
        self.assertEqual(len(result), 20)
        self.assertTrue(result.endswith("..."))

    def test_extract_mentions(self) -> None:
        self.assertEqual(
            extract_mentions("Hey @alice and @bob, check this"), ["alice", "bob"]
        )

    def test_mask_email(self) -> None:
        self.assertEqual(mask_email("alice@example.com"), "a***e@example.com")

    def test_is_overdue_true(self) -> None:
        self.assertTrue(is_overdue(datetime.utcnow() - timedelta(days=1)))

    def test_is_overdue_false(self) -> None:
        self.assertFalse(is_overdue(datetime.utcnow() + timedelta(days=1)))

    def test_is_overdue_none(self) -> None:
        self.assertFalse(is_overdue(None))

    def test_days_until_future(self) -> None:
        result = days_until(datetime.utcnow() + timedelta(days=5))
        self.assertIsNotNone(result)
        assert result is not None
        self.assertIn(result, [4, 5])

    def test_business_days_until(self) -> None:
        result = business_days_until(datetime.utcnow() + timedelta(days=7))
        self.assertIsNotNone(result)
        assert result is not None
        self.assertLessEqual(result, 7)
        self.assertGreaterEqual(result, 4)

    def test_validate_hex_color_valid(self) -> None:
        self.assertTrue(validate_hex_color("#FF5733"))
        self.assertTrue(validate_hex_color("#000000"))

    def test_validate_hex_color_invalid(self) -> None:
        self.assertFalse(validate_hex_color("FF5733"))
        self.assertFalse(validate_hex_color("#GGG"))

    def test_validate_story_points_valid(self) -> None:
        for v in [1, 2, 3, 5, 8, 13, 21]:
            self.assertTrue(validate_story_points(v))

    def test_validate_story_points_invalid(self) -> None:
        for v in [0, 4, 6, 10, 22]:
            self.assertFalse(validate_story_points(v))

    def test_paginate_basic(self) -> None:
        items = list(range(100))
        page, meta = paginate(items, page=2, per_page=10)
        self.assertEqual(page, list(range(10, 20)))
        self.assertEqual(meta["total_pages"], 10)
        self.assertTrue(meta["has_next"])
        self.assertTrue(meta["has_prev"])

    def test_paginate_last_page(self) -> None:
        items = list(range(25))
        page, meta = paginate(items, page=3, per_page=10)
        self.assertEqual(len(page), 5)
        self.assertFalse(meta["has_next"])

    def test_short_id_deterministic(self) -> None:
        uid = "some-fixed-uuid"
        self.assertEqual(short_id(uid), short_id(uid))
        self.assertEqual(len(short_id(uid)), 8)

    def test_generate_task_key(self) -> None:
        key = generate_task_key("TaskFlow", 42)
        self.assertTrue(key.endswith("-42"))


# ---------------------------------------------------------------------------
# Store tests
# ---------------------------------------------------------------------------


class TestDataStore(unittest.TestCase):
    def setUp(self) -> None:
        self.store = DataStore()
        self.svc_u = UserService(self.store)
        self.svc_p = ProjectService(self.store)
        self.svc_t = TaskService(self.store)

    def _make_user(self, username: str = "tester") -> object:
        return self.svc_u.create_user(
            username, f"{username}@test.com", username.title()
        )

    def _make_project(self, owner_id: str) -> object:
        return self.svc_p.create_project("Test Project", owner_id)

    def test_add_and_get_user(self) -> None:
        u = self.svc_u.create_user("userX", "userx@test.com", "User X")
        fetched = self.store.get_user(u.id)
        self.assertEqual(fetched.username, "userX")

    def test_duplicate_username(self) -> None:
        self.svc_u.create_user("dup", "dup@test.com", "Dup")
        with self.assertRaises(StorageError):
            self.svc_u.create_user("dup", "dup2@test.com", "Dup 2")

    def test_user_not_found(self) -> None:
        with self.assertRaises(NotFoundError):
            self.store.get_user("nonexistent-id")

    def test_create_task_basic(self) -> None:
        owner = self.svc_u.create_user("owner1", "o1@test.com", "Owner One")
        proj = self.svc_p.create_project("Proj", owner.id)
        task = self.svc_t.create_task("My Task", proj.id, owner.id)
        self.assertEqual(task.title, "My Task")
        self.assertEqual(task.status, Status.TODO)

    def test_task_archived_project_raises(self) -> None:
        owner = self.svc_u.create_user("arowner", "ar@test.com", "Ar Owner")
        proj = self.svc_p.create_project("Proj", owner.id)
        self.svc_p.archive_project(proj.id, owner.id)
        with self.assertRaises(StorageError):
            self.svc_t.create_task("Oops", proj.id, owner.id)

    def test_subtask_linkage(self) -> None:
        owner = self.svc_u.create_user("sub_owner", "sub@test.com", "Sub Owner")
        proj = self.svc_p.create_project("Proj", owner.id)
        parent = self.svc_t.create_task("Parent", proj.id, owner.id)
        child = self.svc_t.create_task(
            "Child", proj.id, owner.id, parent_task_id=parent.id
        )
        updated_parent = self.store.get_task(parent.id)
        self.assertIn(child.id, updated_parent.subtask_ids)
        self.assertEqual(child.parent_task_id, parent.id)

    def test_delete_task_cleans_parent(self) -> None:
        owner = self.svc_u.create_user("del_owner", "del@test.com", "Del Owner")
        proj = self.svc_p.create_project("Proj", owner.id)
        parent = self.svc_t.create_task("Parent", proj.id, owner.id)
        child = self.svc_t.create_task(
            "Child", proj.id, owner.id, parent_task_id=parent.id
        )
        self.svc_t.delete_task(child.id)
        updated_parent = self.store.get_task(parent.id)
        self.assertNotIn(child.id, updated_parent.subtask_ids)

    def test_search_by_status(self) -> None:
        owner = self.svc_u.create_user("srch_owner", "srch@test.com", "Srch Owner")
        proj = self.svc_p.create_project("Proj", owner.id)
        t1 = self.svc_t.create_task("T1", proj.id, owner.id)
        self.svc_t.create_task("T2", proj.id, owner.id)
        self.svc_t.update_task(t1.id, status=Status.DONE)
        results = self.svc_t.search_tasks(status=Status.DONE, project_id=proj.id)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0].id, t1.id)

    def test_comment_add_and_delete(self) -> None:
        owner = self.svc_u.create_user("comment_u", "cu@test.com", "Comment U")
        proj = self.svc_p.create_project("Proj", owner.id)
        task = self.svc_t.create_task("Comment Test", proj.id, owner.id)
        comment = self.svc_t.add_comment(task.id, owner.id, "Hello!")
        self.assertEqual(comment.content, "Hello!")
        self.svc_t.delete_comment(task.id, comment.id)
        updated = self.store.get_task(task.id)
        self.assertEqual(len(updated.comments), 0)

    def test_comment_mention_parsing(self) -> None:
        owner = self.svc_u.create_user("mention_u", "mu@test.com", "Mention U")
        other = self.svc_u.create_user("mentioned_u", "mtu@test.com", "Mentioned U")
        proj = self.svc_p.create_project("Proj", owner.id)
        task = self.svc_t.create_task("Mention Test", proj.id, owner.id)
        comment = self.svc_t.add_comment(task.id, owner.id, f"Hey @{other.username}!")
        self.assertIn(other.id, comment.mentions)


# ---------------------------------------------------------------------------
# API / integration tests
# ---------------------------------------------------------------------------


class TestTaskFlowAPI(unittest.TestCase):
    def setUp(self) -> None:
        self.api = make_api()
        self.ctx: dict[str, Any] = bootstrap(self.api)

    def _project_id(self) -> str:
        from models.core import Project  # pyright: ignore[reportMissingImports]

        proj = self.ctx["project"]
        assert isinstance(proj, Project)
        return proj.id

    def _sprint_id(self) -> str:
        from models.core import Sprint  # pyright: ignore[reportMissingImports]

        sprint = self.ctx["sprint"]
        assert isinstance(sprint, Sprint)
        return sprint.id

    def _user_id(self, key: str) -> str:
        from models.core import User  # pyright: ignore[reportMissingImports]

        users = self.ctx["users"]
        assert isinstance(users, dict)
        user = users[key]
        assert isinstance(user, User)
        return user.id

    def _user_username(self, key: str) -> str:
        from models.core import User  # pyright: ignore[reportMissingImports]

        users = self.ctx["users"]
        assert isinstance(users, dict)
        user = users[key]
        assert isinstance(user, User)
        return user.username

    def _task_id(self, key: str) -> str:
        tasks = self.ctx["tasks"]
        assert isinstance(tasks, dict)
        task = tasks[key]
        assert isinstance(task, dict)
        return str(task["id"])

    def test_project_stats(self) -> None:
        stats = self.api.project_stats(self._project_id())
        self.assertIn("total_tasks", stats)
        self.assertEqual(stats["total_tasks"], 3)

    def test_overdue_detection(self) -> None:
        stats = self.api.project_stats(self._project_id())
        self.assertGreaterEqual(int(stats["overdue_count"]), 1)

    def test_complete_task_emits_notification(self) -> None:
        alice_id = self._user_id("alice")
        t1_id = self._task_id("t1")
        self.api.tasks.update_task(t1_id, watchers=[alice_id])
        bob_id = self._user_id("bob")
        self.api.complete_task(t1_id, bob_id)
        count = self.api.notifications.get_unread_count(alice_id)
        self.assertGreater(count, 0)

    def test_search_pagination(self) -> None:
        result = self.api.search_tasks(
            project_id=self._project_id(), page=1, per_page=2
        )
        self.assertIn("items", result)
        self.assertIn("pagination", result)
        self.assertLessEqual(len(result["items"]), 2)

    def test_project_report_text(self) -> None:
        report = self.api.project_report(self._project_id())
        self.assertIn("TaskFlow Core", report)
        self.assertIn("Task Summary", report)

    def test_sprint_report_text(self) -> None:
        report = self.api.sprint_report(self._sprint_id())
        self.assertIn("Sprint 1", report)

    def test_workload_report(self) -> None:
        wl = self.api.workload_report(self._project_id())
        self.assertIsInstance(wl, list)
        self.assertGreater(len(wl), 0)
        self.assertIn("open_tasks", wl[0])

    def test_velocity_trend_no_completed_sprints(self) -> None:
        trend = self.api.velocity_trend(self._project_id())
        self.assertEqual(trend, [])

    def test_burndown_data(self) -> None:
        data = self.api.burndown_data(self._sprint_id())
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_export_csv(self) -> None:
        csv_data = self.api.export_tasks(self._project_id())
        self.assertIn("title", csv_data)
        self.assertIn("Set up CI pipeline", csv_data)

    def test_team_performance(self) -> None:
        report = self.api.team_performance(self._project_id())
        self.assertIn("members", report)
        self.assertGreater(len(report["members"]), 0)

    def test_add_comment_with_mention(self) -> None:
        carol_id = self._user_id("carol")
        alice_id = self._user_id("alice")
        carol_username = self._user_username("carol")
        t3_id = self._task_id("t3")
        prev_count = self.api.notifications.get_unread_count(carol_id)
        self.api.add_comment(t3_id, alice_id, f"@{carol_username} please review this")
        new_count = self.api.notifications.get_unread_count(carol_id)
        self.assertGreater(new_count, prev_count)

    def test_find_blocked_tasks(self) -> None:
        blocked = self.api.tasks.find_blocked_tasks(self._project_id())
        self.assertIsInstance(blocked, list)

    def test_tag_creation_dedup(self) -> None:
        t1 = self.api.tags.create_tag("duplicate-tag")
        t2 = self.api.tags.create_tag("duplicate-tag")
        self.assertEqual(t1.id, t2.id)


class TestPersistence(unittest.TestCase):
    def test_save_and_load(self) -> None:
        import tempfile

        api = make_api()
        alice = api.users.create_user(
            "persist_alice", "pa@test.com", "Alice P", UserRole.ADMIN
        )
        proj = api.projects.create_project("Persist Proj", alice.id)

        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as f:
            path = f.name
        try:
            api.save(path)
            api2 = TaskFlowAPI(persist_path=path)
            loaded_user = api2.users.get_user(alice.id)
            self.assertEqual(loaded_user.username, "persist_alice")
            loaded_proj = api2.projects.get_project(proj.id)
            self.assertEqual(loaded_proj.name, "Persist Proj")
        finally:
            os.unlink(path)


if __name__ == "__main__":
    unittest.main(verbosity=2)
