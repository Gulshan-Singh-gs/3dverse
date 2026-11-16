# The Nocturne Study

An interactive 3D reconstruction of a cyber-antique executive study. Explore the room in the browser, inspect its documented objects and materials, and export the reconstruction dataset.

> **Reconstruction note:** Dimensions and camera fields of view are estimates. This is an interpretive model based on the supplied spatial inventory, not a surveyed or photogrammetric model. The reference photographs themselves were not included with the project.

## What you can do

- Explore the room in **orbit** mode or move through it in **walk** mode.
- Switch between camera presets and the four documented reference viewpoints.
- Change the rendering style between vector and pixel treatments, adjust zoom, and toggle quality.
- Select objects in the scene or object index to inspect their estimated dimensions, position, material, confidence, and evidence viewpoints.
- Review the room's declared uncertainties and reconstruction assumptions.
- Download the room, item, material, camera, reference, and assumption data as JSON.

### Controls

| Mode | Controls |
| --- | --- |
| Orbit | Drag to orbit; scroll or pinch to zoom; click an object to inspect; keys `1`–`6` select presets. |
| Walk | Drag to look; use `W`/`A`/`S`/`D` or the arrow keys to move; hold `Shift` to stride; press `F` to exit. |

The on-screen controls also provide mode, preset, style, zoom, and quality options.

## Run locally

### Requirements

- Node.js with npm
- A browser with WebGL support for the interactive 3D scene

### Install and start

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The development server is configured to listen on all interfaces.

### Production build

```bash
npm run build
npm run preview
```

`npm run build` runs the TypeScript project build and then creates the Vite production bundle. `npm run preview` serves that bundle locally.

## Reference images

The interface can display reference photographs from `public/references/`. Add the source images there using the filenames expected by the app: each reference ID, lowercased, with a `.jpg` extension (for example, `view-a.jpg` if the reference ID is `VIEW-A`). Without those files, the model and camera viewpoints remain available; image thumbnails are simply hidden.

## Project structure

```text
.
├── index.html             # Page metadata and app entry point
├── src/
│   ├── App.tsx             # UI, controls, object index, and data export
│   ├── main.tsx            # React entry point
│   ├── styles.css          # Application styles
│   ├── data/               # Room, object, material, camera, and reference data
│   └── engine/             # Three.js scene and interaction engine
├── package.json
└── vite.config.ts
```

## Built with

- React 19 and TypeScript
- Three.js
- Vite

## Data export

Choose **Download dataset** in the project interface to save `nocturne-study-reconstruction.json`. The export includes the room definition, inventory items, materials, camera presets, reference viewpoints, and declared assumptions.

## Limitations

- Room dimensions, object measurements, confidence values, and camera fields of view are estimates.
- Reference photographs are not bundled; add them separately as described above.
- Rendering requires browser WebGL support. If WebGL initialization fails, the page still provides the reconstruction data and project information.

## License

No license is currently specified. Unless a license is added to this repository, reuse and redistribution are not granted by default.
