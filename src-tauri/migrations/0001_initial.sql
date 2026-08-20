CREATE TABLE boards(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    accent_color TEXT DEFAULT '#3b82f6',
    position INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE columns(
    id INTEGER PRIMARY KEY,
    board_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    position INTEGER NOT NULL,
    color TEXT,
    collapsed INTEGER DEFAULT 0,

    FOREIGN KEY(board_id)
        REFERENCES boards(id)
        ON DELETE CASCADE
);

CREATE TABLE cards(
    id INTEGER PRIMARY KEY,
    column_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    favorite INTEGER DEFAULT 0,
    archived INTEGER DEFAULT 0,
    due_date TEXT,
    position INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY(column_id)
        REFERENCES columns(id)
        ON DELETE CASCADE
);

CREATE TABLE labels(
    id INTEGER PRIMARY KEY,
    board_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY(board_id)
        REFERENCES boards(id)
        ON DELETE CASCADE
);

CREATE TABLE card_labels(
    card_id INTEGER NOT NULL,
    label_id INTEGER NOT NULL,

    PRIMARY KEY(card_id,label_id),

    FOREIGN KEY(card_id)
        REFERENCES cards(id)
        ON DELETE CASCADE,

    FOREIGN KEY(label_id)
        REFERENCES labels(id)
        ON DELETE CASCADE
);

