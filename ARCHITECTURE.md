<img src="static/images/repo-header.png" alt="Tome" />

# Contributing to Tome

This document is a high level explanation of the architecture and codebase. It
won't cover everything right now, but will evolve and expand over time.

# Architecture

Tome is a [Tauri](https://v2.tauri.app/) app – which means the system/desktop
side is written in Rust, while the front-end is a static Typescript application.
Specifically, a SvelteKit application.

## Frontend

The core of the domain logic lives in the frontend. It's a statically generated
SvelteKit application. It's a little different than one you'd build for the web,
since we're in a singleton environment inside of a Tauri application. This
mostly affects our data layer, which the [Models](#models) section goes more
into.

At a glance:

- SvelteKit written in Typescript, built with Vite.
- Tailwind for CSS

**COMPONENTS** are isolated UI elements. They shouldn't hold any domain logic
and should, but in some cases may update models directly.

**ROUTES**
are "pages" or "screens". These should handle most of the orchestration
logic. With [global reactivity](#global-reactivity) (described below) there
really isn't a need for the Page Load functions you'd normally use in Svelte. In
rare occasions you may need to run an async function on page load – this is when
a `+page.ts` could be handy.

**LIB**
If it's not orchestration logic, and it's not a UI component, it lives in
`lib`. This is where most of the supporting domain logic resides.

### Database

For all intents and purposes, the database and models are managed in the frontend.
It's done via a Tauri plugin called `tauri-plugin-sql`. Technically, the plugin
just creates a bridge between the frontend and backend through Tauri's `invoke`
mechanism. So while the queries are technically being made via Sqlx in Rust, as
a developer, it's all done via our Typescript models.

### Models

Models are a bit strange in this application, due to Svelte's reactivity
rules. Models are classes with _ONLY_ `static` functions. Svelte's reactivity
doesn't support class instances so we need to always be passing around plain-old
JS objects (which do work with reactivity).

> [!IMPORTANT]
> Because of this, every model function needs to accept the object as it's first
> argument.

```ts
static async function name(session: ISession): string {
    return session.other.thing.complicated.path.name;
}
```

You can change, reassign, etc. the `session` in this example and Svelte will
handle state and reactivity appropriately since we're always working with plain
objects. This enabled the [global reactivity](#global-reactivity) explained below.

### Model Interfaces

Declaration merging with classes in Typescript is annoying if all you want is
a plain JS object in the end (ie. _not_ the functions, etc.).

Instead, we create an `I<model>` interface for each model. This is the interface
we use throughout the application. So the `Session` model has an accompanying
`ISession` interface, for example.

### Global Reactivity

Each model has an underlying `repo`, which is a Svelte `$state()` object,
meaning it, and its contents, are deeply reactive.

The base model logic handles updating the objects within and keeps them up to
date with persisted database changes. When the app loads, we sync all models
with their database table, then when you create, update, or delete, a record
from the database, we replicate the operation in the `repo`.

What this allows us to do is derive our model "instances" in routes and
components, from a reactive set of objects that will update in real-time, when
changes to them are persisted. The UI will automatically update since we're
always working with the same set of reactive objects.

You don't need to manage state manually. Just update a model like you're
updating a database record and the UI will react appropriately.

> [!IMPORTANT] > _ALWAYS_ work with models via `const model = $derived(Model.all())` and _NEVER_ `$state()`.

The beauty of working with a singleton static application is that you can have
top-level objects like `repo` to track things and not have to worry about
isolation between requests, users, etc.

## Backend

The backend is a Tauri application written in Rust. It's mostly responsible for
anything we can't do from the frontend. For example, process management, MCP
server communication, etc. It's a relatively thin layer, but is the backbone of
everything in Tome.

At a glance:

- Tauri application written in Rust
- Database connectivity via `tauri-plugin-sql`

### Commands

We use commands like you would controllers in an MVC web framework. They're the
entry point for the frontend to accomplish something only the backend can do.
With that, they should be extremely concise. Often, if not always, calling a
single function in another module where the logic actually lives

### npx/uvx

Tome uses a project from the CashApp folks, called [Hermit](https://github.com/cashapp/hermit),
which "manages isolated, self-bootstrapping sets of tools in software projects."

`uvx` and `npx` are two pass-through scripts bundled with the app. Each one
first checks if we've previously installed the corresponding command and if not,
uses Hermit to do so, then runs the original command.

This is how we run MCP servers.

## Deep Links

Tome supports deep links in the form of `tome://*`. Below is a list of links
supported and their associated payloads.

### Install MCP Server

To trigger an MCP Server installation, navigate a user to the following URL:

```
tome://install-mcp-server?payload=<payload>
```

MCP server installation requires static args and ENV vars, for now. There is no
way to allow the user to configure a server, yet. This means you need to collect
those configuration properties from the user before making the request to Tome.

#### `payload`

The `payload` query param must be a URL encoded object that conforms to the
following shape.

> [!NOTE]
> All keys, and all values, must be `string`.

```json
{
	"version": "1",
	"command": "uvx|npx",
	"args": ["mcp-server-thing", "--flag", "flag-value"],
	"env": {
		"VAR_NAME": "VAR_VALUE"
	}
}
```

##### `version`

The only valid `version`, for now, is `"1"`. If we ever make backwards
incompatible changes to how Deep Links work, we'll increment this version.

##### `command`

Tome supports `npx` or `uvx` based MCP servers for now. `command` must be one of
these two options.

##### `args`

An array of strings, passed to the CLI command as args.

##### `env`

A key-value object used as ENV vars when starting up the server.
