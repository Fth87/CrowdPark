# CrowdPark Design System

The supplied Figma file is the visual source of truth. This document records its reusable decisions without changing the visual direction.

## Foundations

- Font: SF Pro Display / SF Pro Text, followed by the native Apple and system sans-serif stack.
- Brand: `#FFAC47`; strong brand text: `#EB9E34`.
- Ink: `#1C1B1F`; muted text: `#9C9C9C`.
- Neutral surfaces: `#F4F4F4`, `#F1F4FA`, and line color `#ECEEF2`.
- Success: `#059669`; route metrics use the blue shown in Figma.
- Cards use 28px radii, controls use 22px radii, and compact chips are fully rounded.
- Elevation is `0 4px 12px rgb(0 0 0 / 4%)`. The highlighted AI action uses an orange shadow.
- Text commonly uses `-0.04em` tracking to match the Figma SF Pro settings.

Tokens live in `src/app.css` through Tailwind v4 `@theme`, so utilities and CSS variables share one source.

## Components

The implementation uses local shadcn-svelte primitives under `src/lib/components/ui`. CrowdPark
components compose those primitives and keep product-specific layout and content in the feature layer.

- `Button`: navigation, actions, icon buttons, and product `dark`/`success` variants.
- `Card`, `Badge`, `Avatar`, and `Separator`: surfaces, statuses, identity, and content grouping.
- `InputGroup` and `Field`: search and account forms with labels and descriptions.
- `ToggleGroup` and `RadioGroup`: vehicle-type and saved-vehicle selection.
- `Alert` and `Drawer`: AI guidance and the mobile parking-detail sheet.

- `AppChrome`: 64px desktop header, desktop status footer, and 358×77 mobile navigation.
- `MobileHeader`: 78px mobile identity/title region.
- `SearchControls`: 56px destination field with a separate circular filter action.
- `VehicleToggle`: two equal segments; orange indicates the active vehicle.
- `ParkingCard`: shared ranked and saved parking summary.
- `ParkingDetails`: insight, metrics, actions, facilities, confidence, and reviews.
- `MapCanvas`: reusable Leaflet/OpenStreetMap map for current location and parking availability.

The OpenStreetMap tile URL defaults to the official standard endpoint and can be changed through
`PUBLIC_OSM_TILE_URL`. Attribution remains visible inside every map instance.

## Responsive behavior

- Mobile reference width is 390px with 16px side padding.
- Desktop reference is 1280×832. Navigation moves to the top and map flows use a 438px information rail.
- At `md` and above, list pages use bounded columns while map pages retain the fixed rail.

## User-flow mapping

- Home search and **Find Parking Spot** open `/maps?spot=1` for the AI fast path.
- The Maps tab opens `/maps` for manual exploration; selecting the marker opens the overview.
- AI starts empty and reveals ranked recommendations after a destination is entered.
- Saved, Profile, Manage Vehicle, Reset Password, and full parking detail use dedicated routes.

## Asset provenance

Files under `static/images/crowdpark` were downloaded from the supplied Figma document on 2026-09-09. They preserve the source map, profile image, markers, and navigation icons.
