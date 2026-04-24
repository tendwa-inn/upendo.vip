import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react';

import CardPreview from './CardPreview';
import { useAuthStore } from '../stores/authStore';

interface PhotoCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageUrl: string) => void;
  imageUrl: string;
  aspectRatio?: number;
  circularCrop?: boolean;
  title?: string;
}

const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  isOpen,
  onClose,
  onCropComplete,
  imageUrl,
  aspectRatio = 9 / 16,
  circularCrop = false,
  title = "Crop Your Photo",
}) => {
  const { profile } = useAuthStore();
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const minDimension = Math.min(width, height);
    
    setCrop({
      unit: 'px',
      x: (width - minDimension) / 2,
      y: (height - minDimension) / 2,
      width: minDimension,
      height: minDimension,
    });
  }, []);

  const handleScaleChange = (delta: number) => {
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleRotate = () => {
    setRotate(prev => (prev + 90) % 360);
  };

  const resetTransformations = () => {
    setScale(1);
    setRotate(0);
    if (imgRef.current) {
      onImageLoad({ currentTarget: imgRef.current } as React.SyntheticEvent<HTMLImageElement>);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });
  };

  const getCroppedImg = async (
    image: HTMLImageElement,
    pixelCrop: PixelCrop,
    rotation = 0
  ): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * (scale / 2),
      safeArea / 2 - image.height * (scale / 2),
      image.width * scale,
      image.height * scale
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * (scale / 2) - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * (scale / 2) - pixelCrop.y)
    );

    if (circularCrop) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    return new Promise<string>((resolve) => {
      canvas.toBlob((file) => {
        if (file) {
          resolve(URL.createObjectURL(file));
        } else {
          resolve(canvas.toDataURL());
        }
      }, 'image/jpeg', 0.9);
    });
  };

  useEffect(() => {
    const generatePreview = async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current) {
        const croppedUrl = await getCroppedImg(
          imgRef.current,
          completedCrop,
          rotate
        );
        setCroppedImageUrl(croppedUrl);
      }
    };

    const timeoutId = setTimeout(() => {
      generatePreview();
    }, 100); // Debounce to avoid excessive re-renders

    return () => clearTimeout(timeoutId);
  }, [completedCrop, rotate, scale]);

  const handleConfirm = () => {
    if (croppedImageUrl) {
      onCropComplete(croppedImageUrl);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-gradient-to-b from-[#2E0C13] to-[#22090E] rounded-2xl p-4 w-full max-w-6xl text-white border border-white/10 max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Cropper */}
        <div className="w-full">
          <div className="relative max-h-[60vh] max-w-full overflow-hidden rounded-lg bg-black/20 flex items-center justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              circularCrop={circularCrop}
              className="max-h-[60vh]"
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
            >
              <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imageUrl}
                  crossOrigin="anonymous" // Add this line
                  onLoad={onImageLoad}
                  style={{
                    transform: `scale(${scale}) rotate(${rotate}deg)`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                  className="max-w-full max-h-[60vh] object-contain select-none"
                  draggable={false}
                />
            </ReactCrop>
          </div>
        </div>

        {/* Right Side: Preview */}
        <div className="w-full flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-white/80">Live Preview</h3>
          <div className="w-full max-w-[280px]">
            <CardPreview 
              imageUrl={croppedImageUrl || ''}
              name={profile?.name || ''}
              age={profile?.age || null}
              bio={profile?.bio || ''}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            This is how your photo will appear on your profile card.
          </p>
        </div>
      </div>
      </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          {/* Left controls */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => handleScaleChange(-0.1)}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm min-w-[60px] text-center">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => handleScaleChange(0.1)}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={resetTransformations}
              className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
              title="Reset"
            >
              Reset
            </button>
          </div>

          {/* Right controls */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!croppedImageUrl}
              className="px-6 py-2 bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Confirm
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Drag to move • Resize corners to adjust • Use controls to zoom & rotate
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhotoCropModal;