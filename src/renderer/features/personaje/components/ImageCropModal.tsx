export const ImageCropModal = (props: any) => {
  const { showCropModal, setShowCropModal, cropImageSrc, setCropImageSrc, cropMode,
          cropScale, setCropScale, cropOffsetX, setCropOffsetX, cropOffsetY, setCropOffsetY,
          isCropDragging, setIsCropDragging, cropDragStart, setCropDragStart, cropImgDims, setCropImgDims,
          cropImgRef, handleCropSave } = props;
  return (
    <>
      {showCropModal && cropImageSrc && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 4, 3, 0.92)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div className="clipped-frame" style={{
            background: 'var(--bg-surface)',
            border: '2px solid var(--accent-gold)',
            boxShadow: '0 0 50px rgba(0,0,0,0.8)',
            padding: '30px',
            width: '100%',
            maxWidth: '450px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center',
            borderRadius: '8px'
          }}>
            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', margin: 0, letterSpacing: '1px' }}>
              {cropMode === 'avatar' ? 'AJUSTAR AVATAR' : 'AJUSTAR RETRATO'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0 0 10px 0', textAlign: 'center' }}>
              Arrastra la imagen para centrarla y usa la barra para hacer zoom.
            </p>

            {/* Viewport de recorte (circular o rectangular) */}
            <div style={{
              width: '260px',
              height: cropMode === 'avatar' ? '260px' : '390px',
              borderRadius: cropMode === 'avatar' ? '50%' : '4px',
              border: '2px solid var(--accent-gold)',
              overflow: 'hidden',
              position: 'relative',
              background: '#0d0b09',
              cursor: isCropDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}
            onMouseDown={(e) => {
              setIsCropDragging(true);
              setCropDragStart({ x: e.clientX - cropOffsetX, y: e.clientY - cropOffsetY });
            }}
            onMouseMove={(e) => {
              if (isCropDragging && cropImgDims.width && cropImgDims.height) {
                const targetX = e.clientX - cropDragStart.x;
                const targetY = e.clientY - cropDragStart.y;
                
                const viewportW = 260;
                const viewportH = cropMode === 'avatar' ? 260 : 390;

                const imgAspect = cropImgDims.width / cropImgDims.height;
                const viewportAspect = viewportW / viewportH;
                const fitsHeight = imgAspect > viewportAspect;
                
                const baseWidth = fitsHeight ? viewportH * imgAspect : viewportW;
                const baseHeight = fitsHeight ? viewportH : viewportW / imgAspect;
                
                const W = baseWidth * cropScale;
                const H = baseHeight * cropScale;
                
                const maxOffsetX = Math.max(0, (W - viewportW) / 2);
                const maxOffsetY = Math.max(0, (H - viewportH) / 2);
                
                setCropOffsetX(Math.min(maxOffsetX, Math.max(-maxOffsetX, targetX)));
                setCropOffsetY(Math.min(maxOffsetY, Math.max(-maxOffsetY, targetY)));
              }
            }}
            onMouseUp={() => setIsCropDragging(false)}
            onMouseLeave={() => setIsCropDragging(false)}
            >
              <img
                ref={cropImgRef}
                src={cropImageSrc}
                alt="Para recortar"
                draggable={false}
                onLoad={(e) => {
                  setCropImgDims({
                    width: e.currentTarget.naturalWidth,
                    height: e.currentTarget.naturalHeight
                  });
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: (cropImgDims.width / cropImgDims.height) > (cropMode === 'avatar' ? 1 : 260/390) ? 'auto' : '100%',
                  height: (cropImgDims.width / cropImgDims.height) > (cropMode === 'avatar' ? 1 : 260/390) ? '100%' : 'auto',
                  transform: `translate(-50%, -50%) translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropScale})`,
                  transformOrigin: 'center',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              />
            </div>

            {/* Control de Zoom */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span className="font-cinzel">ZOOM</span>
                <span className="mono">{Math.round(cropScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={cropScale}
                onChange={(e) => setCropScale(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-gold)',
                  background: 'var(--bg-void)',
                  height: '6px',
                  borderRadius: '3px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '15px', width: '100%', marginTop: '10px' }}>
              <button
                type="button"
                className="font-cinzel"
                onClick={() => {
                  setShowCropModal(false);
                  setCropImageSrc(null);
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                style={{
                  flex: 1,
                  background: 'var(--accent-gold)',
                  border: 'none',
                  color: 'var(--bg-base)',
                  padding: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  boxShadow: '0 0 10px rgba(200,135,42,0.4)'
                }}
              >
                ACEPTAR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
