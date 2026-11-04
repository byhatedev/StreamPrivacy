# StreamPrivacy

A lightweight [EquiCord](https://github.com/Equicord/Equicord) plugin for hiding selected Discord DMs during screen-sharing.

## Features

- **DM Selection** — Right-click a DM to protect or unprotect it.
- **Sidebar Blur** — Blur selected users in the DM sidebar.
- **Privacy Mode** — Manually toggle protection.
- **Persistent Storage** — Protected DMs remain saved between sessions.

## Installation

1. Clone the repository into `Equicord/src/userplugins/streamPrivacy`.
2. Build EquiCord using `pnpm build`.
3. Restart Discord and enable **StreamPrivacy**.

## Planned

- Blur protected DM conversations and attachments.
- Automatic screen-share detection.
- Viewer-only masking without affecting the local Discord interface.
- Window and monitor capture support.

## Status

**Work in progress.** Only sidebar masking is currently implemented. The blur is visible locally and is not exclusive to screen-share viewers.

## License

See the LICENSE file
