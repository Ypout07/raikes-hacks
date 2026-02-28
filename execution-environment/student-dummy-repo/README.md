# Luminary, Student Dummy Repo

A lightweight task tracking backend. This is a sandbox codebase for agent evaluation.

## Structure

```
student-dummy-repo/
├── src/
│   ├── api/app.py                  # Top-level API facade
│   ├── models/core.py              # Data models: Member, Item, Board
│   ├── models/store.py             # In-memory store
│   ├── services/board_service.py   # Board and member management
│   └── services/item_service.py    # Item CRUD and analytics
└── tests/
    └── test.py
```

## Running tests

```bash
python tests/test.py
```
