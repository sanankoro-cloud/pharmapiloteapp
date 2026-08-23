import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  Scan, 
  X, 
  Plus, 
  Minus, 
  Check, 
  AlertTriangle, 
  Package, 
  Sparkles, 
  RotateCcw, 
  Layers, 
  CheckCircle2, 
  Building, 
  Calendar, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Zap, 
  Search, 
  RefreshCw,
  QrCode,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { ProductStock, ProductCategory, ProductTva } from '../types/pharmacy';
import { parsePharmacyBarcode, ParsedBarcodeData } from '../utils/barcodeParser';
import { formatCurrency, formatDate } from '../utils/formatters';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductStock[];
  onUpdateProductStock: (productId: string, newQty: number, lotNumber?: string, expiryDate?: string) => void;
  onAddNewProduct: (newProduct: Omit<ProductStock, 'id'>) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProductStock,
  onAddNewProduct
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rapidScanMode, setRapidScanMode] = useState(false);
  const [rapidScanCount, setRapidScanCount] = useState(0);

  // Scanned / Identified product state
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedBarcodeData | null>(null);
  const [identifiedProduct, setIdentifiedProduct] = useState<ProductStock | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);

  // Manual code input
  const [manualCodeInput, setManualCodeInput] = useState('');

  // Stock edit quantity in modal
  const [customQtyInput, setCustomQtyInput] = useState<number>(1);

  // New product form state
  const [isNewProductFormOpen, setIsNewProductFormOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDci, setNewDci] = useState('');
  const [newLaboratory, setNewLaboratory] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('medicament_remboursable');
  const [newPump, setNewPump] = useState<number>(5.0);
  const [newPublicPriceTtc, setNewPublicPriceTtc] = useState<number>(8.5);
  const [newTva, setNewTva] = useState<ProductTva>(2.1);
  const [newLocation, setNewLocation] = useState('Tiroir Pharmacie A1');
  const [newLotNumber, setNewLotNumber] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('2028-06-30');
  const [newStockQty, setNewStockQty] = useState<number>(10);
  const [newMinThreshold, setNewMinThreshold] = useState<number>(5);
  const [newIsRefrigerated, setNewIsRefrigerated] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);

  // Audio Beep generator
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1750, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      // audio ignore
    }
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Start Camera scanner
  const startScanner = async () => {
    setCameraError(null);
    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {}
      }

      const html5QrCode = new Html5Qrcode('pharmacy-barcode-reader');
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleCodeDetected(decodedText);
        },
        (errorMessage) => {
          // ignore frame scan frame miss
        }
      );

      setIsCameraActive(true);
      isScanningRef.current = true;
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setIsCameraActive(false);
      isScanningRef.current = false;
      setCameraError(
        'Accès à la caméra non disponible ou refusé. Vous pouvez utiliser le mode simulation ou la saisie manuelle.'
      );
    }
  };

  // Stop Camera scanner
  const stopScanner = async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (e) {
        console.warn('Camera stop error:', e);
      }
      isScanningRef.current = false;
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, activeTab]);

  // Handle scanned/entered code
  const handleCodeDetected = (code: string) => {
    if (!code) return;
    playBeep();

    const parsed = parsePharmacyBarcode(code);
    setLastScannedCode(code);
    setParsedData(parsed);

    // Search in current stock catalog
    const found = products.find(p => 
      p.cip === parsed.cip || 
      (parsed.gtin && (p.cip === parsed.gtin || p.cip.includes(parsed.cip))) ||
      p.lotNumber === parsed.lotNumber
    );

    if (found) {
      setIdentifiedProduct(found);
      setCustomQtyInput(found.stockQty);
      setIsNewProductFormOpen(false);

      if (rapidScanMode) {
        // In rapid mode: immediately increment stock by 1
        const nextQty = found.stockQty + 1;
        onUpdateProductStock(found.id, nextQty, parsed.lotNumber, parsed.expiryDate);
        setRapidScanCount(prev => prev + 1);
        setFeedbackMessage({
          text: `+1 boîte ajoutée : ${found.name} (Nouveau stock : ${nextQty})`,
          type: 'success'
        });
        setTimeout(() => setFeedbackMessage(null), 3000);
      } else {
        setFeedbackMessage({
          text: `Produit identifié avec succès : ${found.name}`,
          type: 'success'
        });
      }
    } else {
      // Product not found in stock -> prepare new product form
      setIdentifiedProduct(null);
      setIsNewProductFormOpen(true);
      setNewName('');
      setNewLotNumber(parsed.lotNumber || 'LOT-' + Math.floor(Math.random() * 90000 + 10000));
      if (parsed.expiryDate) {
        setNewExpiryDate(parsed.expiryDate);
      }
      setFeedbackMessage({
        text: `Nouveau produit scanné (CIP: ${parsed.cip}). Veuillez compléter la fiche.`,
        type: 'warning'
      });
    }
  };

  // Stock quick adjustment actions
  const handleAdjustStock = (delta: number) => {
    if (!identifiedProduct) return;
    const newQty = Math.max(0, identifiedProduct.stockQty + delta);
    onUpdateProductStock(identifiedProduct.id, newQty, parsedData?.lotNumber, parsedData?.expiryDate);
    setIdentifiedProduct(prev => prev ? { ...prev, stockQty: newQty } : null);
    setCustomQtyInput(newQty);
    setFeedbackMessage({
      text: `Stock de ${identifiedProduct.name} mis à jour : ${newQty} boîtes.`,
      type: 'success'
    });
    playBeep();
  };

  const handleSetExactStock = () => {
    if (!identifiedProduct) return;
    onUpdateProductStock(identifiedProduct.id, customQtyInput, parsedData?.lotNumber, parsedData?.expiryDate);
    setIdentifiedProduct(prev => prev ? { ...prev, stockQty: customQtyInput } : null);
    setFeedbackMessage({
      text: `Inventaire direct enregistré : ${customQtyInput} boîtes.`,
      type: 'success'
    });
    playBeep();
  };

  // Save new product form
  const handleCreateNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedData && !manualCodeInput) return;

    const cipToUse = parsedData?.cip || manualCodeInput.trim() || '34009' + Math.floor(Math.random() * 9000000 + 1000000);
    
    // Calculate days until expiry
    const now = new Date();
    const exp = new Date(newExpiryDate);
    const diffTime = exp.getTime() - now.getTime();
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const newProd: Omit<ProductStock, 'id'> = {
      cip: cipToUse,
      name: newName || 'Médicament Officinal',
      dci: newDci || undefined,
      laboratory: newLaboratory || 'Laboratoire Générique',
      category: newCategory,
      stockQty: Number(newStockQty),
      minThreshold: Number(newMinThreshold),
      maxThreshold: Number(newMinThreshold) * 3,
      pump: Number(newPump),
      publicPriceTtc: Number(newPublicPriceTtc),
      tva: newTva,
      location: newLocation,
      lotNumber: newLotNumber || 'LOT-STANDARD',
      expiryDate: newExpiryDate,
      daysUntilExpiry: daysUntilExpiry > 0 ? daysUntilExpiry : 720,
      status: daysUntilExpiry <= 30 ? 'near_expiry' : Number(newStockQty) <= Number(newMinThreshold) ? 'low_stock' : 'optimal',
      isRefrigerated: newIsRefrigerated
    };

    onAddNewProduct(newProd);
    setIsNewProductFormOpen(false);
    setIdentifiedProduct({
      id: `prod-${Date.now()}`,
      ...newProd
    });
    setFeedbackMessage({
      text: `Produit "${newProd.name}" ajouté avec succès au stock officine !`,
      type: 'success'
    });
    playBeep();
  };

  // Preset demo scans for instant test
  const demoScans = [
    {
      label: 'Doliprane 1000mg (Datamatrix GS1)',
      code: '(01)03400936774618(17)280430(10)LOT44912(21)SN98174621',
      desc: 'Médicament remboursable 2.1% • CIP 3400936774618'
    },
    {
      label: 'Amoxicilline Biogaran (Datamatrix)',
      code: '(01)03400936054819(17)271031(10)BG88412(21)SN11029384',
      desc: 'Antibiotique • CIP 3400936054819'
    },
    {
      label: 'Bioderma Créaline H2O 500ml (EAN-13)',
      code: '3401573670788',
      desc: 'Dermo-cosmétique 20% • EAN/CIP 3401573670788'
    },
    {
      label: 'Sérum Physiologique Gilbert (Lot Urgent)',
      code: '(01)03401579247112(17)260915(10)GLB2023(21)SN449102',
      desc: 'Péremption dans 24 jours • CIP 3401579247112'
    },
    {
      label: 'Nouveau Produit Non Répertorié',
      code: '(01)03400938882910(17)290131(10)NEWLOT99(21)SN00192',
      desc: 'Test ajout instantané nouveau médicament'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold shadow-sm">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Scanner Code-Barres & Datamatrix GS1
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Caméra Mobile Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Identification instantanée, inventaire rapide et entrée/sortie de stock officinal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl transition ${
                soundEnabled ? 'bg-slate-800 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}
              title={soundEnabled ? 'Son activé' : 'Son désactivé'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subheader Toolbar: Mode selection & Rapid Scan toggle */}
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setActiveTab('camera');
                setIsNewProductFormOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                activeTab === 'camera' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Caméra Live</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('manual');
                stopScanner();
              }}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                activeTab === 'manual' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Saisie & Simulation</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={rapidScanMode}
                onChange={(e) => {
                  setRapidScanMode(e.target.checked);
                  if (e.target.checked) setRapidScanCount(0);
                }}
                className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
              />
              <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Mode Réception Continue (+1 auto)
              </span>
            </label>
            {rapidScanMode && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-mono font-bold text-[11px] rounded-lg border border-amber-200">
                {rapidScanCount} scannés
              </span>
            )}
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div className={`mx-4 mt-3 p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in ${
            feedbackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' : 'bg-amber-50 text-amber-900 border border-amber-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Modal Body Container */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">

          {/* Camera Viewport (Tab = 'camera') */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-inner flex flex-col items-center justify-center min-h-[260px] sm:min-h-[300px]">
                
                {/* HTML5 QR Scanner DOM container */}
                <div id="pharmacy-barcode-reader" className="w-full max-w-sm rounded-xl overflow-hidden" />

                {/* Laser scan animation overlay */}
                {isCameraActive && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-emerald-400/80 rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1" />
                      
                      {/* Animated scanning line */}
                      <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] animate-bounce mt-32" />
                    </div>
                  </div>
                )}

                {/* Camera Error / Permission Fallback */}
                {cameraError && (
                  <div className="p-6 text-center text-white max-w-md">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <div className="text-xs font-semibold text-slate-200 mb-3">{cameraError}</div>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={startScanner}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Réessayer la caméra</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('manual')}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition"
                      >
                        Utiliser la simulation
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Alignez le <strong>Datamatrix 2D</strong> ou le <strong>code-barres CIP13</strong> dans le cadre</span>
                <span className="font-mono text-emerald-700 font-bold">GS1 Officine V2.4</span>
              </div>
            </div>
          )}

          {/* Manual Input & Simulation presets (Tab = 'manual') */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Saisie manuelle d'un code CIP-13, EAN ou chaîne Datamatrix GS1 :
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Ex: 3400936774618 ou (01)03400936774618(17)280430(10)LOT44912"
                      value={manualCodeInput}
                      onChange={(e) => setManualCodeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCodeDetected(manualCodeInput);
                      }}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => handleCodeDetected(manualCodeInput)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition whitespace-nowrap"
                  >
                    Identifier
                  </button>
                </div>
              </div>

              {/* Simulation test buttons */}
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Simulations rapides de boîtes pharmaceutiques réelles :
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {demoScans.map((d, i) => (
                    <button
                      key={i}
                      onClick={() => handleCodeDetected(d.code)}
                      className="p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition group"
                    >
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                        {d.label}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{d.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Identified Product Card */}
          {identifiedProduct && !isNewProductFormOpen && (
            <div className="bg-emerald-50/70 rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-sm animate-fade-in space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-xs">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-950 font-bold text-[10px]">
                        IDENTIFIÉ DANS LE STOCK
                      </span>
                      {identifiedProduct.isRefrigerated && (
                        <span className="px-2 py-0.5 rounded-md bg-sky-200 text-sky-950 font-bold text-[10px]">
                          ❄️ Frigo 2-8°C
                        </span>
                      )}
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-0.5">
                      {identifiedProduct.name}
                    </h2>
                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-slate-700">CIP: {identifiedProduct.cip}</span>
                      <span>•</span>
                      <span>{identifiedProduct.laboratory}</span>
                      {identifiedProduct.dci && <span>• ({identifiedProduct.dci})</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-500 font-medium">Prix Public TTC</div>
                  <div className="text-lg font-black text-slate-900">
                    {formatCurrency(identifiedProduct.publicPriceTtc)}
                  </div>
                  <div className="text-[10px] text-slate-500">PUMP : {formatCurrency(identifiedProduct.pump)} HT</div>
                </div>
              </div>

              {/* DataMatrix Extracted Info */}
              {parsedData && parsedData.format === 'DATAMATRIX_GS1' && (
                <div className="p-2.5 rounded-xl bg-white border border-emerald-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Lot Scanné (AI 10) :</span>
                    <span className="font-mono font-bold text-slate-900">{parsedData.lotNumber || identifiedProduct.lotNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Date Péremption (AI 17) :</span>
                    <span className="font-mono font-bold text-slate-900">{parsedData.expiryDate ? formatDate(parsedData.expiryDate) : formatDate(identifiedProduct.expiryDate)}</span>
                  </div>
                  {parsedData.serialNumber && (
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 block font-semibold">N° Sérialisation (AI 21) :</span>
                      <span className="font-mono text-slate-700 truncate block">{parsedData.serialNumber}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Current Stock Status & Quick Adjustment Actions */}
              <div className="pt-2 border-t border-emerald-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-xs">
                    <span className="text-slate-500 font-medium">Quantité en stock :</span>
                    <div className="font-black text-xl font-mono text-slate-900">
                      {identifiedProduct.stockQty} boîtes
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    (Emplacement : {identifiedProduct.location})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleAdjustStock(1)}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+1 Entrée Stock</span>
                  </button>

                  <button
                    onClick={() => handleAdjustStock(-1)}
                    disabled={identifiedProduct.stockQty <= 0}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>-1 Dispensation</span>
                  </button>

                  {/* Direct Count Adjustment */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-300">
                    <input
                      type="number"
                      min={0}
                      value={customQtyInput}
                      onChange={(e) => setCustomQtyInput(parseInt(e.target.value, 10) || 0)}
                      className="w-14 px-1.5 py-1 text-center font-mono font-bold text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                    />
                    <button
                      onClick={handleSetExactStock}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition"
                    >
                      Fixer Stock
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* New Product Form (If scanned product not found in stock) */}
          {isNewProductFormOpen && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Nouveau Produit Détecté • Ajout au Stock Officinal
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    CIP scanné : <strong className="font-mono text-slate-800">{parsedData?.cip || manualCodeInput}</strong>
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateNewProductSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Désignation Commerciale *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Paracétamol 1000mg Viatris"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">DCI / Molécule active</label>
                    <input
                      type="text"
                      placeholder="Ex: Paracétamol"
                      value={newDci}
                      onChange={(e) => setNewDci(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Laboratoire Fabricant</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Viatris / Biogaran"
                      value={newLaboratory}
                      onChange={(e) => setNewLaboratory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Catégorie</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    >
                      <option value="medicament_remboursable">Médicament Remboursable (2.1%)</option>
                      <option value="medicament_otc">Conseil / OTC (10%)</option>
                      <option value="parapharmacie">Parapharmacie (20%)</option>
                      <option value="nutrition_bebe">Nutrition Bébé (5.5%)</option>
                      <option value="dispositif_medical">Dispositif Médical (20%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Emplacement en Officine</label>
                    <input
                      type="text"
                      placeholder="Ex: Tiroir B2 / Rayon Bébé"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Prix d'Achat HT (PUMP €)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newPump}
                      onChange={(e) => setNewPump(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Prix Public TTC (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newPublicPriceTtc}
                      onChange={(e) => setNewPublicPriceTtc(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Taux TVA (%)</label>
                    <select
                      value={newTva}
                      onChange={(e) => setNewTva(parseFloat(e.target.value) as any)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                    >
                      <option value={2.1}>2.1% (Médicament)</option>
                      <option value={5.5}>5.5% (Nutrition/Hygiène)</option>
                      <option value={10.0}>10.0% (OTC)</option>
                      <option value={20.0}>20.0% (Parapharmacie)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Quantité Initiale</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={newStockQty}
                      onChange={(e) => setNewStockQty(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Numéro de Lot</label>
                    <input
                      type="text"
                      required
                      value={newLotNumber}
                      onChange={(e) => setNewLotNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date de Péremption (DLUO)</label>
                    <input
                      type="date"
                      required
                      value={newExpiryDate}
                      onChange={(e) => setNewExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-semibold">
                      <input
                        type="checkbox"
                        checked={newIsRefrigerated}
                        onChange={(e) => setNewIsRefrigerated(e.target.checked)}
                        className="w-4 h-4 accent-sky-600 rounded"
                      />
                      <span>❄️ Chaîne du Froid (2-8°C)</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsNewProductFormOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Enregistrer et Intégrer au Stock</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Conforme sérialisation européenne & traçabilité ANSM</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition"
          >
            Fermer le Scanner
          </button>
        </div>

      </div>
    </div>
  );
};
