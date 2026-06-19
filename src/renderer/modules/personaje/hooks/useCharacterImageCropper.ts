import { useEffect, useRef, useState } from 'react';

type CropMode = 'avatar' | 'portrait';

type UseCharacterImageCropperOptions = {
  onAvatarUploaded: (url: string) => void;
  onPortraitUploaded: (url: string) => void;
};

export const useCharacterImageCropper = ({
  onAvatarUploaded,
  onPortraitUploaded
}: UseCharacterImageCropperOptions) => {
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropScale, setCropScale] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [isCropDragging, setIsCropDragging] = useState(false);
  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 });
  const [cropImgDims, setCropImgDims] = useState({ width: 0, height: 0 });
  const [cropMode, setCropMode] = useState<CropMode>('avatar');
  const cropImgRef = useRef<HTMLImageElement>(null);
  const portraitInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cropImgDims.width || !cropImgDims.height) return;

    const viewportW = 260;
    const viewportH = cropMode === 'avatar' ? 260 : 390;

    const imgAspect = cropImgDims.width / cropImgDims.height;
    const viewportAspect = viewportW / viewportH;
    const fitsHeight = imgAspect > viewportAspect;

    const baseWidth = fitsHeight ? viewportH * imgAspect : viewportW;
    const baseHeight = fitsHeight ? viewportH : viewportW / imgAspect;

    const width = baseWidth * cropScale;
    const height = baseHeight * cropScale;

    const maxOffsetX = Math.max(0, (width - viewportW) / 2);
    const maxOffsetY = Math.max(0, (height - viewportH) / 2);

    setCropOffsetX(prev => Math.min(maxOffsetX, Math.max(-maxOffsetX, prev)));
    setCropOffsetY(prev => Math.min(maxOffsetY, Math.max(-maxOffsetY, prev)));
  }, [cropScale, cropImgDims, cropMode]);

  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setCropScale(1);
      setCropOffsetX(0);
      setCropOffsetY(0);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleCropSave = async () => {
    const canvas = document.createElement('canvas');
    const canvasW = cropMode === 'avatar' ? 300 : 520;
    const canvasH = cropMode === 'avatar' ? 300 : 780;
    canvas.width = canvasW;
    canvas.height = canvasH;

    const ctx = canvas.getContext('2d');
    if (!ctx || !cropImgRef.current) return;

    ctx.fillStyle = '#0f0c08';
    ctx.fillRect(0, 0, canvasW, canvasH);

    const img = cropImgRef.current;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const viewportW = 260;
    const viewportH = cropMode === 'avatar' ? 260 : 390;

    const imgAspect = iw / ih;
    const viewportAspect = viewportW / viewportH;
    const fitsHeight = imgAspect > viewportAspect;

    const baseScale = fitsHeight ? (canvasH / ih) : (canvasW / iw);
    const finalScale = baseScale * cropScale;

    const dw = iw * finalScale;
    const dh = ih * finalScale;

    const scaleX = canvasW / viewportW;
    const scaleY = canvasH / viewportH;

    const dx = (canvasW / 2) - dw / 2 + (cropOffsetX * scaleX);
    const dy = (canvasH / 2) - dh / 2 + (cropOffsetY * scaleY);

    ctx.drawImage(img, dx, dy, dw, dh);

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    try {
      const blob = await (await fetch(croppedDataUrl)).blob();
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      const backendUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
      const uploadUrl = `${backendUrl}/api/upload?folder=avatars`;

      const res = await fetch(uploadUrl, { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        if (cropMode === 'avatar') {
          onAvatarUploaded(data.url);
        } else {
          onPortraitUploaded(data.url);
        }
        setShowCropModal(false);
        setCropImageSrc(null);
      } else {
        alert('Error al subir imagen recortada: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al subir la imagen');
    }
  };

  return {
    cropImageSrc,
    setCropImageSrc,
    showCropModal,
    setShowCropModal,
    cropScale,
    setCropScale,
    cropOffsetX,
    setCropOffsetX,
    cropOffsetY,
    setCropOffsetY,
    isCropDragging,
    setIsCropDragging,
    cropDragStart,
    setCropDragStart,
    cropImgDims,
    setCropImgDims,
    cropMode,
    setCropMode,
    cropImgRef,
    portraitInputRef,
    handleImageUpload,
    handleCropSave
  };
};
