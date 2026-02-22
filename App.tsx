
import React, { useState } from 'react';
import { Icons, COLORS } from './constants';
import { JewelleryType, ModelStyle, RegionalStyle, ShotType, SkinTone, ModelSource, GenerationConfig, Project, BrandingConfig, LogoPosition, OverlaySettings, ProductDetails } from './types';
import { generateJewelleryTryOn, generateJewelleryVideo } from './services/geminiService';

const Selector = ({ label, options, current, onChange, multi = false }: { label: string, options: string[], current: string | string[], onChange: (val: any) => void, multi?: boolean }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const isSelected = multi 
          ? (current as string[]).includes(option) 
          : current === option;
        
        return (
          <button
            key={option}
            onClick={() => {
              if (multi) {
                const currArr = current as string[];
                if (currArr.includes(option)) {
                  if (currArr.length > 1) {
                    onChange(currArr.filter((i: string) => i !== option));
                  }
                } else {
                  onChange([...currArr, option]);
                }
              } else {
                onChange(option);
              }
            }}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
              isSelected 
                ? 'bg-emerald-950 text-white border-emerald-950 shadow-md scale-105' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-500'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

const SkinToneSelector = ({ current, onChange }: { current: SkinTone, onChange: (val: SkinTone) => void }) => {
  const tones = [
    { id: SkinTone.FAIR, color: '#F3CFB6', label: 'Fair' },
    { id: SkinTone.MEDIUM, color: '#C68642', label: 'Medium' },
    { id: SkinTone.DEEP, color: '#8D5524', label: 'Deep' }
  ];

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skin Tone</label>
      <div className="flex gap-4">
        {tones.map(tone => (
          <button
            key={tone.id}
            onClick={() => onChange(tone.id)}
            className="group flex flex-col items-center space-y-1"
          >
            <div 
              className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                current === tone.id ? 'border-emerald-600 ring-2 ring-emerald-100 scale-110' : 'border-white'
              }`}
              style={{ backgroundColor: tone.color }}
            />
            <span className={`text-[10px] font-bold ${current === tone.id ? 'text-emerald-700' : 'text-slate-400'}`}>
              {tone.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const BrandingControl = ({ 
  title, 
  settings, 
  onUpdate, 
  onUpload,
  disableUpload = false,
  type = 'image'
}: { 
  title: string, 
  settings: OverlaySettings | BrandingConfig['details'], 
  onUpdate: (s: any) => void,
  onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  disableUpload?: boolean,
  type?: 'image' | 'text'
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
      <label className="inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={settings.enabled} 
          onChange={(e) => onUpdate({...settings, enabled: e.target.checked})} 
          className="sr-only peer"
        />
        <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
        <span className="ms-2 text-[10px] font-bold text-slate-400 uppercase">{settings.enabled ? 'On' : 'Off'}</span>
      </label>
    </div>
    
    <div className={`space-y-6 transition-opacity duration-200 ${settings.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
      
      {type === 'image' && (
          <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{disableUpload ? "Jewellery Source" : "Upload Image"}</label>
          <div className={`border-2 border-dashed border-slate-200 rounded-xl p-6 text-center ${!disableUpload ? 'hover:border-emerald-500 transition cursor-pointer' : ''} relative group`}>
              {!disableUpload && (
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" accept="image/*" onChange={onUpload} />
              )}
              {settings.image ? (
              <img src={settings.image} alt="Overlay" className="mx-auto max-h-16 object-contain" />
              ) : (
              disableUpload ? (
                  <div className="flex flex-col items-center justify-center text-slate-300 py-2">
                      <Icons.Upload />
                      <p className="text-[10px] mt-2 font-medium">Upload in Generate Tab</p>
                  </div>
              ) : (
                  <div className="flex justify-center text-slate-300 group-hover:text-emerald-500 transition"><Icons.Upload /></div>
              )
              )}
          </div>
          </div>
      )}

      {type === 'text' && (
          <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Gold Weight (g)</label>
                      <input 
                          type="text" 
                          className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition bg-slate-50 focus:bg-white" 
                          value={(settings as BrandingConfig['details']).content.goldWeight}
                          onChange={(e) => onUpdate({...settings, content: { ...(settings as BrandingConfig['details']).content, goldWeight: e.target.value }})}
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Purity (Carat)</label>
                      <input 
                          type="text" 
                          className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition bg-slate-50 focus:bg-white" 
                          value={(settings as BrandingConfig['details']).content.goldPurity}
                          onChange={(e) => onUpdate({...settings, content: { ...(settings as BrandingConfig['details']).content, goldPurity: e.target.value }})}
                      />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Diamond (ct)</label>
                      <input 
                          type="text" 
                          className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition bg-slate-50 focus:bg-white" 
                          value={(settings as BrandingConfig['details']).content.diamondCarat}
                          onChange={(e) => onUpdate({...settings, content: { ...(settings as BrandingConfig['details']).content, diamondCarat: e.target.value }})}
                      />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Stone Charges</label>
                      <input 
                          type="text" 
                          className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition bg-slate-50 focus:bg-white" 
                          value={(settings as BrandingConfig['details']).content.stonePrice}
                          onChange={(e) => onUpdate({...settings, content: { ...(settings as BrandingConfig['details']).content, stonePrice: e.target.value }})}
                      />
                  </div>
              </div>
          </div>
      )}
      
      {/* Gold Border Toggle */}
      <div className="flex justify-between items-center py-2 border-t border-b border-slate-100">
         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gold Border</label>
         <label className="inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={settings.border || false} 
            onChange={(e) => onUpdate({...settings, border: e.target.checked})} 
            className="sr-only peer"
          />
          <div className="relative w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-400"></div>
        </label>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Position</label>
        <div className="grid grid-cols-2 gap-3">
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((pos) => (
            <button 
              key={pos}
              onClick={() => onUpdate({...settings, position: pos as LogoPosition})}
              className={`p-3 text-xs font-bold rounded-lg border transition ${settings.position === pos ? 'bg-emerald-950 text-white border-emerald-950' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-500'}`}
            >
              {pos.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Padding</label>
          <span className="text-xs font-bold text-emerald-900">{settings.padding}</span>
        </div>
        <input 
          type="range" min="0" max="100" value={settings.padding} 
          onChange={(e) => onUpdate({...settings, padding: parseInt(e.target.value)})}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{type === 'text' ? 'Font Size' : 'Size'}</label>
          <span className="text-xs font-bold text-emerald-900">{settings.size}%</span>
        </div>
        <input 
          type="range" min="5" max="50" value={settings.size} 
          onChange={(e) => onUpdate({...settings, size: parseInt(e.target.value)})}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opacity</label>
          <span className="text-xs font-bold text-emerald-900">{settings.opacity}%</span>
        </div>
        <input 
          type="range" min="10" max="100" value={settings.opacity} 
          onChange={(e) => onUpdate({...settings, opacity: parseInt(e.target.value)})}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
      </div>
    </div>
  </div>
);

const OverlayLayer = ({ settings, type = 'image' }: { settings: OverlaySettings | BrandingConfig['details'], type?: 'image' | 'text' }) => {
  if (!settings.enabled) return null;
  
  // Base styles for positioning
  const wrapperStyle: React.CSSProperties = {
      position: 'absolute',
      width: type === 'image' ? `${settings.size}%` : 'auto',
      opacity: settings.opacity / 100,
      zIndex: 10,
      pointerEvents: 'none',
      transition: 'all 0.2s ease-in-out',
  };
  
  if (settings.border && type === 'image') {
      wrapperStyle.border = '2px solid #fbbf24';
      wrapperStyle.borderRadius = '4px';
      wrapperStyle.padding = '4px';
  }
  
  const p = `${settings.padding / 10}%`; 
  if (settings.position === 'top-left') { wrapperStyle.top = p; wrapperStyle.left = p; }
  if (settings.position === 'top-right') { wrapperStyle.top = p; wrapperStyle.right = p; }
  if (settings.position === 'bottom-left') { wrapperStyle.bottom = p; wrapperStyle.left = p; }
  if (settings.position === 'bottom-right') { wrapperStyle.bottom = p; wrapperStyle.right = p; }

  if (type === 'text') {
      const detailSettings = settings as BrandingConfig['details'];
      return (
          <div style={{...wrapperStyle}} className={`bg-white shadow-lg p-4 min-w-[140px] ${settings.border ? 'border-2 border-amber-400' : ''}`}>
               <div className="flex flex-col space-y-1 font-luxury text-slate-800" style={{ fontSize: `${Math.max(10, settings.size)}px` }}>
                   {(detailSettings.content.goldWeight || detailSettings.content.goldPurity) && (
                       <div className="flex items-center space-x-2">
                           <span className="font-bold text-amber-600">Gold:</span>
                           <span>{detailSettings.content.goldWeight}g • {detailSettings.content.goldPurity}</span>
                       </div>
                   )}
                   {detailSettings.content.diamondCarat && (
                       <div className="flex items-center space-x-2">
                           <span className="font-bold text-amber-600">Diamond:</span>
                           <span>{detailSettings.content.diamondCarat} ct</span>
                       </div>
                   )}
                   {detailSettings.content.stonePrice && (
                       <div className="flex items-center space-x-2">
                           <span className="font-bold text-amber-600">Stone Charges:</span>
                           <span>{detailSettings.content.stonePrice}</span>
                       </div>
                   )}
               </div>
          </div>
      );
  }

  // Standard Image/Logo
  if (!settings.image) return null;
  return <img src={settings.image} alt="Overlay" style={wrapperStyle} />;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'history' | 'billing' | 'branding' | 'jewel-info' | 'documentation'>('generate');
  const [credits, setCredits] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [videoStatus, setVideoStatus] = useState("");
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [uploadedJewellery, setUploadedJewellery] = useState<string | null>(null);
  const [customModelImage, setCustomModelImage] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [config, setConfig] = useState<GenerationConfig>({
    jewelleryTypes: [JewelleryType.NECKLACE],
    modelSource: ModelSource.AI_GENERATED,
    modelStyle: ModelStyle.MODERN,
    regionalStyle: RegionalStyle.INTERNATIONAL,
    shotType: ShotType.MID_SHOT,
    skinTone: SkinTone.MEDIUM,
    ageRange: '25-35',
  });

  const [branding, setBranding] = useState<BrandingConfig>({
    logo: {
      image: null,
      position: 'bottom-right',
      padding: 24,
      size: 20,
      opacity: 100,
      enabled: true,
      border: false
    },
    jewellery: {
      image: null,
      position: 'top-right',
      padding: 24,
      size: 20,
      opacity: 100,
      enabled: true,
      border: true
    },
    details: {
      image: null, // Unused for details, but keeps type consistency
      position: 'bottom-left',
      padding: 24,
      size: 20,
      opacity: 95,
      enabled: true,
      border: true,
      content: {
        goldWeight: '22',
        goldPurity: '24K',
        stonePrice: '500',
        diamondCarat: '1.5'
      }
    }
  });

  const [generatedResults, setGeneratedResults] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'jewellery' | 'model' | 'branding-logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'jewellery') {
          setUploadedJewellery(result);
          // Sync jewellery upload to branding overlay
          setBranding(prev => ({
            ...prev,
            jewellery: { ...prev.jewellery, image: result }
          }));
        } else if (type === 'model') {
          setCustomModelImage(result);
        } else if (type === 'branding-logo') {
          setBranding(prev => ({ ...prev, logo: { ...prev.logo, image: result, enabled: true } }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async (dataUrl: string, filename: string) => {
    const isLogoActive = branding.logo.enabled && branding.logo.image;
    const isJewelleryActive = branding.jewellery.enabled && branding.jewellery.image;
    const isDetailsActive = branding.details.enabled;

    if (!isLogoActive && !isJewelleryActive && !isDetailsActive) {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Composite Overlays with Canvas
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const mainImg = new Image();
      mainImg.src = dataUrl;
      await new Promise(r => mainImg.onload = r);

      canvas.width = mainImg.width;
      canvas.height = mainImg.height;
      ctx.drawImage(mainImg, 0, 0);

      const drawOverlay = async (settings: OverlaySettings) => {
         if (!settings.image || !settings.enabled) return;
         
         const overlayImg = new Image();
         overlayImg.src = settings.image;
         await new Promise(r => overlayImg.onload = r);

         let drawX = 0, drawY = 0, drawW = 0, drawH = 0;
         const paddingPx = (canvas.width * settings.padding) / 1000;

         // Standard Overlay Logic
         const targetWidth = (canvas.width * settings.size) / 100;
         const scale = targetWidth / overlayImg.width;
         drawW = targetWidth;
         drawH = overlayImg.height * scale;

         let x = 0; let y = 0;
         if (settings.position === 'top-left') { x = paddingPx; y = paddingPx; }
         else if (settings.position === 'top-right') { x = canvas.width - drawW - paddingPx; y = paddingPx; }
         else if (settings.position === 'bottom-left') { x = paddingPx; y = canvas.height - drawH - paddingPx; }
         else if (settings.position === 'bottom-right') { x = canvas.width - drawW - paddingPx; y = canvas.height - drawH - paddingPx; }
         
         drawX = x;
         drawY = y;

         ctx.globalAlpha = settings.opacity / 100;
         
         // Draw Image
         ctx.drawImage(overlayImg, drawX, drawY, drawW, drawH);
         
         // Draw Border if enabled
         if (settings.border) {
             const borderPad = canvas.width * 0.005; 
             const lineWidth = canvas.width * 0.002;
             
             ctx.strokeStyle = '#fbbf24'; // Gold/Amber
             ctx.lineWidth = lineWidth;
             ctx.beginPath();
             ctx.rect(
                drawX - borderPad,
                drawY - borderPad,
                drawW + (borderPad * 2),
                drawH + (borderPad * 2)
             );
             ctx.stroke();
         }
         
         ctx.globalAlpha = 1.0;
      };

      const drawTextDetails = (settings: BrandingConfig['details']) => {
          if (!settings.enabled) return;

          const paddingPx = (canvas.width * settings.padding) / 1000;
          
          // Calculate font size based on image width and settings.size
          // Base scale reference: 1000px width
          const baseFontSize = (canvas.width / 1000) * (settings.size * 0.8 + 12); 
          const lineHeight = baseFontSize * 1.5;
          const boxPadding = baseFontSize * 1.2;

          ctx.font = `500 ${baseFontSize}px "Playfair Display", serif`;
          
          // Prepare lines
          const lines = [];
          if (settings.content.goldWeight || settings.content.goldPurity) {
            lines.push(`Gold: ${settings.content.goldWeight}g • ${settings.content.goldPurity}`);
          }
          if (settings.content.diamondCarat) {
             lines.push(`Diamond: ${settings.content.diamondCarat} ct`);
          }
          if (settings.content.stonePrice) {
             lines.push(`Stone Charges: ${settings.content.stonePrice}`);
          }

          if (lines.length === 0) return;

          // Measure widest line
          let maxTextWidth = 0;
          lines.forEach(line => {
              const m = ctx.measureText(line);
              if (m.width > maxTextWidth) maxTextWidth = m.width;
          });

          const boxW = maxTextWidth + (boxPadding * 2);
          const boxH = (lines.length * lineHeight) + (boxPadding * 2);

          let x = 0; let y = 0;
          if (settings.position === 'top-left') { x = paddingPx; y = paddingPx; }
          else if (settings.position === 'top-right') { x = canvas.width - boxW - paddingPx; y = paddingPx; }
          else if (settings.position === 'bottom-left') { x = paddingPx; y = canvas.height - boxH - paddingPx; }
          else if (settings.position === 'bottom-right') { x = canvas.width - boxW - paddingPx; y = canvas.height - boxH - paddingPx; }

          ctx.globalAlpha = settings.opacity / 100;

          // Background
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.rect(x, y, boxW, boxH);
          ctx.fill();

          // Border
          if (settings.border) {
              ctx.strokeStyle = '#fbbf24';
              ctx.lineWidth = canvas.width * 0.003;
              const borderOff = canvas.width * 0.005;
              ctx.strokeRect(x + borderOff, y + borderOff, boxW - (borderOff*2), boxH - (borderOff*2));
          }

          // Text
          ctx.fillStyle = '#1e293b'; // Slate 800
          ctx.textBaseline = 'top';
          
          lines.forEach((line, i) => {
              ctx.fillText(line, x + boxPadding, y + boxPadding + (i * lineHeight));
          });
          
          ctx.globalAlpha = 1.0;
      };

      // Draw layers
      await drawOverlay(branding.jewellery);
      await drawOverlay(branding.logo);
      drawTextDetails(branding.details);

      const compositeDataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = compositeDataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error compositing overlay:", e);
      alert("Failed to download image with overlays.");
    }
  };

  const handleCreateVideo = async (image: string) => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        const confirmSelection = window.confirm(
          "AI Video generation requires a paid API key from a billing-enabled Google Cloud project.\n\nWould you like to select one now?\n\nDocs: ai.google.dev/gemini-api/docs/billing"
        );
        if (confirmSelection) {
          await aistudio.openSelectKey();
        } else {
          return;
        }
      }
    }

    setIsVideoGenerating(true);
    setVideoStatus("Connecting to cinematic render farm...");
    setActiveVideoUrl(null);
    
    try {
      const videoUrl = await generateJewelleryVideo(image, (msg) => setVideoStatus(msg));
      setActiveVideoUrl(videoUrl);
    } catch (err: any) {
      if (err.message === "API_KEY_ERROR") {
        alert("The selected API key was not found or lacks permissions. Please re-select a valid paid API key via the dialog.");
        await (window as any).aistudio?.openSelectKey();
      } else {
        console.error("Video Generation Error:", err);
        alert(`Video generation failed: ${err.message || 'Unknown network error'}`);
      }
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedJewellery) {
      alert("Please upload a jewellery image.");
      return;
    }
    if (config.modelSource === ModelSource.CUSTOM_UPLOAD && !customModelImage) {
      alert("Please upload a model image for custom try-on.");
      return;
    }
    if (credits < 3) {
      alert("Insufficient credits. Please top up.");
      return;
    }

    setIsGenerating(true);
    try {
      const results = await generateJewelleryTryOn(uploadedJewellery, {
        ...config,
        customModelImage: customModelImage || undefined
      });
      setGeneratedResults(results);
      setCredits(prev => prev - 3);
      
      const newProject: Project = {
        id: Date.now().toString(),
        name: `${config.jewelleryTypes.join(', ')} - ${new Date().toLocaleDateString()}`,
        originalImage: uploadedJewellery,
        results: results,
        createdAt: Date.now(),
      };
      setProjects([newProject, ...projects]);
    } catch (err: any) {
      console.error("Full Error Object:", err);
      if (err.message === "MISSING_API_KEY") {
        alert("API Key is missing. Please configure GEMINI_API_KEY in your deployment settings.");
      } else if (err.status === 429 || err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        alert("Quota Exceeded: You have hit the rate limit for the Gemini API Free Tier.\n\nPlease wait a minute before trying again, or upgrade to a paid plan.");
      } else {
        // Show the actual error message to the user for debugging
        const errorMessage = err.message || err.toString() || "Unknown error";
        alert(`Generation failed: ${errorMessage}\n\nCheck console for more details.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-950 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-luxury font-bold tracking-tight text-amber-400">JewelVista AI</h1>
          <p className="text-xs text-emerald-300 mt-1 uppercase tracking-widest">Digital Jewellery Studio</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <button 
            onClick={() => setActiveTab('generate')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'generate' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-900'}`}
          >
            <Icons.Sparkles />
            <span className="font-medium">AI Try-On</span>
          </button>
          <button 
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'branding' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-900'}`}
          >
            <Icons.Settings />
            <span className="font-medium">Branding</span>
          </button>
          <button 
            onClick={() => setActiveTab('jewel-info')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'jewel-info' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-900'}`}
          >
            <Icons.Tag />
            <span className="font-medium">Jewel Info</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'history' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-900'}`}
          >
            <Icons.History />
            <span className="font-medium">My Gallery</span>
          </button>
          <button 
            onClick={() => setActiveTab('documentation')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'documentation' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-900'}`}
          >
            <Icons.Docs />
            <span className="font-medium">Documentation</span>
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'billing' ? 'bg-emerald-800 text-white' : 'text-emerald-100 hover:bg-emerald-900'}`}
          >
            <Icons.Credits />
            <span className="font-medium">Pricing</span>
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-emerald-900/50 rounded-xl p-4 border border-emerald-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-emerald-300">Available Credits</span>
              <span className="text-sm font-bold text-amber-400">{credits}</span>
            </div>
            <div className="w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-400 h-full" style={{ width: `${(credits/50) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800 font-luxury tracking-wide">{activeTab.toUpperCase().replace('-', ' ')}</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-slate-100 rounded-full px-3 py-1 text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Workspace Active
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'generate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Jewellery Upload */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">1. Jewellery Upload</h3>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-emerald-500 transition cursor-pointer relative group">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" accept="image/*" onChange={(e) => handleFileUpload(e, 'jewellery')} />
                    {uploadedJewellery ? (
                      <div className="space-y-4">
                        <img src={uploadedJewellery} alt="Jewellery" className="mx-auto max-h-48 rounded-lg shadow-sm" />
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Click to replace</p>
                      </div>
                    ) : (
                      <div className="py-8 space-y-2">
                        <div className="flex justify-center text-slate-300 group-hover:text-emerald-500 transition"><Icons.Upload /></div>
                        <p className="text-sm text-slate-400 font-medium">Click or drag jewellery photo</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Model Configuration */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-8">
                  <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider">2. AI Model Config</h3>
                  
                  <Selector label="Jewellery Types" options={Object.values(JewelleryType)} current={config.jewelleryTypes} multi={true} onChange={(val) => setConfig({...config, jewelleryTypes: val})} />
                  
                  <Selector label="Model Source" options={Object.values(ModelSource)} current={config.modelSource} onChange={(val) => setConfig({...config, modelSource: val})} />
                  
                  {config.modelSource === ModelSource.CUSTOM_UPLOAD ? (
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Custom Model</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-500 transition cursor-pointer relative group">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" accept="image/*" onChange={(e) => handleFileUpload(e, 'model')} />
                        {customModelImage ? (
                          <img src={customModelImage} alt="Model" className="mx-auto max-h-32 rounded-lg" />
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-center text-slate-300 group-hover:text-emerald-500 transition"><Icons.Model /></div>
                            <p className="text-xs text-slate-400">Upload your own person photo</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-6">
                        <Selector label="Regional Style" options={Object.values(RegionalStyle)} current={config.regionalStyle} onChange={(val) => setConfig({...config, regionalStyle: val})} />
                        <Selector label="Shot Type" options={Object.values(ShotType)} current={config.shotType} onChange={(val) => setConfig({...config, shotType: val})} />
                      </div>

                      <div className="grid grid-cols-2 gap-6 items-start">
                        <SkinToneSelector current={config.skinTone} onChange={(val) => setConfig({...config, skinTone: val})} />
                        <Selector label="Age Range" options={['18-25', '25-35', '35-50', '50+']} current={config.ageRange} onChange={(val) => setConfig({...config, ageRange: val})} />
                      </div>
                    </>
                  )}

                  <Selector label="Model Aesthetic" options={Object.values(ModelStyle)} current={config.modelStyle} onChange={(val) => setConfig({...config, modelStyle: val})} />

                  <button 
                    disabled={isGenerating || !uploadedJewellery || (config.modelSource === ModelSource.CUSTOM_UPLOAD && !customModelImage)} 
                    onClick={handleGenerate} 
                    className="w-full py-4 bg-emerald-950 text-white rounded-xl font-bold hover:bg-emerald-900 transition disabled:opacity-50 shadow-lg active:scale-95"
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Rendering AI Model...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Icons.Sparkles />
                        <span>Generate Try-On</span>
                      </div>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">Cost: 3 Credits • Ultra HD</p>
                </div>
              </div>

              {/* Preview Panel */}
              <div className="lg:col-span-7">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[500px] flex flex-col">
                  <h3 className="text-sm font-bold text-slate-800 uppercase mb-6 tracking-wider">Generated Result</h3>
                  {isGenerating ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-pulse">
                      <div className="w-full aspect-[3/4] bg-slate-100 rounded-2xl"></div>
                      <p className="text-slate-400 text-sm font-medium">Matching lighting & textures...</p>
                    </div>
                  ) : generatedResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {generatedResults.map((img, idx) => (
                        <div key={idx} className="group relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                          <img src={img} alt={`Result ${idx}`} className="w-full h-full object-cover aspect-[3/4] transition duration-500 group-hover:scale-105" />
                          
                          <OverlayLayer settings={branding.logo} />
                          <OverlayLayer settings={branding.jewellery} />
                          <OverlayLayer settings={branding.details} type="text" />

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center p-6 space-y-4">
                            <p className="text-white text-[10px] uppercase font-bold tracking-widest">Premium Commercial Shot</p>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleCreateVideo(img); }} 
                              className="bg-amber-400 text-emerald-950 px-6 py-3 rounded-xl text-xs font-bold hover:bg-amber-500 w-full shadow-lg transform transition active:scale-95"
                            >
                              CREATE AI VIDEO
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDownload(img, `jewelvista-${idx}.png`); }} 
                              className="bg-white text-emerald-950 px-6 py-3 rounded-xl text-xs font-bold hover:bg-slate-100 w-full shadow-lg transform transition active:scale-95"
                            >
                              DOWNLOAD 4K
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 space-y-4 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center scale-150"><Icons.Sparkles /></div>
                      <div>
                        <p className="text-lg font-luxury font-bold text-slate-400">Your vision starts here</p>
                        <p className="text-sm text-slate-300 max-w-xs mx-auto">Configure your model and upload jewellery to see premium digital results.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-5 space-y-6">
                  <BrandingControl 
                    title="Brand Logo" 
                    settings={branding.logo} 
                    onUpdate={(s) => setBranding(prev => ({...prev, logo: s}))}
                    onUpload={(e) => handleFileUpload(e, 'branding-logo')}
                  />
               </div>

               <div className="lg:col-span-7 h-fit lg:sticky lg:top-20">
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[500px] flex flex-col items-center justify-center relative bg-slate-50">
                    <h3 className="absolute top-6 left-6 text-sm font-bold text-slate-800 uppercase tracking-wider">Live Preview</h3>
                    <div className="relative w-full max-w-md aspect-[3/4] bg-slate-200 rounded-xl overflow-hidden shadow-lg">
                      {uploadedJewellery ? (
                         <img src={uploadedJewellery} className="w-full h-full object-cover opacity-50 grayscale" alt="Preview Background" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-400">Preview Image</div>
                      )}
                      
                      <OverlayLayer settings={branding.logo} />
                      <OverlayLayer settings={branding.jewellery} />
                      <OverlayLayer settings={branding.details} type="text" />
                    </div>
                    <p className="mt-4 text-xs text-slate-400">These overlays will be applied to all future downloads.</p>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'jewel-info' && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-5 space-y-6">
                  <BrandingControl 
                    title="Jewellery Overlay" 
                    settings={branding.jewellery} 
                    onUpdate={(s) => setBranding(prev => ({...prev, jewellery: s}))}
                    disableUpload={true}
                  />

                  <BrandingControl 
                    title="Jewellery Information" 
                    settings={branding.details} 
                    onUpdate={(s) => setBranding(prev => ({...prev, details: s}))}
                    type="text"
                  />
               </div>

               <div className="lg:col-span-7 h-fit lg:sticky lg:top-20">
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[500px] flex flex-col items-center justify-center relative bg-slate-50">
                    <h3 className="absolute top-6 left-6 text-sm font-bold text-slate-800 uppercase tracking-wider">Live Preview</h3>
                    <div className="relative w-full max-w-md aspect-[3/4] bg-slate-200 rounded-xl overflow-hidden shadow-lg">
                      {uploadedJewellery ? (
                         <img src={uploadedJewellery} className="w-full h-full object-cover opacity-50 grayscale" alt="Preview Background" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-400">Preview Image</div>
                      )}
                      
                      <OverlayLayer settings={branding.logo} />
                      <OverlayLayer settings={branding.jewellery} />
                      <OverlayLayer settings={branding.details} type="text" />
                    </div>
                    <p className="mt-4 text-xs text-slate-400">These overlays will be applied to all future downloads.</p>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'history' && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {projects.length > 0 ? projects.map(project => (
                <div key={project.id} className="bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition group">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 mb-4">
                    <img src={project.results[0]} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  </div>
                  <div className="text-sm font-bold text-slate-800 truncate">{project.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{new Date(project.createdAt).toLocaleDateString()}</div>
                  <button onClick={() => {
                    setGeneratedResults(project.results); 
                    setUploadedJewellery(project.originalImage); 
                    setBranding(prev => ({
                      ...prev,
                      jewellery: { ...prev.jewellery, image: project.originalImage }
                    }));
                    setActiveTab('generate')
                  }} className="mt-4 w-full py-2 bg-slate-50 border border-slate-100 text-[10px] text-emerald-950 font-bold rounded-lg hover:bg-emerald-50 transition uppercase tracking-widest">RE-EDIT PROJECT</button>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center opacity-40">
                  <p className="font-luxury text-xl">Empty Gallery</p>
                  <p className="text-sm">Start generating to see your past projects here.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documentation' && (
            <div className="max-w-5xl mx-auto space-y-12 pb-12">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-luxury font-bold text-slate-800">Platform Documentation</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">
                  A comprehensive guide to using JewelVista AI for creating premium digital commerce visuals.
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                 <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xl font-bold text-slate-800 font-luxury">Getting Started</h3>
                 </div>
                 <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-800">Upload Jewellery</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Navigate to the <span className="font-semibold text-emerald-700">AI Try-On</span> tab. Upload a high-resolution image of your jewellery piece (necklace, earrings, ring, etc.) on a white or transparent background.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-800">Configure AI Model</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Select the <span className="font-semibold">Model Source</span>. You can either use our AI Generative Engine to create a model based on regional style, skin tone, and age, or upload your own custom model photo.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-800">Generate & Edit</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Click <span className="font-semibold">Generate Try-On</span>. Once the result is ready, you can apply branding, jewellery details, or convert the image into a cinematic video.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-100 rounded-xl p-6 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                        <div className="text-center space-y-3">
                            <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <Icons.Sparkles />
                            </div>
                            <p className="text-xs font-bold uppercase tracking-wider">Figure 1: Generation Workflow</p>
                            <div className="w-32 h-2 bg-slate-200 rounded-full mx-auto"></div>
                            <div className="w-24 h-2 bg-slate-200 rounded-full mx-auto"></div>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                     <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800 font-luxury">Branding & Info</h3>
                     </div>
                     <div className="p-6 flex-1 space-y-4">
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Personalize your outputs in the <span className="font-semibold text-emerald-700">Branding</span> and <span className="font-semibold text-emerald-700">Jewel Info</span> tabs.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3 text-sm text-slate-600">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                                <span><span className="font-bold text-slate-800">Brand Logo:</span> Upload your transparent PNG logo to watermark images.</span>
                            </li>
                            <li className="flex items-start space-x-3 text-sm text-slate-600">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                                <span><span className="font-bold text-slate-800">Jewellery Overlay:</span> Add a close-up inset of the original product.</span>
                            </li>
                            <li className="flex items-start space-x-3 text-sm text-slate-600">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                                <span><span className="font-bold text-slate-800">Jewel Information:</span> Display dynamic pricing, gold weight, and diamond details directly on the image.</span>
                            </li>
                        </ul>
                     </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                     <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800 font-luxury">Cinematic Video</h3>
                     </div>
                     <div className="p-6 flex-1 space-y-4">
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Turn any generated image into a 720p motion video using the <span className="font-bold">Veo 3.1</span> engine.
                        </p>
                        <div className="bg-slate-900 rounded-xl p-4 text-white text-xs space-y-2">
                             <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="font-bold opacity-75">Recording...</span>
                             </div>
                             <p className="opacity-50">"Cinematic jewelry commercial. A professional fashion model elegantly showcasing the fine jewelry..."</p>
                        </div>
                        <p className="text-xs text-slate-400 italic">
                            *Requires a paid Google Cloud API key with Veo permissions enabled.
                        </p>
                     </div>
                  </div>
              </div>

              <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl text-slate-400 p-8">
                 <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-widest font-luxury border-b border-slate-800 pb-4">Technical Summary</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                    <div>
                        <h4 className="text-emerald-400 font-bold mb-2">Frontend Architecture</h4>
                        <ul className="space-y-1">
                            <li>• React 19.2.4 (Component-based UI)</li>
                            <li>• Tailwind CSS (Utility-first styling)</li>
                            <li>• Canvas API (Real-time image compositing)</li>
                            <li>• Lucide / Heroicons (SVG Icons)</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-emerald-400 font-bold mb-2">AI & Backend Services</h4>
                        <ul className="space-y-1">
                            <li>• Google Gemini 2.5 Flash (Image Generation)</li>
                            <li>• Google Veo 3.1 (Video Generation)</li>
                            <li>• PHP 8.0+ (Data Persistence)</li>
                            <li>• MySQL (Project History Storage)</li>
                        </ul>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="max-w-4xl mx-auto py-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-luxury font-bold text-slate-800 mb-4">Upgrade Your Studio</h2>
                <p className="text-slate-500">Scale your digital production with flexible credit packages.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { name: 'Starter', price: '₹999', credits: 50 },
                  { name: 'Professional', price: '₹2,999', credits: 200, popular: true },
                  { name: 'Enterprise', price: '₹9,999', credits: 1000 }
                ].map((plan, i) => (
                  <div key={i} className={`bg-white rounded-3xl p-8 border ${plan.popular ? 'border-amber-400 ring-4 ring-amber-50 shadow-xl' : 'border-slate-200'} text-center`}>
                    <h4 className="font-bold text-slate-800 uppercase tracking-widest text-xs mb-4">{plan.name}</h4>
                    <div className="text-4xl font-bold text-slate-800 mb-2">{plan.price}</div>
                    <div className="text-emerald-600 font-bold mb-8">{plan.credits} Credits</div>
                    <button className={`w-full py-3 rounded-xl font-bold transition ${plan.popular ? 'bg-amber-400 text-emerald-950 hover:bg-amber-500' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}>
                      {plan.popular ? 'UPGRADE NOW' : 'CHOOSE PLAN'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Video Generation Overlay */}
      {(isVideoGenerating || activeVideoUrl) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/90 backdrop-blur-xl p-4">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden border border-white/20">
            {isVideoGenerating ? (
              <div className="text-center py-10 space-y-10">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-[8px] border-emerald-50 rounded-full"></div>
                  <div className="absolute inset-0 border-[8px] border-amber-400 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-amber-500 scale-150 animate-pulse"><Icons.Sparkles /></div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-luxury font-bold text-slate-800 tracking-tight">{videoStatus}</h3>
                  <p className="text-slate-500 max-w-md mx-auto leading-relaxed text-sm">Synthesizing a high-end cinematic video using Veo 3.1 Fast Preview. This usually takes 1-2 minutes.</p>
                </div>
                <div className="flex justify-center space-x-1.5">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-luxury font-bold text-slate-800">Cinematic Result</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Generated via Veo 3.1 HD Engine</p>
                  </div>
                  <button onClick={() => setActiveVideoUrl(null)} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-2xl bg-black aspect-[9/16] max-h-[55vh] mx-auto border-4 border-slate-50 ring-1 ring-slate-200">
                  <video src={activeVideoUrl!} className="w-full h-full object-contain" controls autoPlay loop playsInline />
                </div>
                <div className="flex flex-col md:flex-row gap-3 pt-4">
                  <button 
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = activeVideoUrl!;
                      a.download = "jewelvista-commercial.mp4";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }} 
                    className="flex-1 py-4 bg-emerald-950 text-white rounded-xl font-bold hover:bg-emerald-900 transition shadow-xl active:scale-95 flex items-center justify-center space-x-2"
                  >
                    <Icons.Download />
                    <span>DOWNLOAD HD MP4</span>
                  </button>
                  <button onClick={() => setActiveVideoUrl(null)} className="px-8 py-4 bg-slate-100 text-slate-800 rounded-xl font-bold hover:bg-slate-200 transition">
                    DISMISS
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
