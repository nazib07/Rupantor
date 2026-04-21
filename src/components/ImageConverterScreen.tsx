import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Home, FileImage, Upload, Download, RefreshCw, CheckCircle2, X, Crop, MousePointer2, Layers, Sliders, Eraser } from 'lucide-react';
import ReactCrop, { Crop as CropType, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import 'react-image-crop/dist/ReactCrop.css';
import { Language } from '../types';
import { translations } from '../constants/translations';

interface ImageConverterScreenProps {
  language: Language;
  onBack: () => void;
}

const ImageConverterScreen: React.FC<ImageConverterScreenProps> = ({ language, onBack }) => {
  const t = translations[language];
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const permission = await Filesystem.checkPermissions();
        if (permission.publicStorage !== 'granted') {
          const result = await Filesystem.requestPermissions();
          if (result.publicStorage !== 'granted') {
            setError(language === 'bn' ? 'ফাইল অ্যাক্সেস করার অনুমতি প্রয়োজন' : 'Storage permission is required to access files');
            return false;
          }
        }
      } catch (err) {
        console.error('Error checking permissions:', err);
      }
    }
    return true;
  };

  const handleSelectClick = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos // Force gallery for "selection"
        });

        if (image.webPath) {
          const response = await fetch(image.webPath);
          const blob = await response.blob();
          const selectedFile = new File([blob], `image.${image.format}`, { type: blob.type });
          
          setFile(selectedFile);
          const url = URL.createObjectURL(selectedFile);
          setOriginalUrl(url);
          setResultUrl(null);
          setError(null);
          setMode('convert');
          resetEdits();
        }
      } catch (err) {
        console.error('Camera error:', err);
        // Error usually means user cancelled
      }
    } else {
      // Browser fallback
      document.getElementById('file-input')?.click();
    }
  };
  
  // Editing states
  const [mode, setMode] = useState<'convert' | 'edit'>('convert');
  const [editTab, setEditTab] = useState<'crop' | 'filters' | 'bg'>('crop');
  
  // Filter states
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  
  // Crop states
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [resultUrl, originalUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith('image/')) {
        setError(language === 'bn' ? 'দয়া করে একটি ছবি নির্বাচন করুন' : 'Please select an image file');
        return;
      }
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setOriginalUrl(url);
      setResultUrl(null);
      setError(null);
      setMode('convert');
      resetEdits();
    }
  };

  const resetEdits = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (!selectedFile.type.startsWith('image/')) {
        setError(language === 'bn' ? 'দয়া করে একটি ছবি নির্বাচন করুন' : 'Please select an image file');
        return;
      }
      setFile(selectedFile);
      setOriginalUrl(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setError(null);
      setMode('convert');
      resetEdits();
    }
  };

  const getProcessedCanvas = async (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Apply Crop if exists
        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        if (completedCrop) {
          const scaleX = img.naturalWidth / img.width;
          const scaleY = img.naturalHeight / img.height;
          sourceX = completedCrop.x * scaleX;
          sourceY = completedCrop.y * scaleY;
          sourceWidth = completedCrop.width * scaleX;
          sourceHeight = completedCrop.height * scaleY;
          width = sourceWidth;
          height = sourceHeight;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get context'));
          return;
        }

        // Apply Filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, width, height
        );
        
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = originalUrl || '';
    });
  };

  const processImage = async () => {
    if (!file || !originalUrl) return;
    setIsProcessing(true);
    setError(null);

    try {
      const canvas = await getProcessedCanvas();
      const mimeType = `image/${targetFormat}`;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Canvas toBlob failed'));
        }, mimeType, 0.95);
      });
      
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      setError(language === 'bn' ? 'প্রসেস করতে ব্যর্থ হয়েছে' : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!resultUrl || !file) return;

    if (Capacitor.isNativePlatform()) {
      try {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        // Convert blob URL to base64 for Filesystem
        const response = await fetch(resultUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          const fileName = `processed-${Date.now()}.${targetFormat}`;
          
          await Filesystem.writeFile({
            path: fileName,
            data: base64data,
            directory: Directory.Documents,
          });
          
          alert(language === 'bn' ? `ছবিটি সফলভাবে সংরক্ষিত হয়েছে: ${fileName}` : `Image saved successfully as ${fileName}`);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error('Save error:', err);
        setError(language === 'bn' ? 'সংরক্ষণ করতে ব্যর্থ হয়েছে' : 'Failed to save image');
      }
    } else {
      // Browser download
      const link = document.createElement('a');
      link.href = resultUrl;
      link.download = `processed-${file.name.split('.')[0]}.${targetFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const removeBackground = async () => {
    // This is a naive "color key" or "magic wand" approach for offline
    // Since complex AI is too large for this local app, we provide a placeholder or basic implement
    alert(language === 'bn' ? 'অফলাইন ব্যাকগ্রাউন্ড রিমুভাল বর্তমানে সীমিত। নিখুঁত রেজাল্টের জন্য এআই টুল ব্যবহার করুন।' : 'Offline background removal is limited. For perfect results, use AI-powered tools.');
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-40 flex flex-col bg-white dark:bg-card-dark transition-colors overflow-y-auto"
    >
      <div className="flex items-center justify-between px-6 pt-12 max-w-4xl mx-auto w-full">
        <button 
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-secondary-dark text-gray-600 dark:text-zinc-400 transition-transform active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-[#6C63FF]">{t.imageConverter}</h2>
        <button 
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 dark:bg-secondary-dark text-gray-600 dark:text-zinc-400 transition-transform active:scale-90"
        >
          <Home size={20} />
        </button>
      </div>

      <div className="mt-8 flex flex-1 flex-col px-6 max-w-4xl mx-auto w-full space-y-6 pb-24">
        {!file ? (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={handleSelectClick}
            className="flex-1 relative border-2 border-dashed border-gray-200 dark:border-border-dark bg-gray-50 dark:bg-secondary-dark rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all cursor-pointer hover:border-[#6C63FF]/30"
          >
            <input 
              id="file-input"
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handleFileChange}
            />
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="text-gray-400 w-8 h-8" />
              </div>
              <p className="font-bold text-gray-700 dark:text-gray-300">{t.selectFile}</p>
              <p className="text-xs text-gray-500 mt-1">{t.dropFile}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 gap-6">
            {/* Toolbar */}
            {!resultUrl && (
              <div className="flex bg-gray-100 dark:bg-secondary-dark p-2 rounded-2xl gap-2">
                <button 
                  onClick={() => setMode('convert')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${mode === 'convert' ? 'bg-white dark:bg-zinc-800 shadow-md text-[#6C63FF]' : 'text-gray-500'}`}
                >
                  <RefreshCw size={18} />
                  <span>{language === 'bn' ? 'রূপান্তর' : 'Convert'}</span>
                </button>
                <button 
                  onClick={() => setMode('edit')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${mode === 'edit' ? 'bg-white dark:bg-zinc-800 shadow-md text-[#6C63FF]' : 'text-gray-500'}`}
                >
                  <Crop size={18} />
                  <span>{t.editImage}</span>
                </button>
              </div>
            )}

            {/* Preview/Editor area */}
            <div className="flex-1 relative min-h-[300px] bg-gray-50 dark:bg-secondary-dark rounded-[2rem] overflow-hidden flex items-center justify-center p-4">
              {resultUrl ? (
                <div className="text-center p-6 w-full h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                    <CheckCircle2 size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-6">{t.conversionReady}</h3>
                  <div className="aspect-square max-w-[200px] border-4 border-white dark:border-zinc-800 shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
                    <img src={resultUrl} alt="Result" className="w-full h-full object-contain" />
                  </div>
                </div>
              ) : mode === 'edit' ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="max-h-[60vh] w-full flex items-center justify-center overflow-auto">
                    {editTab === 'crop' ? (
                      <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                      >
                        <img 
                          ref={imgRef}
                          src={originalUrl || ''} 
                          alt="Edit" 
                          style={{ 
                            maxHeight: '50vh',
                            filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` 
                          }}
                        />
                      </ReactCrop>
                    ) : (
                      <img 
                        src={originalUrl || ''} 
                        alt="Edit" 
                        style={{ 
                          maxHeight: '50vh',
                          filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` 
                        }}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <img 
                    src={originalUrl || ''} 
                    alt="Original" 
                    className="max-h-[50vh] rounded-xl shadow-lg border-2 border-white dark:border-zinc-800" 
                  />
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-1 bg-[#6C63FF]/10 text-[#6C63FF] rounded-full text-xs font-bold">
                    <FileImage size={14} />
                    <span>{file.name}</span>
                  </div>
                </div>
              )}

              {!resultUrl && (
                <button 
                  onClick={() => { 
                    setFile(null); 
                    setOriginalUrl(null); 
                    if (document.getElementById('file-input')) {
                      (document.getElementById('file-input') as HTMLInputElement).value = '';
                    }
                  }}
                  className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-black/40 backdrop-blur-sm shadow-md rounded-full text-red-500 transition-transform active:scale-90"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Bottom Controls */}
            <AnimatePresence>
              {!resultUrl && mode === 'edit' && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Edit Tabs */}
                  <div className="flex gap-4 border-b border-gray-100 dark:border-border-dark">
                    <button 
                      onClick={() => setEditTab('crop')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-colors ${editTab === 'crop' ? 'text-[#6C63FF] border-b-2 border-[#6C63FF]' : 'text-gray-400'}`}
                    >
                      {t.crop}
                    </button>
                    <button 
                      onClick={() => setEditTab('filters')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-colors ${editTab === 'filters' ? 'text-[#6C63FF] border-b-2 border-[#6C63FF]' : 'text-gray-400'}`}
                    >
                      {t.filters}
                    </button>
                    <button 
                      onClick={() => setEditTab('bg')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-colors ${editTab === 'bg' ? 'text-[#6C63FF] border-b-2 border-[#6C63FF]' : 'text-gray-400'}`}
                    >
                      {t.removeBg}
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="bg-gray-50 dark:bg-secondary-dark p-6 rounded-3xl">
                    {editTab === 'crop' && (
                      <div className="flex items-center justify-between text-gray-500 text-sm italic">
                        <div className="flex items-center gap-2">
                          <MousePointer2 size={16} />
                          <span>{language === 'bn' ? 'ছবিতে ড্র্যাগ করে ক্রপ করুন' : 'Drag on image to crop'}</span>
                        </div>
                        <button 
                          onClick={() => { setCrop(undefined); setCompletedCrop(undefined); }}
                          className="text-[#6C63FF] font-bold not-italic hover:underline"
                        >
                          {t.reset}
                        </button>
                      </div>
                    )}

                    {editTab === 'filters' && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t.brightness}</label>
                            <span className="text-xs font-mono text-[#6C63FF]">{brightness}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="200" value={brightness} 
                            onChange={(e) => setBrightness(parseInt(e.target.value))}
                            className="w-full accent-[#6C63FF]"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t.contrast}</label>
                            <span className="text-xs font-mono text-[#6C63FF]">{contrast}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="200" value={contrast} 
                            onChange={(e) => setContrast(parseInt(e.target.value))}
                            className="w-full accent-[#6C63FF]"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase">{t.saturation}</label>
                            <span className="text-xs font-mono text-[#6C63FF]">{saturation}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="200" value={saturation} 
                            onChange={(e) => setSaturation(parseInt(e.target.value))}
                            className="w-full accent-[#6C63FF]"
                          />
                        </div>
                      </div>
                    )}

                    {editTab === 'bg' && (
                      <div className="text-center space-y-4">
                        <button 
                          onClick={removeBackground}
                          className="w-full py-4 bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/20 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#6C63FF]/20"
                        >
                          <Eraser size={20} />
                          {t.removeBg}
                        </button>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          {language === 'bn' 
                            ? 'এটি একটি মৌলিক অফলাইন টুল। নিখুঁত ব্যাকগ্রাউন্ড রিমুভালের জন্য অনলাইন পোর্টাল ব্যবহার করতে পারেন।' 
                            : 'Basic offline tool. Use specialized online AI for precise professional removal.'}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={processImage}
                    disabled={isProcessing}
                    className="w-full bg-[#6C63FF] text-white font-bold py-5 rounded-2xl shadow-xl shadow-[#6C63FF]/20 flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCw size={22} className="animate-spin" /> : <RefreshCw size={22} />}
                    {isProcessing ? t.converting : (language === 'bn' ? 'এডিট প্রয়োগ ও রূপান্তর করুন' : 'Apply & Convert')}
                  </button>
                </motion.div>
              )}

              {!resultUrl && mode === 'convert' && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="rounded-3xl bg-gray-50 dark:bg-secondary-dark p-6">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 block">{t.targetFormat}</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['png', 'jpeg', 'webp'].map((format) => (
                        <button
                          key={format}
                          onClick={() => setTargetFormat(format)}
                          className={`py-3 px-4 rounded-xl font-bold transition-all text-center uppercase text-sm ${
                            targetFormat === format 
                              ? 'bg-[#6C63FF] text-white shadow-lg' 
                              : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={processImage}
                    disabled={isProcessing}
                    className="w-full bg-[#6C63FF] text-white font-bold py-5 rounded-2xl shadow-xl shadow-[#6C63FF]/20 flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCw size={22} className="animate-spin" /> : <RefreshCw size={22} />}
                    {isProcessing ? t.converting : t.convertNow}
                  </button>
                </motion.div>
              )}

              {resultUrl && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex gap-4"
                >
                  <button
                    onClick={() => { 
                      setFile(null); 
                      setOriginalUrl(null); 
                      setResultUrl(null);
                      if (document.getElementById('file-input')) {
                        (document.getElementById('file-input') as HTMLInputElement).value = '';
                      }
                    }}
                    className="flex-1 py-5 bg-gray-100 dark:bg-secondary-dark text-gray-700 dark:text-gray-300 font-bold rounded-2xl active:scale-95 transition-transform"
                  >
                    {language === 'bn' ? 'নতুন ছবি' : 'New Image'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-5 bg-[#6C63FF] text-white font-bold rounded-2xl shadow-xl shadow-[#6C63FF]/20 flex items-center justify-center gap-2 active:scale-95 transition-transform text-center"
                  >
                    <Download size={22} />
                    {t.download}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ImageConverterScreen;
