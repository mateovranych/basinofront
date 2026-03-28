# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server → http://localhost:4200
npm run build      # Production build → dist/
npm run watch      # Watch mode build (dev config)
npm test           # Run unit tests (Karma + Jasmine)
```

To run a single test file, use:
```bash
npx ng test --include='**/some-component.spec.ts'
```

## Tech Stack

- **Angular 20** with standalone components, lazy loading, functional APIs
- **Angular Material 20** + CDK for UI
- **RxJS 7** — all async is Observable-based
- **SignalR** (`@microsoft/signalr`) for real-time backend events
- **SweetAlert2** for alerts/confirms
- **JWT Decode** for parsing auth tokens client-side

Backend: .NET Kestrel at `https://localhost:7004/api` (same URL for dev and prod, set in `src/environments/`).

## Architecture

### Routing & Role-Based Access

Three top-level protected route groups, each with a layout shell:

| Path | Role | Layout |
|---|---|---|
| `/admin` | Admin | `AdminLayoutComponent` |
| `/operador` | Operador, Admin | `OperadorLayoutComponent` |
| `/consulta` | Consulta, Operador, Admin | (shared) |

Routes use `loadComponent()` / `loadChildren()` for lazy loading. Role enforcement is in `src/app/auth/auth.guard.ts` — it decodes the JWT `rol` claim and redirects accordingly.

### Authentication

- Login → JWT stored in `localStorage`
- `src/app/interceptors/auth.interceptor.ts` injects `Authorization: Bearer {token}` on every request and sets `withCredentials: true`
- On 401, the interceptor calls `/Auth/refresh` (uses httpOnly cookie) to silently refresh the token; auto-logout on failure

### Services (`src/app/services/`)

~35 services. Each wraps a backend resource with typed `Observable<T>` methods:
- `obtenerItems()` / `obtenerPorId(id)` — GET list / by ID
- `crear()` / `editar()` / `eliminar()` — POST / PUT / DELETE
- `exportarPDF()` / `exportarExcel()` — blob downloads

### Real-Time (SignalR)

`src/app/services/signal-rservice.ts` connects to `/hub/bassino`. Components subscribe via `listen(evento, callback)`. Auto-reconnect is enabled.

### Interfaces (`src/app/interfaces/`)

All DTO types live here. Subdirectories for complex domains: `CuentaCorriente/`, `Factura/`, `Items/`, `Presupuesto/`, `Recibos/`.

### Component Pattern

All components are **standalone**. Each imports its own Angular Material modules, `CommonModule`, `ReactiveFormsModule`, etc. CRUD features open Material dialogs for create/edit forms. PDF downloads use the shared `src/app/dialogs/pdf-viewer-dialog/` component.

### Styling

Global: `src/styles.scss`. Material theme: `src/bassino-theme.scss`. Per-component SCSS files inline. No utility framework (no Tailwind/Bootstrap).
