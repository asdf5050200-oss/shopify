import React, { useState } from 'react';
import { Sparkles, Trash2, Loader2, Wand2, Eraser, Check, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { optimizeImage } from '../services/gemini';
import { cn } from '../lib/utils';

interface ImageOptimizerProps {
  products: Product[];
  onUpdateProduct: (id: string, newUrl: string, newBase64: string) => void;
  onClose: () => void;
}

export const ImageOptimizer: React.FC<ImageOptimizerProps> = ({ products, onUpdateProduct, onClose }) => {
  const [selectedId, setSelectedId] = useState<string | null>(products[0]?.id || null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedProduct = products.find(p => p.id === selectedId);

  const handleOptimize = async (task: 'remove-bg' | 'enhance') => {
    if (!selectedProduct || !selectedProduct.base64) return;

    setIsOptimizing(true);
    setError(null);
    setSuccess(null);

    try {
      const optimizedUrl = await optimizeImage(
        selectedProduct.base64,
        selectedProduct.mimeType || 'image/png',
        task
      );
      
      const base64Data = optimizedUrl.split(',')[1];
      onUpdateProduct(selectedProduct.id, optimizedUrl, base64Data);
      setSuccess(`Image ${task === 'remove-bg' ? 'background removed' : 'enhanced'} successfully!`);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to optimize image.");
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
    >
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-medium tracking-tight">图片智能优化 (Image Optimizer)</h2>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">AI-Powered Enhancement & Background Removal</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Sidebar - Product List */}
          <div className="w-full lg:w-72 border-r border-slate-100 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-2">Select Asset</h3>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    "relative aspect-square rounded-xl overflow-hidden border-2 transition-all group",
                    selectedId === p.id ? "border-slate-900 ring-4 ring-slate-900/5" : "border-transparent hover:border-slate-200"
                  )}
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  {selectedId === p.id && (
                    <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8 overflow-y-auto bg-white">
            {selectedProduct ? (
              <div className="h-full flex flex-col gap-8">
                <div className="flex-1 min-h-[300px] bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-100 group">
                  <img 
                    src={selectedProduct.url} 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-contain p-8"
                    referrerPolicy="no-referrer"
                  />
                  {isOptimizing && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
                      <p className="text-sm font-medium text-slate-900 uppercase tracking-widest">AI Processing...</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => handleOptimize('remove-bg')}
                      disabled={isOptimizing}
                      className="flex-1 min-w-[200px] flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      <Eraser className="w-4 h-4" />
                      一键抠图 (Remove Background)
                    </button>
                    <button
                      onClick={() => handleOptimize('enhance')}
                      disabled={isOptimizing}
                      className="flex-1 min-w-[200px] flex items-center justify-center gap-3 py-5 border-2 border-slate-900 text-slate-900 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                      <Wand2 className="w-4 h-4" />
                      画质增强 (Enhance Quality)
                    </button>
                  </div>

                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-rose-600 font-bold uppercase tracking-widest text-center bg-rose-50 py-3 rounded-lg"
                    >
                      {error}
                    </motion.p>
                  )}
                  {success && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-emerald-600 font-bold uppercase tracking-widest text-center bg-emerald-50 py-3 rounded-lg"
                    >
                      {success}
                    </motion.p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <ImageIcon className="w-16 h-16 opacity-20" />
                <p className="text-sm uppercase tracking-widest font-medium">Please upload an image first</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">
            Powered by Gemini 2.5 Flash Image • Landmark Luxury Tech
          </p>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-slate-900 text-white rounded-lg text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-slate-800 transition-all"
          >
            完成 (Done)
          </button>
        </div>
      </div>
    </motion.div>
  );
};
