CREATE TABLE decks(
    id INTEGER PRIMARY KEY,

    board_id INTEGER,

    name TEXT NOT NULL,
    description TEXT,
    position INTEGER NOT NULL,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY(board_id)
        REFERENCES boards(id)
        ON DELETE SET NULL
);

CREATE TABLE flashcards(
    id INTEGER PRIMARY KEY,

    deck_id INTEGER NOT NULL,

    front TEXT NOT NULL,
    back TEXT NOT NULL,

    favorite INTEGER DEFAULT 0,
    archived INTEGER DEFAULT 0,

    ease REAL DEFAULT 2.5,
    interval INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,

    review_count INTEGER DEFAULT 0,
    lapses INTEGER DEFAULT 0,

    due_date TEXT,
    last_reviewed TEXT,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY(deck_id)
        REFERENCES decks(id)
        ON DELETE CASCADE
);

CREATE TABLE flashcard_tags(
    id INTEGER PRIMARY KEY,

    deck_id INTEGER NOT NULL,

    name TEXT NOT NULL,
    color TEXT NOT NULL,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY(deck_id)
        REFERENCES decks(id)
        ON DELETE CASCADE
);

CREATE TABLE flashcard_tag_map(
    flashcard_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,

    PRIMARY KEY(flashcard_id, tag_id),

    FOREIGN KEY(flashcard_id)
        REFERENCES flashcards(id)
        ON DELETE CASCADE,

    FOREIGN KEY(tag_id)
        REFERENCES flashcard_tags(id)
        ON DELETE CASCADE
);