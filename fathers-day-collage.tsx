import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, RotateCcw, Heart, Camera } from 'lucide-react';

const FathersDayCollage = () => {
  const [images, setImages] = useState([]);
  const [collageGenerated, setCollageGenerated] = useState(false);
  const [collageLayout, setCollageLayout] = useState([]);
  const canvasRef = useRef(null);
  const downloadLinkRef = useRef(null);

  const handleImageUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            setImages(prev => [...prev, {
              id: Date.now() + Math.random(),
              src: e.target.result,
              file: file,
              width: img.width,
              height: img.height,
              name: file.name
            }]);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  const generateCollageLayout = useCallback((imageCount) => {
    const layouts = {
      1: [{ x: 0, y: 0, width: 1, height: 1 }],
      2: [
        { x: 0, y: 0, width: 0.5, height: 1 },
        { x: 0.5, y: 0, width: 0.5, height: 1 }
      ],
      3: [
        { x: 0, y: 0, width: 0.5, height: 0.5 },
        { x: 0.5, y: 0, width: 0.5, height: 0.5 },
        { x: 0.25, y: 0.5, width: 0.5, height: 0.5 }
      ],
      4: [
        { x: 0, y: 0, width: 0.5, height: 0.5 },
        { x: 0.5, y: 0, width: 0.5, height: 0.5 },
        { x: 0, y: 0.5, width: 0.5, height: 0.5 },
        { x: 0.5, y: 0.5, width: 0.5, height: 0.5 }
      ],
      5: [
        { x: 0, y: 0, width: 0.4, height: 0.4 },
        { x: 0.6, y: 0, width: 0.4, height: 0.4 },
        { x: 0.3, y: 0.3, width: 0.4, height: 0.4 },
        { x: 0, y: 0.6, width: 0.4, height: 0.4 },
        { x: 0.6, y: 0.6, width: 0.4, height: 0.4 }
      ],
      6: [
        { x: 0, y: 0, width: 0.33, height: 0.5 },
        { x: 0.33, y: 0, width: 0.33, height: 0.5 },
        { x: 0.66, y: 0, width: 0.34, height: 0.5 },
        { x: 0, y: 0.5, width: 0.33, height: 0.5 },
        { x: 0.33, y: 0.5, width: 0.33, height: 0.5 },
        { x: 0.66, y: 0.5, width: 0.34, height: 0.5 }
      ]
    };

    // For more than 6 images, create a grid layout
    if (imageCount > 6) {
      const cols = Math.ceil(Math.sqrt(imageCount));
      const rows = Math.ceil(imageCount / cols);
      const layout = [];
      
      for (let i = 0; i < imageCount; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        layout.push({
          x: col / cols,
          y: row / rows,
          width: 1 / cols,
          height: 1 / rows
        });
      }
      return layout;
    }

    return layouts[imageCount] || layouts[6];
  }, []);

  const generateCollage = useCallback(async () => {
    if (images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const canvasSize = 800;
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvasSize, canvasSize);
    gradient.addColorStop(0, '#4f46e5');
    gradient.addColorStop(0.5, '#7c3aed');
    gradient.addColorStop(1, '#db2777');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Add decorative border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvasSize - 40, canvasSize - 40);

    const layout = generateCollageLayout(images.length);
    const padding = 15;
    const borderRadius = 12;

    // Draw images
    for (let i = 0; i < Math.min(images.length, layout.length); i++) {
      const img = new Image();
      img.onload = () => {
        const pos = layout[i];
        const x = pos.x * (canvasSize - 60) + 40;
        const y = pos.y * (canvasSize - 60) + 40;
        const width = pos.width * (canvasSize - 60) - padding;
        const height = pos.height * (canvasSize - 60) - padding;

        // Create rounded rectangle clipping path
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, borderRadius);
        ctx.clip();

        // Calculate aspect ratio and draw image
        const imgAspect = img.width / img.height;
        const boxAspect = width / height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > boxAspect) {
          drawHeight = height;
          drawWidth = height * imgAspect;
          drawX = x - (drawWidth - width) / 2;
          drawY = y;
        } else {
          drawWidth = width;
          drawHeight = width / imgAspect;
          drawX = x;
          drawY = y - (drawHeight - height) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();

        // Add white border around image
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, borderRadius);
        ctx.stroke();
      };
      img.src = images[i].src;
    }

    // Add Father's Day text
    setTimeout(() => {
      ctx.font = 'bold 32px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      const text = "Happy Father's Day!";
      const textY = canvasSize - 50;
      
      // Add background for text
      const textWidth = ctx.measureText(text).width;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(canvasSize/2 - textWidth/2 - 20, textY - 35, textWidth + 40, 50);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, canvasSize / 2, textY);
      
      setCollageGenerated(true);
    }, 1000);

    setCollageLayout(layout);
  }, [images, generateCollageLayout]);

  const downloadCollage = useCallback(() => {
    const canvas = canvasRef.current;
    const link = downloadLinkRef.current;
    
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `fathers-day-collage-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, []);

  const resetCollage = useCallback(() => {
    setImages([]);
    setCollageGenerated(false);
    setCollageLayout([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const removeImage = useCallback((id) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setCollageGenerated(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-4xl font-bold text-gray-800">Father's Day Collage Maker</h1>
            <Camera className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-gray-600 text-lg">Create a beautiful photo collage for Dad's special day!</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col items-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="imageUpload"
            />
            <label
              htmlFor="imageUpload"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors mb-4"
            >
              <Upload className="w-5 h-5" />
              Upload Photos
            </label>
            <p className="text-gray-500 text-sm">Select multiple images to create your collage</p>
          </div>

          {images.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Uploaded Images ({images.length})</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-6">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-20 object-cover rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={generateCollage}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Generate Collage
                </button>
                <button
                  onClick={resetCollage}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {(images.length > 0 || collageGenerated) && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Your Father's Day Collage</h3>
            <div className="flex justify-center mb-4">
              <canvas
                ref={canvasRef}
                className="border-2 border-gray-200 rounded-lg shadow-md max-w-full h-auto"
                style={{ maxWidth: '400px' }}
              />
            </div>
            
            {collageGenerated && (
              <div className="text-center">
                <button
                  onClick={downloadCollage}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <Download className="w-5 h-5" />
                  Download Collage
                </button>
                <p className="text-gray-500 text-sm mt-2">Your collage will be saved as a PNG file</p>
              </div>
            )}
          </div>
        )}

        <a ref={downloadLinkRef} className="hidden" />
      </div>
    </div>
  );
};

export default FathersDayCollage;