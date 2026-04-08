import React, { useState } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
}

const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc,
  onError 
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      if (fallbackSrc && imageSrc !== fallbackSrc) {
        setImageSrc(fallbackSrc);
      }
      setHasError(true);
      onError?.();
    }
  };

  // If the source is already the fallback, don't try to load the original
  const finalSrc = hasError ? (fallbackSrc || '') : imageSrc;

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
      draggable="false"
    />
  );
};

export default SafeImage;