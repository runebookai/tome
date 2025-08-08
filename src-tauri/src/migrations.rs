use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "bootstrap",
            sql: r#"
CREATE TABLE IF NOT EXISTS apps (
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL DEFAULT "Untitled",
    description TEXT NOT NULL DEFAULT "",
    readme      TEXT NOT NULL DEFAULT "",
    image       TEXT NOT NULL DEFAULT "",
    interface   TEXT NOT NULL DEFAULT "chat",
    nodes       JSON NOT NULL DEFAULT "[]",
    created     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id       INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    app_id   INTEGER NOT NULL,
    nodes    JSON NOT NULL DEFAULT "[]",
    summary  TEXT NOT NULL DEFAULT "Unknown",
    created  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(app_id) REFERENCES apps(id)
);

CREATE TABLE IF NOT EXISTS messages (
    id           INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    role         TEXT NOT NULL,
    content      TEXT NOT NULL,
    name         TEXT,
    tool_calls   JSON NOT NULL DEFAULT "[]",
    session_id   INTEGER NOT NULL,
    created      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS mcp_servers (
    id       INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    command  TEXT NOT NULL,
    metadata JSON
);

CREATE TABLE IF NOT EXISTS apps_mcp_servers (
    id            INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    app_id        INTEGER NOT NULL,
    mcp_server_id INTEGER NOT NULL,
    UNIQUE(app_id, mcp_server_id),
    FOREIGN KEY(app_id) REFERENCES apps(id),
    FOREIGN KEY(mcp_server_id) REFERENCES mcp_servers(id)
);
        "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "app_seeds",
            sql: r#"
INSERT INTO
    "apps" ("name", "description", "readme", "image", "interface", "nodes")
VALUES
    ('Chat', 'Chat with an LLM', '', '', 'Chat', '[]');
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "add_settings",
            sql: r#"
CREATE TABLE IF NOT EXISTS settings (
    id      INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    display TEXT NOT NULL,
    key     TEXT NOT NULL,
    value   TEXT NOT NULL,
    UNIQUE(key)
);

INSERT INTO
    "settings" ("display", "key", "value")
VALUES
    ('Ollama URL', 'ollama-url', '"http://localhost:11434"')
;
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_session_config",
            sql: r#"
ALTER TABLE sessions ADD COLUMN config JSON NOT NULL DEFAULT "{}";
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "add_message_thoughts_and_model",
            sql: r#"
ALTER TABLE messages ADD COLUMN thought TEXT;
ALTER TABLE messages ADD COLUMN model TEXT NOT NULL DEFAULT "";
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "update_default_session_config",
            sql: r#"
UPDATE sessions SET config = json_insert(config, '$.contextWindow', 4096);
UPDATE sessions SET config = json_insert(config, '$.temperature', 0.8);
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "associate_tool_call_with_response",
            sql: r#"
ALTER TABLE messages ADD COLUMN response_id INTEGER REFERENCES messages(id);
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 8,
            description: "expand_mcp_servers",
            sql: r#"
ALTER TABLE mcp_servers ADD COLUMN args JSON NOT NULL DEFAULT "[]";
ALTER TABLE mcp_servers ADD COLUMN env JSON NOT NULL DEFAULT "{}";
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 9,
            description: "add_explicit_name_to_mcp_servers",
            sql: r#"
ALTER TABLE mcp_servers ADD COLUMN name TEXT NOT NULL DEFAULT "Unknown";
UPDATE mcp_servers SET name = json_extract(metadata, '$.serverInfo.name');
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 10,
            description: "add_tool_call_id_and_openai_setting",
            sql: r#"
ALTER TABLE settings ADD COLUMN type TEXT NOT NULL DEFAULT "text";
ALTER TABLE settings ADD COLUMN value_null TEXT;
UPDATE settings SET value_null = value;
ALTER TABLE settings DROP COLUMN value;
ALTER TABLE settings RENAME COLUMN value_null TO value;

INSERT INTO settings ("display", "key", "type") VALUES ("OpenAI API Key", "openai-api-key", "password");

ALTER TABLE messages ADD COLUMN tool_call_id TEXT;
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 11,
            description: "add_config_table",
            sql: r#"
CREATE TABLE IF NOT EXISTS config (
    id      INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    key     TEXT NOT NULL,
    value   TEXT NOT NULL,
    UNIQUE(key)
);
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 12,
            description: "add_gemini_api_key_setting",
            sql: r#"
INSERT INTO settings ("display", "key", "type") VALUES ("Gemini API Key", "gemini-api-key", "password");
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 13,
            description: "add_engines",
            sql: r#"
CREATE TABLE IF NOT EXISTS engines (
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    type        TEXT NOT NULL,
    options     JSON NOT NULL DEFAULT "{}"
);

INSERT INTO engines ("name", "type", "options") VALUES
(
    "Ollama",
    "ollama",
    json_object(
        'url',
        (SELECT json_extract(value, '$') FROM settings WHERE key = 'ollama-url'),
        'apiKey',
        NULL
    )
),
(
    "OpenAI",
    "openai",
    json_object(
        'url',
        'https://api.openai.com/v1',
        'apiKey',
        (SELECT json_extract(value, '$') FROM settings WHERE key = 'openai-api-key')
    )
),
(
    "Gemini",
    "gemini",
    json_object(
        'url',
        'https://generativelanguage.googleapis.com',
        'apiKey',
        (SELECT json_extract(value, '$') FROM settings WHERE key = 'gemini-api-key')
    )
);
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 14,
            description: "add_color_scheme_setting",
            sql: r#"
INSERT INTO settings (display, key, value, type)
SELECT 'Color Scheme', 'color-scheme', '"system"', 'select'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE key = 'color-scheme');
"#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 15,
            description: "add_tasks",
            sql: r#"
CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    prompt      TEXT NOT NULL,
    period      TEXT NOT NULL,
    next_run    TEXT NOT NULL
);
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 16,
            description: "add_tasks_support",
            sql: r#"
ALTER TABLE sessions ADD COLUMN ephemeral BOOLEAN DEFAULT "false";

INSERT INTO apps ("name", "description", "interface") VALUES ("Task", "Scheduled task", "Task");

ALTER TABLE tasks ADD COLUMN engine_id INTEGER REFERENCES engines(id);
ALTER TABLE tasks ADD COLUMN model TEXT NOT NULL;

CREATE TABLE IF NOT EXISTS task_runs (
    id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    task_id         INTEGER NOT NULL,
    session_id      INTEGER NOT NULL,
    state           TEXT NOT NULL DEFAULT "Pending",
    state_reason    TEXT,
    created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(task_id) REFERENCES tasks(id),
    FOREIGN KEY(session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS tasks_mcp_servers (
    id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    task_id         INTEGER NOT NULL,
    mcp_server_id   INTEGER NOT NULL,
    FOREIGN KEY(task_id) REFERENCES tasks(id),
    FOREIGN KEY(mcp_server_id) REFERENCES mcp_servers(id)
);
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 17,
            description: "add_app_steps_triggers",
            sql: r#"
------------------------------------------------------------------------------------------------
-- View that generates a UUID on each query
------------------------------------------------------------------------------------------------

CREATE VIEW IF NOT EXISTS uuidgen AS
SELECT lower(
	hex(randomblob(4)) || '-' ||
	hex(randomblob(2)) || '-' ||
	'4' || substr(hex(randomblob(2)), 2) || '-' ||
	substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)), 2) || '-' ||
	hex(randomblob(6))
) AS uuid;

------------------------------------------------------------------------------------------------
-- Ensure every tool_call has an `id`
------------------------------------------------------------------------------------------------

UPDATE messages
SET tool_calls = json_insert(tool_calls, '$[0].id', (SELECT uuid FROM uuidgen))
WHERE json_array_length(tool_calls) > 0;

------------------------------------------------------------------------------------------------
-- Ensure every tool call response message references the tool call id
------------------------------------------------------------------------------------------------

UPDATE messages AS m
SET tool_call_id = (
    SELECT json_extract(tool_calls, '$[0].id')
    FROM messages
    WHERE messages.id = (SELECT max(id) FROM messages WHERE m.id > id)
);

------------------------------------------------------------------------------------------------
-- Ensure the database has a value for each of the previously file-based config values
------------------------------------------------------------------------------------------------

INSERT INTO config (key, value) VALUES ('welcome-agreed', true) ON CONFLICT(key) DO NOTHING;

------------------------------------------------------------------------------------------------
-- ALTER the `apps_mcp_servers` table to include ON DELETE CASCADE
------------------------------------------------------------------------------------------------

CREATE TABLE apps_mcp_servers_new (
    id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    app_id          INTEGER NOT NULL,
    mcp_server_id   INTEGER NOT NULL,

    FOREIGN KEY(app_id) REFERENCES apps(id) ON DELETE CASCADE,
    FOREIGN KEY(mcp_server_id) REFERENCES mcp_servers(id) ON DELETE CASCADE,

    UNIQUE(app_id, mcp_server_id)
);

INSERT INTO apps_mcp_servers_new (id, app_id, mcp_server_id)
SELECT id, app_id, mcp_server_id FROM apps_mcp_servers;

DROP TABLE apps_mcp_servers;
ALTER TABLE apps_mcp_servers_new RENAME TO apps_mcp_servers;

------------------------------------------------------------------------------------------------
-- ALTER the `sessions` and `messages` to include ON DELETE CASCADE
------------------------------------------------------------------------------------------------

CREATE TABLE sessions_new (
    id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    app_id          INTEGER NOT NULL,
    summary         TEXT NOT NULL DEFAULT "Untitled",
    ephemeral       BOOLEAN DEFAULT "false",
    config          JSON NOT NULL DEFAULT "{}",
    created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(app_id) REFERENCES apps(id) ON DELETE CASCADE
);

CREATE TABLE messages_new (
    id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    session_id      INTEGER NOT NULL,
    engine_id       INTEGER,
    tool_call_id    TEXT,
    model           TEXT NOT NULL,
    role            TEXT NOT NULL,
    content         TEXT NOT NULL,
    thought         TEXT,
    name            TEXT,
    tool_calls      JSON NOT NULL DEFAULT "[]",
    created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(session_id) REFERENCES sessions_new(id) ON DELETE CASCADE
);

CREATE TABLE task_runs_new (
    id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    task_id         INTEGER NOT NULL,
    session_id      INTEGER NOT NULL,
    state           TEXT NOT NULL DEFAULT "Pending",
    state_reason    TEXT,
    created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY(session_id) REFERENCES sessions_new(id) ON DELETE CASCADE
);

INSERT INTO sessions_new (id, app_id, summary, ephemeral, config, created, modified)
SELECT id, app_id, summary, ephemeral, config, created, modified FROM sessions;

INSERT INTO messages_new (id, session_id, tool_call_id, model, role, content, thought, name, tool_calls, created, modified)
SELECT id, session_id, tool_call_id, model, role, content, thought, name, tool_calls, created, modified FROM messages;

INSERT INTO task_runs_new (id, task_id, session_id, state, state_reason, created)
SELECT id, task_id, session_id, state, state_reason, created FROM task_runs;

DROP TABLE task_runs;
ALTER TABLE task_runs_new RENAME TO task_runs;

DROP TABLE messages;
ALTER TABLE messages_new RENAME TO messages;

DROP TABLE sessions;
ALTER TABLE sessions_new RENAME TO sessions;

------------------------------------------------------------------------------------------------
-- New columns/tables to support Apps
------------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS app_steps (
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    app_id      INTEGER NOT NULL,
    engine_id   INTEGER NOT NULL,
    model       TEXT NOT NULL,
    prompt      TEXT NOT NULL,

    FOREIGN KEY(app_id) REFERENCES apps(id) ON DELETE CASCADE,
    FOREIGN KEY(engine_id) REFERENCES engines(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_runs (
    id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    app_id          INTEGER NOT NULL,
    session_id      INTEGER NOT NULL,
    state           TEXT NOT NULL DEFAULT "Pending",
    state_reason    TEXT,
    created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(app_id) REFERENCES apps(id) ON DELETE CASCADE,
    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS triggers (
    id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    app_id      INTEGER NOT NULL,
    event       TEXT NOT NULL,
    action      TEXT NOT NULL,
    config      JSON NOT NULL DEFAULT "{}",

    FOREIGN KEY(app_id) REFERENCES apps(id) ON DELETE CASCADE
);

ALTER TABLE tasks ADD COLUMN app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE;

INSERT INTO apps (name, interface) SELECT name, "Task" FROM tasks;
UPDATE tasks SET app_id = (SELECT id FROM apps WHERE apps.name = tasks.name);

INSERT INTO app_steps (app_id, engine_id, model, prompt)
SELECT app_id, engine_id, model, prompt FROM tasks;

INSERT INTO apps_mcp_servers (app_id, mcp_server_id)
SELECT tasks.app_id, tasks_mcp_servers.mcp_server_id FROM tasks_mcp_servers JOIN tasks ON tasks.id = tasks_mcp_servers.task_id;

INSERT INTO app_runs (app_id, session_id, state, state_reason, created)
SELECT tasks.app_id, task_runs.session_id, task_runs.state, task_runs.state_reason, task_runs.created FROM task_runs JOIN tasks ON tasks.id = task_runs.task_id;

INSERT INTO triggers (app_id, event, action, config)
SELECT app_id, "scheduled", "tick", json_object('period', period) FROM tasks;

DROP TABLE tasks_mcp_servers;
DROP TABLE task_runs;

ALTER TABLE tasks DROP COLUMN prompt;
ALTER TABLE tasks DROP COLUMN period;
ALTER TABLE tasks DROP COLUMN next_run;
ALTER TABLE tasks DROP COLUMN engine_id;
ALTER TABLE tasks DROP COLUMN model;
            "#,
            kind: MigrationKind::Up,
        },
        Migration {
            version: 18,
            description: "add_relays",
            sql: r#"
------------------------------------------------------------------------------------------------
-- New table, cols, & rows to support Relays
------------------------------------------------------------------------------------------------

INSERT INTO apps ("name", "description", "interface") VALUES ("Relay", "Relay", "Chat");

ALTER TABLE sessions ADD COLUMN relay BOOLEAN DEFAULT "false";

CREATE TABLE IF NOT EXISTS relays (
    id              INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    session_id      INTEGER,
    name            TEXT,
    config          JSON NOT NULL DEFAULT "{}",
    created         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
            "#,
            kind: MigrationKind::Up,
        },
    ]
}
