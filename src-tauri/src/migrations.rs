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
    options     JSON NOT NULL DEFAULT "{}",
    UNIQUE(type)
);

INSERT INTO engines ("name", "type", "options") VALUES
(
    "Ollama",
    "ollama",
    json_object('url', (SELECT json_extract(value, '$') FROM settings WHERE key = 'ollama-url'))
),
(
    "OpenAI",
    "openai",
    json_object('apiKey', (SELECT json_extract(value, '$') FROM settings WHERE key = 'openai-api-key'))
),
(
    "Gemini",
    "gemini",
    json_object('apiKey', (SELECT json_extract(value, '$') FROM settings WHERE key = 'gemini-api-key'))
);
            "#,
            kind: MigrationKind::Up,
        },
    ]
}
