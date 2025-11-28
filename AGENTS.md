# AGENTS.md - AI Agent Context for 3D Voronoi Honeycomb Visualization

## Project Overview

This is an **interactive 3D visualization** demonstrating the mathematical relationship between **Voronoi tessellation** and **natural honeycomb structures**. It shows how hexagonal honeycomb patterns emerge naturally when seed points are arranged in hexagonally-packed layers.

**Core Purpose**: Educational tool explaining why bees build hexagonal cells — the answer lies in Voronoi geometry applied to optimally-packed points.

## Tech Stack

- **Three.js** (v0.160.0) — 3D rendering via CDN import maps
- **Vanilla JavaScript ES Modules** — No bundler, no npm, no build step
- **Pure HTML/CSS** — Single-page application
- **Algorithm**: Custom 3D Voronoi using plane-cutting (similar to Voro++ library)

## Running the Project

```bash
# Serve with any static server (ES modules require a server)
npx serve .                    # Port 3000
python -m http.server 8080     # Port 8080
```

Open `http://localhost:PORT` in browser. No build step required.

## Architecture

```
├── index.html          # Entry point, UI structure, import maps
├── styles.css          # Honeycomb-themed styling (amber/gold palette)
└── src/
    ├── main.js         # App initialization, Three.js scene, state management
    ├── voronoi3d.js    # Core algorithm: 3D Voronoi via plane-cutting
    ├── hexGrid.js      # Hexagonal lattice point generation (ABAB stacking)
    ├── cellRenderer.js # Three.js mesh creation for cells and points
    └── ui.js           # DOM event handlers, sliders, toggles
```

## Module Responsibilities

### `main.js` — Application Core
- **State object**: `{ gridSize, layerSpacing, showPoints, showCells, isRandomMode, points, voronoiCells }`
- Creates Three.js scene with OrbitControls (auto-rotate enabled)
- Exports control functions: `togglePoints()`, `toggleCells()`, `setGridSize()`, `setLayerSpacing()`, `setRandomMode()`, `resetToHoneycomb()`
- Handles generation pipeline: points → Voronoi cells → meshes

### `voronoi3d.js` — Voronoi Algorithm
- **`computeVoronoiCells(seeds, bounds, padding)`** — Main entry point
- Implements plane-cutting algorithm:
  1. Initialize each cell as a bounding box
  2. For each seed, cut with perpendicular bisector planes to all neighbors
  3. Resulting convex polyhedra are Voronoi cells
- Classes: `Vec3`, `Plane`, `ConvexPolyhedron`
- **`cellToMeshData(cell)`** — Converts polyhedron to Three.js-compatible format

### `hexGrid.js` — Point Generation
- **`generateHoneycombPoints(gridSize, spacing, layerSpacingFactor)`**
- Creates two hexagonal layers with ABAB stacking (like real honeycomb)
- Layer B is offset to sit above centroids of Layer A triangles
- Returns points array with `{ x, y, z, layer: 'A'|'B', id }` and bounding box

### `cellRenderer.js` — Three.js Rendering
- **`createCellMesh(meshData, options)`** — Creates cell with fill + wireframe
- **`createPointsGroup(points, options)`** — Spheres with glow sprites
- **`createVoronoiCellsGroup(cells, converter, options)`** — Batch cell creation
- Color palette: Amber/gold honeycomb theme (`COLORS` and `CELL_COLOR_PALETTE`)

### `ui.js` — User Interface
- Toggle buttons for points/cells visibility
- Mode buttons: Honeycomb vs Random point distribution
- Sliders: Grid size (2-8), Layer spacing (0.5-2.0)
- Keyboard shortcuts: P (points), C (cells), B (both), H (help)
- Toast notification system

## Key Concepts for AI Agents

### Voronoi Tessellation
- Each Voronoi cell contains all points closer to its seed than any other seed
- For honeycomb-arranged seeds, cells naturally become hexagonal prisms
- The algorithm uses **perpendicular bisector planes** between seed pairs

### Honeycomb Geometry
- Real honeycomb has ABAB hexagonal close-packing (HCP)
- Optimal layer height: `spacing × √(2/3) ≈ 0.816 × spacing`
- B layer offset: `(spacing/2, spacing×√3/6)` relative to A layer

### ConvexPolyhedron Operations
- `cutWithPlane(plane)` — Core operation; keeps negative half-space
- Handles vertex classification (inside/outside/on plane)
- Creates cap faces at cut intersections

## Common Modification Tasks

### Adding a New Control
1. Add HTML element in `index.html` inside `.controls`
2. Add handler in `ui.js` → call appropriate `api.*` function
3. Add state property in `main.js` and export control function

### Changing Visual Appearance
- Edit `styles.css` for UI panel styling
- Edit `cellRenderer.js` `COLORS` / `CELL_COLOR_PALETTE` for 3D colors
- Cell opacity: `fillOpacity` parameter in `createVoronoiCellsGroup`

### Adding New Point Distribution Mode
1. Create generator function in `hexGrid.js` or `main.js`
2. Add mode button in HTML
3. Wire up in `ui.js` → `setupModeButtons()`
4. Call in `generateVisualization()` based on state

### Modifying Voronoi Algorithm
- `voronoi3d.js` is self-contained
- `EPSILON` constant for numerical precision (currently `1e-10`)
- Early termination optimizations exist in `computeVoronoiCells`

## State Flow

```
User Action → ui.js handler → main.js API → regenerate → Three.js update
                                   ↓
                            state mutation
                                   ↓
                     generateVisualization()
                            ↓         ↓
                    hexGrid.js    voronoi3d.js
                            ↓         ↓
                       cellRenderer.js
                              ↓
                        scene.add(meshes)
```

## Known Behaviors

- **Auto-rotate**: Scene rotates slowly; stops when user interacts
- **Loading overlay**: Shows during heavy computation (>50ms timeout)
- **Performance**: Grid size 8×8 = 128 points = 128 cells (manageable)
- **No persistence**: State resets on page reload

## Design Aesthetic

The UI follows a **honeycomb amber theme**:
- Background: Dark browns (`#0c0a09`, `#1c1917`)
- Accents: Amber gradients (`#fbbf24`, `#f59e0b`, `#fcd34d`)
- Font: Outfit (Google Fonts)
- Glassmorphism panel with backdrop blur

## Dependencies (CDN-loaded)

```
three@0.160.0          — Core library
three/addons/OrbitControls — Camera controls
Google Fonts: Outfit   — Typography
```

## Testing Manually

1. Toggle seed points on/off
2. Toggle Voronoi cells on/off
3. Switch between Honeycomb and Random modes
4. Adjust grid size slider (watch cell count change)
5. Adjust layer spacing (affects cell shape)
6. Verify camera controls: drag to rotate, scroll to zoom, right-drag to pan

## Potential Improvements (Context for Agents)

- Add cell count/volume statistics display
- Export cells as mesh files (OBJ, STL)
- Add cell selection/highlighting on hover
- Animate between honeycomb and random modes
- Add more point distribution patterns (BCC, FCC, etc.)
- Performance optimization for larger grids (spatial indexing)

