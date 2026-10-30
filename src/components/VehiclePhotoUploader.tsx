
"use client"

import { useRef, useState } from 'react';
import type { Area } from 'react-easy-crop';
import { Loader2, Image as ImageIcon, Plus, X } from 'lucide-react';
import { PhotoCropperDialog } from '@/components/PhotoCropperDialog';
import { cropAndCompressImage } from '@/lib/image-upload';

/** The four photos Sell / Exchange require, in this order (index = slot in the images array). */
export const REQUIRED_PHOTO_SLOTS = ['Odometer', 'Front number plate', 'Rear number plate', 'Full vehicle'];

interface VehiclePhotoUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  error?: string;
  label?: string;
  /** One required, labelled photo per entry; `images` then holds one string per slot ('' = empty). */
  slotLabels?: string[];
}

/**
 * Shared photo picker for the Sell / Exchange forms. Every photo is routed
 * through a 4:3 crop step before it's added, so sellers centre the bike
 * themselves instead of getting a blind object-fit crop later on the site.
 */
export function VehiclePhotoUploader({ images, onChange, maxImages = 6, error, label = 'Vehicle Photos', slotLabels }: VehiclePhotoUploaderProps) {
  const [queue, setQueue] = useState<File[]>([]);
  const [activeImageSrc, setActiveImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const slotRef = useRef(0);

  const remainingSlots = maxImages - images.length;

  const cleanupActiveUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const processNext = (files: File[]) => {
    if (files.length === 0) return;
    const [next, ...rest] = files;
    setQueue(rest);
    const url = URL.createObjectURL(next);
    objectUrlRef.current = url;
    setActiveImageSrc(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const selected = Array.from(files).slice(0, remainingSlots);
    processNext(selected);
    e.target.value = '';
  };

  const handleCancelCrop = () => {
    cleanupActiveUrl();
    setActiveImageSrc(null);
    processNext(queue);
  };

  const handleConfirmCrop = async (croppedArea: Area) => {
    if (!activeImageSrc) return;
    setIsProcessing(true);
    try {
      const dataUrl = await cropAndCompressImage(activeImageSrc, croppedArea);
      if (slotLabels) {
        const next = slotLabels.map((_, i) => images[i] || '');
        next[slotRef.current] = dataUrl;
        onChange(next);
      } else {
        onChange([...images, dataUrl].slice(0, maxImages));
      }
    } catch (err) {
      console.error('Failed to crop/compress image', err);
    } finally {
      cleanupActiveUrl();
      setActiveImageSrc(null);
      setIsProcessing(false);
      processNext(queue);
    }
  };

  const removeImage = (index: number) => {
    onChange(slotLabels ? slotLabels.map((_, i) => (i === index ? '' : images[i] || '')) : images.filter((_, i) => i !== index));
  };

  if (slotLabels) {
    return (
      <div className="space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-brand" /> {label} ({slotLabels.length} required)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {slotLabels.map((slot, idx) => (
            <div key={slot} className="space-y-1.5">
              {images[idx] ? (
                <div className="relative aspect-[4/3] overflow-hidden border group bg-neutral-100">
                  <img src={images[idx]} className="w-full h-full object-cover" alt={slot} />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                    aria-label={`Remove ${slot} photo`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="aspect-[4/3] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-foreground/40 hover:bg-brand/10 transition-all text-muted-foreground hover:text-brand">
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold uppercase">Add</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      slotRef.current = idx;
                      processNext([file]);
                    }}
                    disabled={isProcessing || !!activeImageSrc}
                  />
                </label>
              )}
              <p className="text-[11px] font-bold uppercase tracking-wider text-center text-muted-foreground">{slot}</p>
            </div>
          ))}
        </div>
        {isProcessing && (
          <div className="flex items-center gap-2 text-brand font-bold animate-pulse text-[10px]">
            <Loader2 className="w-3 h-3 animate-spin" /> Optimizing...
          </div>
        )}
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        <PhotoCropperDialog imageSrc={activeImageSrc} onCancel={handleCancelCrop} onConfirm={handleConfirmCrop} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-brand" /> {label} (Max {maxImages})
        </span>
        <div className="flex items-center gap-4">
          {isProcessing && (
            <div className="flex items-center gap-2 text-brand font-bold animate-pulse text-[10px]">
              <Loader2 className="w-3 h-3 animate-spin" /> Optimizing...
            </div>
          )}
          <span className="text-[10px] text-muted-foreground font-bold">{images.length} / {maxImages}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative aspect-[4/3] overflow-hidden border group bg-neutral-100">
            <img src={img} className="w-full h-full object-cover" alt={`Vehicle photo ${idx + 1}`} />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove photo"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {images.length < maxImages && (
          <label className="aspect-[4/3] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-foreground/40 hover:bg-brand/10 transition-all text-muted-foreground hover:text-brand group">
            <Plus className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase">Add Photo</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              disabled={isProcessing || !!activeImageSrc}
            />
          </label>
        )}
      </div>

      {error && <p className="text-sm font-medium text-destructive">{error}</p>}

      <PhotoCropperDialog
        imageSrc={activeImageSrc}
        onCancel={handleCancelCrop}
        onConfirm={handleConfirmCrop}
      />
    </div>
  );
}
