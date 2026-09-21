
"use client"

import { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn } from 'lucide-react';

interface PhotoCropperDialogProps {
  imageSrc: string | null;
  onCancel: () => void;
  onConfirm: (croppedArea: Area) => void;
}

/**
 * Lets the seller centre their bike/scooter in a fixed 4:3 frame before it's
 * added to the listing, instead of relying on a plain object-fit crop later.
 */
export function PhotoCropperDialog({ imageSrc, onCancel, onConfirm }: PhotoCropperDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) onCancel();
  };

  const handleConfirm = () => {
    if (croppedAreaPixels) onConfirm(croppedAreaPixels);
  };

  return (
    <Dialog open={!!imageSrc} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Position the vehicle in frame</DialogTitle>
        </DialogHeader>

        {imageSrc && (
          <div className="relative w-full aspect-[4/3] bg-neutral-900 rounded-md overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              objectFit="contain"
            />
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
          <Slider
            min={1}
            max={3}
            step={0.01}
            value={[zoom]}
            onValueChange={(v) => setZoom(v[0])}
          />
        </div>
        <p className="text-[11px] text-muted-foreground text-center -mt-2">
          Drag to reposition &middot; pinch or use the slider to zoom
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="button" onClick={handleConfirm}>Use this photo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
