# Photo cropper for Auto-Stock-Manager's vehicle photo uploads

## Why

The public website (Hamro-GNG-Auto) displays vehicle photos in a fixed 4:3
box. Right now that box crops with `object-cover`, which blindly cuts
whatever doesn't fit — often chopping off wheels, mirrors, or the bike
itself when the source photo isn't already 4:3. The fix belongs at the
source: when a photo is uploaded into inventory here in Auto-Stock-Manager,
staff should be able to centre the bike/scooter in a 4:3 frame themselves,
so what gets stored is already correctly framed.

This does **not** touch the Hamro-GNG-Auto website repo — that's already
handled separately. This is purely for Auto-Stock-Manager's own two photo
upload surfaces.

## Where this applies

Two upload surfaces in `frontend/src/pages/`, both plain React 19 +
Tailwind (no component library):

1. **`AddVehicleModal.jsx`** (lines ~175-253) — the "Add Vehicle" form.
   Photos are staged client-side (`{file, previewUrl}`) and only actually
   uploaded when the whole vehicle form is submitted.
2. **`VehicleDetail.jsx`** (component `VehicleDetailModal`, upload logic at
   ~lines 200-228, UI at ~lines 661-721) — the vehicle detail/edit view.
   Photos here upload immediately per-file (optimistic preview swapped for
   the server copy on success), with drag-and-drop support.

Both use a plain `<input type="file" multiple accept="image/*">`, and both
render a preview grid at `aspect-square` today (see "Loose ends" below —
switch this to `aspect-[4/3]` once every photo is guaranteed 4:3).

Backend (`backend/server.py`) already does its own server-side resize/JPEG
recompression on `POST /vehicles/{id}/photos` (max 1600px longest side,
≤2MB) — none of that needs to change. This crop step runs client-side,
*before* the (now-cropped) file is handed to the exact same upload code
that already exists.

No cropping library is installed in `frontend/package.json` — you'll need
to add one.

## Approach

Intercept file selection before the existing staging/upload logic runs.
Show a modal with a 4:3 crop frame (drag to reposition, slider to zoom).
On confirm, draw the chosen crop region onto a canvas, produce a JPEG
`File`, and hand that `File` into the *exact same* function that already
staged/uploaded the original file — so nothing else about either page
needs to change.

Both surfaces share one small hook (`usePhotoCropQueue`) that processes
multi-file selections one at a time through the crop dialog, so multi-select
still works even though only one photo can be cropped on screen at once.

### 1. Install the cropper library

```bash
cd frontend
yarn add react-easy-crop
```

Use `yarn`, not `npm` — this repo's lockfile is `yarn.lock`. (Confirmed:
running plain `npm install` here rewrites large parts of `yarn.lock` and
also creates a stray `package-lock.json` — don't let that happen. Note also
that on this environment even a clean `yarn install` with zero dependency
changes churns a few hundred lines of `yarn.lock` — that's pre-existing
lockfile drift unrelated to this change, not something to chase down here.)

### 2. New file: `frontend/src/components/PhotoCropperModal.jsx`

```jsx
/**
 * PhotoCropperModal.jsx — lets staff centre a vehicle photo in a fixed 4:3
 * frame before it's added to a listing, instead of relying on the storefront's
 * blind object-fit crop.
 */
import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { ZoomIn } from "lucide-react";

/** Draws the cropped region onto a canvas and returns it as a JPEG File. */
export async function getCroppedFile(imageSrc, cropPixels, fileName, maxDimension = 1600, quality = 0.9) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for cropping"));
    img.src = imageSrc;
  });

  let width = cropPixels.width;
  let height = cropPixels.height;
  if (width > maxDimension) {
    height = (maxDimension / width) * height;
    width = maxDimension;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error("Failed to create cropped image")); return; }
        resolve(new File([blob], fileName.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      quality
    );
  });
}

export function PhotoCropperModal({ imageSrc, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((_area, pixels) => setCroppedAreaPixels(pixels), []);

  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily: "Manrope, sans-serif" }}>
            Position the vehicle in frame
          </h3>
          <button type="button" onClick={onCancel} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">✕</button>
        </div>

        <div className="relative w-full aspect-[4/3] bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="p-4 pb-2 space-y-2">
          <div className="flex items-center gap-3">
            <ZoomIn size={16} className="text-slate-400 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
          <p className="text-[11px] text-slate-400 text-center">Drag to reposition &middot; use the slider to zoom</p>
        </div>

        <div className="flex gap-3 p-4 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-11 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!croppedAreaPixels}
            onClick={() => croppedAreaPixels && onConfirm(croppedAreaPixels)}
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
          >
            Use this photo
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3. New file: `frontend/src/hooks/usePhotoCropQueue.js`

```js
import { useRef, useState } from "react";
import { getCroppedFile } from "../components/PhotoCropperModal";

/**
 * Feeds picked/dropped files through the crop dialog one at a time before
 * handing each cropped result to `onCropped`. Shared by the Add Vehicle
 * modal (which stages files) and the vehicle detail page (which uploads
 * immediately) so both go through the same 4:3 framing step.
 */
export function usePhotoCropQueue(onCropped) {
  const [queue, setQueue] = useState([]);
  const [activeSrc, setActiveSrc] = useState(null);
  const activeFileRef = useRef(null);
  const objectUrlRef = useRef(null);

  const cleanupActiveUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const processNext = (files) => {
    if (files.length === 0) return;
    const [next, ...rest] = files;
    setQueue(rest);
    const url = URL.createObjectURL(next);
    objectUrlRef.current = url;
    activeFileRef.current = next;
    setActiveSrc(url);
  };

  const enqueueFiles = (fileList) => {
    const files = Array.from(fileList);
    processNext(files);
  };

  const cancelActive = () => {
    cleanupActiveUrl();
    setActiveSrc(null);
    activeFileRef.current = null;
    processNext(queue);
  };

  const confirmActive = async (croppedAreaPixels) => {
    const file = activeFileRef.current;
    const src = activeSrc;
    if (!file || !src) return;
    try {
      const croppedFile = await getCroppedFile(src, croppedAreaPixels, file.name);
      onCropped(croppedFile);
    } finally {
      cleanupActiveUrl();
      setActiveSrc(null);
      activeFileRef.current = null;
      processNext(queue);
    }
  };

  return { activeSrc, enqueueFiles, cancelActive, confirmActive };
}
```

### 4. Wire into `AddVehicleModal.jsx`

Add imports:

```jsx
import { PhotoCropperModal } from "../components/PhotoCropperModal";
import { usePhotoCropQueue } from "../hooks/usePhotoCropQueue";
```

Replace the existing `addPhotos` function:

```jsx
// before
const addPhotos = (files) => {
  const staged = Array.from(files).map(file => ({ file, previewUrl: URL.createObjectURL(file) }));
  setPhotos(prev => [...prev, ...staged]);
};

// after
const stageCroppedPhoto = (file) => {
  setPhotos(prev => [...prev, { file, previewUrl: URL.createObjectURL(file) }]);
};
const { activeSrc, enqueueFiles, cancelActive, confirmActive } = usePhotoCropQueue(stageCroppedPhoto);
```

In the file input's `onChange`, swap `addPhotos` for `enqueueFiles`:

```jsx
onChange={e => { if (e.target.files.length) enqueueFiles(e.target.files); e.target.value = ""; }}
```

Change the preview thumbnail's aspect ratio from `aspect-square` to
`aspect-[4/3]` (every stored photo is 4:3 now, so the preview should match):

```jsx
<div key={idx} className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100">
```

Render the modal once, near the existing `previewPhoto` lightbox at the
bottom of the component:

```jsx
<PhotoCropperModal imageSrc={activeSrc} onCancel={cancelActive} onConfirm={confirmActive} />
```

### 5. Wire into `VehicleDetail.jsx` (`VehicleDetailModal`)

Add the same two imports as above.

Replace the existing `uploadPhotos` function — the per-file upload logic
itself is unchanged, it's just extracted to take one already-cropped `File`
instead of looping over a raw `FileList`:

```jsx
// before
const uploadPhotos = (files) => {
  const fileList = Array.from(files);
  if (fileList.length === 0) return;
  fileList.forEach(file => {
    const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const previewUrl = URL.createObjectURL(file);
    setPhotos(prev => [...prev, { id: tempId, url: previewUrl, pending: true }]);

    const fd = new FormData(); fd.append("file", file);
    api.post(`/vehicles/${id}/photos`, fd, { headers: { "Content-Type": "multipart/form-data" } })
      .then(r => setPhotos(prev => prev.map(p => (p.id === tempId ? r.data : p))))
      .catch(err => {
        setPhotos(prev => prev.filter(p => p.id !== tempId));
        toast.error(describeUploadError(err));
      })
      .finally(() => URL.revokeObjectURL(previewUrl));
  });
};

// after
const uploadCroppedPhoto = (file) => {
  const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const previewUrl = URL.createObjectURL(file);
  setPhotos(prev => [...prev, { id: tempId, url: previewUrl, pending: true }]);

  const fd = new FormData(); fd.append("file", file);
  api.post(`/vehicles/${id}/photos`, fd, { headers: { "Content-Type": "multipart/form-data" } })
    .then(r => setPhotos(prev => prev.map(p => (p.id === tempId ? r.data : p))))
    .catch(err => {
      setPhotos(prev => prev.filter(p => p.id !== tempId));
      toast.error(describeUploadError(err));
    })
    .finally(() => URL.revokeObjectURL(previewUrl));
};
// Every picked/dropped file is routed through the crop dialog (one at a time)
// before it reaches uploadCroppedPhoto, so staff centre the bike in a 4:3
// frame instead of the storefront silently object-fit cropping it later.
const { activeSrc: activeCropSrc, enqueueFiles: uploadPhotos, cancelActive: cancelCrop, confirmActive: confirmCrop } = usePhotoCropQueue(uploadCroppedPhoto);
```

Note the destructured hook return is aliased back to the name `uploadPhotos`
— every existing call site (`onPhotoDrop`, both file inputs at ~lines 677
and 718) already calls `uploadPhotos(files)` and needs **no further edits**.

Change both `aspect-square` occurrences in the photo grid/dropzone (not the
legal-documents grid further down — leave those alone) to `aspect-[4/3]`:

```jsx
<div key={photo.id} className="relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-100" data-testid="vehicle-photo">
...
className={`border-2 border-dashed rounded-xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer transition-colors ${...}`}
```

Render the modal near the existing `previewPhoto` lightbox:

```jsx
<PhotoCropperModal imageSrc={activeCropSrc} onCancel={cancelCrop} onConfirm={confirmCrop} />
```

## Verification already done

- `yarn add react-easy-crop` installs cleanly (confirm the lockfile diff is
  small and scoped to that one package + its one transitive dep,
  `normalize-wheel`).
- `CI=true npx craco build` compiles the whole app successfully with all of
  the above in place — no missing imports, no prop mismatches.
- `yarn start` boots with zero console/runtime errors.
- Logging in against the live backend and opening the Add Vehicle modal's
  photo picker was **not** done from this environment, because this repo's
  `frontend/package.json` dev proxy points at the live production backend
  (`https://autostock.203-134-250-70.sslip.io`) — actually submitting a
  vehicle or confirming an upload there would create real data in the live
  system. Do that first real click-through yourselves once this is wired
  in your own dev setup.

## Loose ends / judgment calls made

- **Zoom control is a plain `<input type="range">`**, not a styled slider —
  this codebase has no Radix/shadcn-style slider component, and the rest of
  the UI is plain native form elements (see the `inp`/`sel` helpers in
  `VehicleModals.jsx`), so a native range input matches the existing style
  better than pulling in another dependency.
- **Output size**: cropped photos are capped at 1600px on the long edge,
  JPEG quality 0.9. That's deliberately close to what the backend's own
  `_compress_photo` already re-encodes to (max 1600px, quality stepping
  down from 80) — the client-side crop doesn't need to out-compress the
  server, it just needs to hand over the *correct region* of the image.
- **Legal documents' photo grids** (further down in `VehicleDetail.jsx`,
  `data-testid="uploaded-doc"` / `"uploaded-doc-other"`) were deliberately
  left as `aspect-square` — those are ID/paperwork scans, not vehicle
  photos, and don't go through this crop step.
- If you want photo **reordering** (drag-to-reorder the grid) as a
  follow-up, neither upload surface has that today (order is just
  upload/insertion order, sorted server-side by `uploaded_at`) — that's a
  separate, larger feature and wasn't part of this change.
