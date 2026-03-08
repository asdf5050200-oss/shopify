import React, { useState, useCallback } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import JSZip from 'jszip';
import { ImageOptimizer } from './components/ImageOptimizer';
import { ZoomableImage } from './components/ZoomableImage';
import { 
  Upload, 
  Image as ImageIcon, 
  Layout, 
  Palette, 
  Box, 
  Trash2, 
  Plus, 
  Sparkles,
  Loader2,
  ChevronRight,
  Monitor,
  Map,
  X,
  LucideIcon,
  ShoppingBag,
  ArrowRight,
  Download,
  Gem,
  Watch,
  Briefcase,
  Globe,
  ExternalLink,
  Layers,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Product, GenerationConfig, MockupResult, MediumType, StyleType, BackgroundType } from './types';
import { generateMockup } from './services/gemini';

const MEDIUMS: { id: MediumType; icon: LucideIcon; label: string }[] = [
  { id: 'boutique window', icon: Globe, label: 'Boutique Window' },
  { id: 'jewelry box', icon: Gem, label: 'Jewelry Box' },
  { id: 'fashion magazine', icon: Map, label: 'Fashion Magazine' },
  { id: 'luxury display', icon: Box, label: 'Luxury Display' },
  { id: 'billboard', icon: Monitor, label: 'City Billboard' },
];

const STYLES: { id: StyleType; label: string; color: string }[] = [
  { id: 'none', label: 'Natural', color: 'bg-slate-200' },
  { id: 'vintage', label: 'Vintage', color: 'bg-amber-200' },
  { id: 'futuristic', label: 'Futuristic', color: 'bg-cyan-200' },
  { id: 'minimalist', label: 'Minimalist', color: 'bg-white' },
  { id: 'painterly', label: 'Painterly', color: 'bg-rose-200' },
  { id: 'cyberpunk', label: 'Cyberpunk', color: 'bg-purple-200' },
  { id: 'retro-ads', label: 'Retro Ads', color: 'bg-orange-200' },
];

const BACKGROUNDS: { id: BackgroundType; label: string }[] = [
  { id: 'studio', label: 'Studio' },
  { id: 'outdoor', label: 'Outdoor' },
  { id: 'abstract', label: 'Abstract' },
  { id: 'office', label: 'Office' },
  { id: 'custom', label: 'Custom' },
];

const TEXTURES: { id: any; label: string }[] = [
  { id: 'none', label: 'Original' },
  { id: 'fabric', label: 'Fabric' },
  { id: 'metallic', label: 'Metallic' },
  { id: 'paper', label: 'Fine Paper' },
  { id: 'leather', label: 'Leather' },
  { id: 'glass', label: 'Glass' },
  { id: 'velvet', label: 'Velvet' },
];

type View = 'home' | 'product' | 'visualizer' | 'contact' | 'optimizer';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  image: string;
  details: string[];
}

const LUXURY_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    name: 'Royal Oak Selfwinding',
    category: 'Watches',
    price: '$45,000',
    description: 'The Royal Oak Selfwinding in stainless steel with a "Grande Tapisserie" dial.',
    image: 'https://picsum.photos/seed/watch1/1200/1500',
    details: ['41mm Case', 'Stainless Steel', '50m Water Resistance', 'Calibre 4302']
  },
  {
    id: 'p2',
    name: 'Serpenti Viper Necklace',
    category: 'Jewelry',
    price: '$28,500',
    description: '18 kt rose gold necklace set with demi-pavé diamonds on the coil.',
    image: 'https://picsum.photos/seed/jewelry1/1200/1500',
    details: ['18kt Rose Gold', 'Pavé Diamonds', 'Signature Coil Design', 'Made in Italy']
  },
  {
    id: 'p3',
    name: 'Birkin 30 Epsom',
    category: 'Leather Goods',
    price: '$18,900',
    description: 'The iconic Birkin 30 in Epsom leather with gold-tone hardware.',
    image: 'https://picsum.photos/seed/bag1/1200/1500',
    details: ['Epsom Leather', 'Gold Hardware', '30cm Width', 'Hand-stitched']
  },
  {
    id: 'p4',
    name: 'Classic Tank Must',
    category: 'Watches',
    price: '$3,800',
    description: 'Tank Must watch, large model, high autonomy quartz movement.',
    image: 'https://picsum.photos/seed/watch2/1200/1500',
    details: ['Steel Case', 'Beaded Crown', 'Silvered Dial', 'Black Leather Strap']
  },
  {
    id: 'p5',
    name: 'Love Bracelet Diamond',
    category: 'Jewelry',
    price: '$12,400',
    description: 'A child of 1970s New York, the LOVE collection remains today an iconic symbol of love.',
    image: 'https://picsum.photos/seed/jewelry2/1200/1500',
    details: ['18kt Yellow Gold', '4 Diamonds', 'Screw Motif', 'Oval Shape']
  },
  {
    id: 'p6',
    name: 'Kelly 25 Sellier',
    category: 'Leather Goods',
    price: '$22,000',
    description: 'Kelly 25 Sellier in Box Calf leather with palladium hardware.',
    image: 'https://picsum.photos/seed/bag2/1200/1500',
    details: ['Box Calf Leather', 'Palladium Hardware', '25cm Width', 'Detachable Strap']
  },
  {
    id: 'p7',
    name: 'Oyster Perpetual 41',
    category: 'Watches',
    price: '$6,400',
    description: 'Oyster Perpetual 41 with a turquoise blue dial and an Oyster bracelet.',
    image: 'https://picsum.photos/seed/watch3/1200/1500',
    details: ['41mm Case', 'Oystersteel', 'Turquoise Blue Dial', 'Calibre 3230']
  },
  {
    id: 'p8',
    name: 'B.zero1 Rock Ring',
    category: 'Jewelry',
    price: '$2,800',
    description: 'B.zero1 Rock two-band ring in 18 kt rose gold with black ceramic.',
    image: 'https://picsum.photos/seed/jewelry3/1200/1500',
    details: ['18kt Rose Gold', 'Black Ceramic', 'Inspired by Colosseum', 'Made in Italy']
  },
  {
    id: 'p9',
    name: 'Lady Dior Bag',
    category: 'Bags',
    price: '$5,500',
    description: 'Medium Lady Dior bag in black Cannage lambskin.',
    image: 'https://picsum.photos/seed/bag3/1200/1500',
    details: ['Lambskin', 'Cannage Stitching', 'D.I.O.R. Charms', 'Removable Strap']
  },
  {
    id: 'p10',
    name: 'Nautilus 5711/1A',
    category: 'Watches',
    price: '$120,000',
    description: 'The iconic Nautilus 5711 with a blue-black graduated dial.',
    image: 'https://picsum.photos/seed/watch4/1200/1500',
    details: ['40mm Case', 'Steel', '120m Water Resistance', 'Calibre 26-330 S C']
  },
  {
    id: 'p11',
    name: 'Alhambra Vintage Bracelet',
    category: 'Jewelry',
    price: '$4,500',
    description: 'Vintage Alhambra bracelet, 5 motifs, 18K yellow gold, Mother-of-pearl.',
    image: 'https://picsum.photos/seed/jewelry4/1200/1500',
    details: ['18K Yellow Gold', 'Mother-of-pearl', 'Clover Motif', 'Hallmark Clasp']
  },
  {
    id: 'p12',
    name: 'Jackie 1961 Small',
    category: 'Bags',
    price: '$2,950',
    description: 'The Jackie 1961 small shoulder bag in black leather.',
    image: 'https://picsum.photos/seed/bag4/1200/1500',
    details: ['Black Leather', 'Gold Hardware', 'Piston Closure', 'Microfiber Lining']
  }
];

export default function App() {
  const [view, setView] = useState<View>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<GenerationConfig>({
    mediums: ['boutique window'],
    style: 'none',
    texture: 'none',
    background: { type: 'studio' }
  });
  const [results, setResults] = useState<MockupResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [showShopifyImport, setShowShopifyImport] = useState(false);
  const [shopifyProducts, setShopifyProducts] = useState<any[]>([]);
  const [isFetchingShopify, setIsFetchingShopify] = useState(false);
  const [isUploadingToShopify, setIsUploadingToShopify] = useState<string | null>(null);

  const fetchShopifyProducts = async () => {
    setIsFetchingShopify(true);
    try {
      const response = await fetch('/api/shopify/products');
      const data = await response.json();
      if (data.products) {
        setShopifyProducts(data.products);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to connect to Shopify server.");
    } finally {
      setIsFetchingShopify(false);
    }
  };

  const uploadToShopify = async (result: MockupResult, productId: string) => {
    setIsUploadingToShopify(result.id);
    try {
      const response = await fetch('/api/shopify/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          base64Image: result.imageUrl,
          filename: `landmark-mockup-${result.medium}.png`
        })
      });
      const data = await response.json();
      if (data.image) {
        alert("Successfully uploaded to Shopify!");
      } else {
        alert("Failed to upload to Shopify: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error uploading to Shopify.");
    } finally {
      setIsUploadingToShopify(null);
    }
  };

  const onProductDrop = useCallback(async (acceptedFiles: File[]) => {
    const newProducts = await Promise.all(acceptedFiles.map(async (file) => {
      const base64 = await fileToBase64(file);
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name.split('.')[0],
        url: URL.createObjectURL(file),
        base64: base64.split(',')[1],
        mimeType: file.type
      };
    }));
    setProducts(prev => [...prev, ...newProducts]);
  }, []);

  const onBackgroundDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const base64 = await fileToBase64(file);
    setConfig(prev => ({
      ...prev,
      background: {
        type: 'custom',
        customUrl: URL.createObjectURL(file),
        customBase64: base64.split(',')[1],
        customMimeType: file.type
      }
    }));
  }, []);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, newUrl: string, newBase64: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, url: newUrl, base64: newBase64 } : p));
  };

  const toggleMedium = (medium: MediumType) => {
    setConfig(prev => ({
      ...prev,
      mediums: prev.mediums.includes(medium)
        ? prev.mediums.filter(m => m !== medium)
        : [...prev.mediums, medium]
    }));
  };

  const handleGenerate = async () => {
    if (products.length === 0) {
      setError("Please upload at least one luxury item image.");
      return;
    }
    if (config.mediums.length === 0) {
      setError("Please select at least one marketing medium.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    const newResults: MockupResult[] = [];

    try {
      for (const medium of config.mediums) {
        const result = await generateMockup(products, medium, config);
        newResults.push(result);
      }
      setResults(prev => [...newResults, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to generate mockups. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    results.forEach((result, idx) => {
      const base64Data = result.imageUrl.split(',')[1];
      zip.file(`landmark-luxury-${idx + 1}-${result.medium}.png`, base64Data, { base64: true });
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `landmark-luxury-collection.zip`;
    link.click();
  };

  const productDropzoneOptions: DropzoneOptions = {
    onDrop: onProductDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }
  } as any;

  const backgroundDropzoneOptions: DropzoneOptions = {
    onDrop: onBackgroundDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false
  } as any;

  const { getRootProps: getProductProps, getInputProps: getProductInput, isDragActive: isProductDrag } = useDropzone(productDropzoneOptions);
  const { getRootProps: getBgProps, getInputProps: getBgInput, isDragActive: isBgDrag } = useDropzone(backgroundDropzoneOptions);

  return (
    <div className="min-h-screen bg-[#FDFDFB] text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-white">
      {/* Utility Bar */}
      <div className="bg-[#1A1A1A] text-white py-2 px-6 flex items-center justify-between text-[9px] uppercase tracking-[0.3em] font-medium">
        <div className="flex items-center gap-6">
          <button className="hover:opacity-60 transition-opacity">English</button>
          <button className="hover:opacity-60 transition-opacity">Search</button>
        </div>
        <div className="flex items-center gap-6">
          <button className="hover:opacity-60 transition-opacity">Rewards</button>
          <button className="hover:opacity-60 transition-opacity">Sign In</button>
        </div>
      </div>

      {/* Main Navigation Bar - Luxury Editorial Style */}
      <nav className="border-b border-[#1A1A1A]/10 bg-white sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-6 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center cursor-pointer" onClick={() => setView('home')}>
            <h1 className="text-4xl font-serif font-light tracking-[-0.03em] uppercase">Landmark Global Trade Inc.</h1>
            <span className="text-[8px] uppercase tracking-[0.5em] mt-1 opacity-40">Excellence in Luxury Visualization</span>
          </div>

          <div className="flex items-center gap-10">
            {['All', 'New In', 'Trending', 'Designers', 'Clothing', 'Shoes', 'Bags', 'Jewelry', 'Accessories', 'Editorial', 'Sale', 'Visualizer', 'Optimizer', 'Contact'].map((cat) => (
              <button 
                key={cat} 
                onClick={() => {
                  if (cat === 'Visualizer') {
                    setView('visualizer');
                  } else if (cat === 'Optimizer') {
                    setView('optimizer');
                  } else if (cat === 'Contact') {
                    setView('contact');
                  } else {
                    setView('home');
                    setSelectedCategory(cat);
                  }
                }}
                className={cn(
                  "text-[10px] uppercase tracking-[0.25em] font-medium hover:opacity-50 transition-opacity",
                  cat === 'Sale' ? 'text-rose-600' : '',
                  (cat === 'Visualizer' && view === 'visualizer') || 
                  (cat === 'Optimizer' && view === 'optimizer') ||
                  (cat === 'Contact' && view === 'contact') ||
                  (cat !== 'Visualizer' && cat !== 'Optimizer' && cat !== 'Contact' && view === 'home' && selectedCategory === cat) ? 'border-b border-[#1A1A1A] pb-1' : ''
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {view === 'home' && (
        <main className="max-w-[1800px] mx-auto p-10 lg:p-20">
          {selectedCategory === 'All' && (
            <>
              <section className="mb-32 relative h-[85vh] overflow-hidden flex items-center justify-center">
                <motion.div 
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <img 
                    src="https://picsum.photos/seed/luxury-hero-2/1920/1080" 
                    alt="Hero" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#F5F2ED]/20" />
                </motion.div>
                
                <div className="relative text-center text-white space-y-10 max-w-5xl px-6">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="space-y-4"
                  >
                    <span className="text-[11px] uppercase tracking-[0.8em] font-bold block opacity-80">
                      Est. 1998 — London
                    </span>
                    <h2 className="text-8xl md:text-9xl font-serif font-light italic leading-[0.9] tracking-tighter">
                      The Art of <br /> 
                      <span className="pl-20">Rare Acquisition</span>
                    </h2>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="flex flex-col items-center gap-8"
                  >
                    <p className="text-[14px] tracking-[0.2em] uppercase font-light max-w-md mx-auto opacity-70">
                      Curating the world's most exceptional timepieces and high jewelry.
                    </p>
                    <button 
                      onClick={() => setSelectedCategory('New In')}
                      className="group relative px-16 py-6 overflow-hidden transition-all"
                    >
                      <div className="absolute inset-0 bg-white transition-transform duration-500 group-hover:scale-105" />
                      <span className="relative text-[#1A1A1A] text-[11px] uppercase tracking-[0.5em] font-bold">
                        Discover the Collection
                      </span>
                    </button>
                  </motion.div>
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40"
                >
                  <span className="text-[9px] uppercase tracking-[0.4em] font-bold">Scroll</span>
                  <div className="w-px h-12 bg-white/50" />
                </motion.div>
              </section>

              {/* Editorial Lookbook Section */}
              <section className="mb-40 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-5 space-y-12 pr-10">
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#1A1A1A]/40">Editorial 01</span>
                  <h3 className="text-6xl font-serif font-light italic leading-tight">
                    A Dialogue <br /> Between <br /> Light & Form
                  </h3>
                  <p className="text-[14px] leading-relaxed text-[#1A1A1A]/60 max-w-sm">
                    Our latest curation explores the interplay of precious metals and architectural silhouettes, defining a new era of understated luxury.
                  </p>
                  <button className="text-[11px] uppercase tracking-[0.3em] font-bold border-b border-[#1A1A1A] pb-2 hover:opacity-50 transition-opacity">
                    View Lookbook
                  </button>
                </div>
                <div className="lg:col-span-7 grid grid-cols-2 gap-10">
                  <div className="aspect-[3/5] bg-[#F5F2ED] overflow-hidden mt-20">
                    <img src="https://picsum.photos/seed/editorial-1/800/1200" alt="Editorial" className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s]" referrerPolicy="no-referrer" />
                  </div>
                  <div className="aspect-[3/5] bg-[#F5F2ED] overflow-hidden">
                    <img src="https://picsum.photos/seed/editorial-2/800/1200" alt="Editorial" className="w-full h-full object-cover hover:scale-110 transition-transform duration-[2s]" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </section>
            </>
          )}

          <div className="mb-16 flex items-center justify-between border-b border-[#1A1A1A]/10 pb-8">
            <h2 className="text-3xl font-serif font-light tracking-tight italic">
              {selectedCategory === 'All' ? 'The Full Collection' : selectedCategory}
            </h2>
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-40">
              {LUXURY_PRODUCTS.filter(p => selectedCategory === 'All' || p.category === selectedCategory || selectedCategory === 'New In' || selectedCategory === 'Trending').length} Items
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
            {LUXURY_PRODUCTS
              .filter(p => selectedCategory === 'All' || p.category === selectedCategory || selectedCategory === 'New In' || selectedCategory === 'Trending')
              .map((product) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
                onClick={() => {
                  setSelectedProduct(product);
                  setView('product');
                }}
              >
                <div className="aspect-[3/4] bg-[#F5F2ED] overflow-hidden mb-8 relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
                <div className="space-y-2">
                  <p className="text-[9px] uppercase tracking-[0.3em] opacity-40">{product.category}</p>
                  <h3 className="text-xl font-serif font-light tracking-tight">{product.name}</h3>
                  <p className="text-[11px] font-bold tracking-[0.1em]">{product.price}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {selectedCategory === 'All' && (
            <section className="mt-40 border-t border-[#1A1A1A]/10 pt-40">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                <div className="space-y-12">
                  <div className="flex items-center gap-4 opacity-30">
                    <div className="w-8 h-px bg-[#1A1A1A]" />
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Our Heritage</span>
                  </div>
                  <h3 className="text-7xl font-serif font-light italic leading-[0.9] tracking-tight">
                    A Legacy of <br /> 
                    <span className="pl-20">Uncompromising</span> <br />
                    Excellence
                  </h3>
                  <div className="space-y-8 text-[15px] leading-relaxed text-[#1A1A1A]/60 max-w-lg">
                    <p>
                      Landmark Global Trade Inc. 的创立源于对卓越的追求，以及为最挑剔的顾客提供真正的奢华购物体验的愿望。
                    </p>
                    <p>
                      凭借多年在奢侈品零售领域的经验，我们在高级珠宝、瑞士手表和意大利皮革制品的采购和销售方面积累了丰富的专业知识。
                    </p>
                    <p>
                      我们的使命是直接向客户销售最高品质的正品奢侈品，并提供以可靠性和透明度为特色的个性化服务。
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-10 pt-10">
                    <div>
                      <h4 className="text-3xl font-serif italic mb-2">25+</h4>
                      <p className="text-[9px] uppercase tracking-[0.2em] opacity-40">Years of Expertise</p>
                    </div>
                    <div>
                      <h4 className="text-3xl font-serif italic mb-2">12</h4>
                      <p className="text-[9px] uppercase tracking-[0.2em] opacity-40">Global Boutiques</p>
                    </div>
                    <div>
                      <h4 className="text-3xl font-serif italic mb-2">100%</h4>
                      <p className="text-[9px] uppercase tracking-[0.2em] opacity-40">Authenticity</p>
                    </div>
                  </div>
                </div>
                <div className="relative aspect-[4/5] bg-[#F5F2ED] overflow-hidden">
                  <img src="https://picsum.photos/seed/heritage/1200/1500" alt="Heritage" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/5" />
                </div>
              </div>
            </section>
          )}
        </main>
      )}

      {view === 'product' && selectedProduct && (
        <main className="max-w-[1800px] mx-auto p-10 lg:p-20">
          <button 
            onClick={() => setView('home')}
            className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold mb-12 hover:opacity-50 transition-opacity group"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Collection</span>
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-7">
              <div className="aspect-[3/4] bg-[#F5F2ED] overflow-hidden">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.4em] opacity-40">{selectedProduct.category}</p>
                <h2 className="text-5xl font-serif font-light tracking-tight leading-tight">{selectedProduct.name}</h2>
                <p className="text-2xl font-light tracking-tight">{selectedProduct.price}</p>
              </div>

              <div className="w-16 h-px bg-[#1A1A1A]" />

              <div className="space-y-6">
                <p className="text-[13px] leading-relaxed text-[#1A1A1A]/70">
                  {selectedProduct.description}
                </p>
                <ul className="space-y-3">
                  {selectedProduct.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-4 text-[11px] uppercase tracking-[0.15em] opacity-60">
                      <div className="w-1 h-1 bg-[#1A1A1A] rounded-full" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-10 space-y-4">
                <button className="w-full py-6 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-[#333] transition-all">
                  Inquire Now
                </button>
                <button 
                  onClick={() => {
                    setProducts([{ id: Date.now().toString(), name: selectedProduct.name, url: selectedProduct.image }]);
                    setView('visualizer');
                  }}
                  className="w-full py-6 border border-[#1A1A1A] text-[#1A1A1A] text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-[#F5F2ED] transition-all flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-4 h-4" />
                  Visualize in Space
                </button>
              </div>

              <div className="pt-10 border-t border-[#1A1A1A]/10">
                <div className="grid grid-cols-2 gap-10">
                  <div>
                    <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold mb-4">Shipping</h4>
                    <p className="text-[10px] opacity-50 leading-relaxed">Complimentary global shipping on all orders over $5,000.</p>
                  </div>
                  <div>
                    <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold mb-4">Returns</h4>
                    <p className="text-[10px] opacity-50 leading-relaxed">14-day return policy for unused items in original packaging.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {view === 'visualizer' && (
        <main className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-89px)] bg-[#FDFDFB]">
          <AnimatePresence>
            {showOptimizer && (
              <ImageOptimizer 
                products={products} 
                onUpdateProduct={updateProduct} 
                onClose={() => setShowOptimizer(false)} 
              />
            )}
            {showShopifyImport && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
              >
                <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#95BF47] rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-serif font-medium tracking-tight">Import from Shopify</h2>
                    </div>
                    <button onClick={() => setShowShopifyImport(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <X className="w-6 h-6 text-slate-400" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8">
                    {isFetchingShopify ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-[#95BF47] animate-spin" />
                        <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Fetching Shopify Products...</p>
                      </div>
                    ) : shopifyProducts.length > 0 ? (
                      <div className="grid grid-cols-2 gap-6">
                        {shopifyProducts.map((p) => (
                          <div 
                            key={p.id} 
                            onClick={async () => {
                              if (p.image && p.image.src) {
                                try {
                                  const response = await fetch(p.image.src);
                                  const blob = await response.blob();
                                  const base64 = await fileToBase64(new File([blob], "shopify-image.png", { type: blob.type }));
                                  setProducts(prev => [...prev, {
                                    id: p.id.toString(),
                                    name: p.title,
                                    url: p.image.src,
                                    base64: base64.split(',')[1],
                                    mimeType: blob.type
                                  }]);
                                  setShowShopifyImport(false);
                                } catch (err) {
                                  alert("Failed to import image from Shopify.");
                                }
                              }
                            }}
                            className="group cursor-pointer border border-slate-100 rounded-xl overflow-hidden hover:border-[#95BF47] transition-all"
                          >
                            <div className="aspect-square bg-slate-50 overflow-hidden">
                              {p.image && <img src={p.image.src} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />}
                            </div>
                            <div className="p-4">
                              <h4 className="text-[10px] uppercase tracking-[0.1em] font-bold truncate">{p.title}</h4>
                              <p className="text-[9px] opacity-40 mt-1">ID: {p.id}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <p className="text-slate-400">No products found in your Shopify store.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Sidebar Controls - Left Rail */}
          <aside className="lg:col-span-3 border-r border-[#1A1A1A]/10 p-10 space-y-12 bg-white/80 backdrop-blur-xl sticky top-[89px] h-[calc(100vh-89px)] overflow-y-auto">
            {/* Company Introduction */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 opacity-30">
                <div className="w-8 h-px bg-[#1A1A1A]" />
                <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold">Our Heritage</h2>
              </div>
              <p className="text-[15px] leading-relaxed font-serif italic text-[#1A1A1A]">
                "Landmark Global Trade Inc. 的创立源于对卓越的追求，以及为最挑剔的顾客提供真正的奢华购物体验的愿望。"
              </p>
              <p className="text-[12px] leading-relaxed text-[#1A1A1A]/50">
                凭借多年在奢侈品零售领域的经验，我们在高级珠宝、瑞士手表和意大利皮革制品的采购和销售方面积累了丰富的专业知识。
              </p>
            </section>

          {/* Product Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#1A1A1A]/40">01. Luxury Assets</h2>
              <span className="text-[9px] font-mono opacity-30">{products.length}</span>
            </div>
            
            <div 
              {...getProductProps()} 
              className={cn(
                "border border-[#1A1A1A]/10 rounded-sm p-12 transition-all cursor-pointer flex flex-col items-center justify-center gap-5 text-center group relative overflow-hidden",
                isProductDrag ? "bg-[#F5F2ED] border-[#1A1A1A]" : "bg-white hover:bg-[#FDFDFB] hover:border-[#1A1A1A]/30"
              )}
            >
              <input {...getProductInput()} />
              {products.length === 0 && (
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                  <img src="https://picsum.photos/seed/luxury-watch/800/800" alt="Placeholder" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              <div className="relative z-10 flex flex-col items-center gap-5">
                <div className="w-14 h-14 border border-[#1A1A1A]/10 rounded-full flex items-center justify-center group-hover:border-[#1A1A1A]/30 transition-colors bg-white/80 backdrop-blur-sm">
                  <Plus className="w-6 h-6 text-[#1A1A1A]/40 group-hover:text-[#1A1A1A] transition-colors" />
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Upload Luxury Item</p>
              </div>
            </div>

            {products.length > 0 && (
              <button 
                onClick={() => setShowOptimizer(true)}
                className="w-full py-4 border border-[#1A1A1A] text-[#1A1A1A] text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-[#F5F2ED] transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3 h-3" />
                Optimize Images (图片优化)
              </button>
            )}

            <button 
              onClick={() => {
                setShowShopifyImport(true);
                fetchShopifyProducts();
              }}
              className="w-full py-4 bg-[#95BF47] text-white text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-[#7A9C3A] transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-3 h-3" />
              Import from Shopify (从Shopify导入)
            </button>

            <div className="grid grid-cols-2 gap-4">
              <AnimatePresence>
                {products.map((product) => (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group relative aspect-[3/4] bg-[#F5F2ED] overflow-hidden border border-[#1A1A1A]/5"
                  >
                    <img src={product.url} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    <button 
                      onClick={() => removeProduct(product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity text-[#1A1A1A] hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Medium Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#1A1A1A]/40">02. Presentation Medium</h2>
            </div>
            <div className="space-y-1">
              {MEDIUMS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMedium(m.id)}
                  className={cn(
                    "w-full flex items-center justify-between py-4 px-5 text-left transition-all border border-transparent",
                    config.mediums.includes(m.id)
                      ? "bg-[#1A1A1A] text-white"
                      : "hover:bg-[#F5F2ED] text-[#1A1A1A]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <m.icon className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{m.label}</span>
                  </div>
                  {config.mediums.includes(m.id) && <ChevronRight className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </section>

          {/* Style Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#1A1A1A]/40">03. Aesthetic Direction</h2>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setConfig(prev => ({ ...prev, style: s.id }))}
                  className={cn(
                    "py-3.5 px-5 text-[10px] uppercase tracking-[0.2em] font-bold transition-all border text-left",
                    config.style === s.id
                      ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                      : "border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 text-[#1A1A1A]"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* Texture Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#1A1A1A]/40">04. Texture & Material</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TEXTURES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setConfig(prev => ({ ...prev, texture: t.id }))}
                  className={cn(
                    "py-3 px-4 text-[9px] uppercase tracking-[0.2em] font-bold transition-all border",
                    config.texture === t.id
                      ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                      : "border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 text-[#1A1A1A]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>

          {/* Background Section */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#1A1A1A]/40">05. Environment</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setConfig(prev => ({ ...prev, background: { ...prev.background, type: bg.id } }))}
                  className={cn(
                    "py-3 px-4 text-[9px] uppercase tracking-[0.2em] font-bold transition-all border",
                    config.background.type === bg.id
                      ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                      : "border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 text-[#1A1A1A]"
                  )}
                >
                  {bg.label}
                </button>
              ))}
            </div>

            {config.background.type === 'custom' && (
              <div 
                {...getBgProps()} 
                className={cn(
                  "mt-4 border border-[#1A1A1A]/10 rounded-sm p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 text-center group relative overflow-hidden aspect-video",
                  isBgDrag ? "bg-[#F5F2ED] border-[#1A1A1A]" : "bg-white hover:bg-[#FDFDFB] hover:border-[#1A1A1A]/30"
                )}
              >
                <input {...getBgInput()} />
                {config.background.customUrl ? (
                  <img src={config.background.customUrl} alt="Custom BG" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <img src="https://picsum.photos/seed/boutique/1200/800" alt="Placeholder" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <Upload className="w-5 h-5 text-[#1A1A1A]/40 group-hover:text-[#1A1A1A] transition-colors" />
                  <p className="text-[9px] uppercase tracking-[0.2em] font-bold">
                    {config.background.customUrl ? "Change Background" : "Upload Custom Scene"}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Action Button */}
          <div className="pt-6">
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || products.length === 0}
              className={cn(
                "w-full py-6 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.4em] font-bold transition-all flex items-center justify-center gap-4",
                (isGenerating || products.length === 0) ? "opacity-20 cursor-not-allowed" : "hover:bg-[#333] active:scale-[0.99]"
              )}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin stroke-[1.5px]" />
              ) : (
                <Sparkles className="w-4 h-4 stroke-[1.5px]" />
              )}
              <span>{isGenerating ? "Visualizing..." : "Generate Vision"}</span>
            </button>
            {error && <p className="text-[8px] text-rose-600 uppercase tracking-[0.3em] mt-6 text-center">{error}</p>}
          </div>
        </aside>

        {/* Main Preview Area - Right Side */}
        <div className="lg:col-span-9 p-16 lg:p-24 bg-[#FDFDFB] overflow-y-auto max-h-[calc(100vh-89px)] relative">
          <div className="absolute top-0 right-0 p-10 pointer-events-none opacity-[0.03]">
            <Globe className="w-96 h-96" />
          </div>

          {results.length === 0 && !isGenerating ? (
            <div className="h-full space-y-40">
              <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto pt-20">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 128 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="w-px bg-[#1A1A1A] mb-16" 
                />
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-7xl md:text-8xl font-serif font-light italic mb-12 leading-[0.9] tracking-tight"
                >
                  The Art of <br /> 
                  <span className="pl-24">Luxury Presentation</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="text-[14px] uppercase tracking-[0.3em] leading-relaxed text-[#1A1A1A]/50 mb-20 max-w-2xl font-light"
                >
                  "我们的使命是直接向客户销售最高品质的正品奢侈品，并提供以可靠性和透明度为特色的个性化服务。"
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="flex gap-24 mb-20"
                >
                  {[
                    { icon: Gem, label: 'Jewelry' },
                    { icon: Watch, label: 'Watches' },
                    { icon: Briefcase, label: 'Leather' }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center group">
                      <div className="w-16 h-16 rounded-full border border-[#1A1A1A]/5 flex items-center justify-center mb-4 group-hover:border-[#1A1A1A]/20 transition-all">
                        <item.icon className="w-6 h-6 opacity-20 group-hover:opacity-60 transition-all" />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-all">{item.label}</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Featured Editorial Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/5] bg-[#F5F2ED] overflow-hidden mb-8 relative">
                    <img 
                      src="https://picsum.photos/seed/belt/1200/1500" 
                      alt="Dehanche Belts" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[12px] uppercase tracking-[0.4em] font-bold">Dehanche's Beautiful Belts</h3>
                    <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 italic">The season's most coveted accessory</p>
                    <button className="text-[10px] uppercase tracking-[0.4em] font-bold border-b border-[#1A1A1A] pb-2 hover:opacity-50 transition-opacity">Shop the Collection</button>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/5] bg-[#F5F2ED] overflow-hidden mb-8 relative">
                    <img 
                      src="https://picsum.photos/seed/sunglasses/1200/1500" 
                      alt="Loewe Eyewear" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-[12px] uppercase tracking-[0.4em] font-bold">Loewe Eyewear Iconic Sunglasses</h3>
                    <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 italic">Signature silhouettes for the modern gaze</p>
                    <button className="text-[10px] uppercase tracking-[0.4em] font-bold border-b border-[#1A1A1A] pb-2 hover:opacity-50 transition-opacity">Shop the Collection</button>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="space-y-40">
              {/* Active Generation State */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="aspect-[16/9] bg-[#F5F2ED] flex flex-col items-center justify-center text-center p-24 border border-[#1A1A1A]/5"
                  >
                    <Loader2 className="w-10 h-10 text-[#1A1A1A] animate-spin mb-8 stroke-[0.5px]" />
                    <h3 className="text-3xl font-serif italic mb-3 font-light">Crafting your luxury vision...</h3>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#1A1A1A]/30">Landmark Global Trade Inc. • AI Processing</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results Gallery Header */}
              {results.length > 0 && (
                <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-8">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#1A1A1A]/40">Curation Gallery</span>
                    <div className="w-8 h-px bg-[#1A1A1A]/10" />
                    <span className="text-[10px] font-mono opacity-30">{results.length} Assets</span>
                  </div>
                  
                  <button 
                    onClick={handleDownloadAll}
                    className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-50 transition-opacity"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Download All (.zip)</span>
                  </button>
                </div>
              )}

              {/* Results Gallery */}
              <div className="space-y-64">
                {results.map((result, idx) => (
                  <motion.div 
                    key={result.id}
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="group"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
                      <div className="lg:col-span-8">
                        <div className="aspect-[4/5] lg:aspect-[16/9] bg-[#F5F2ED] overflow-hidden border border-[#1A1A1A]/5 relative shadow-2xl shadow-black/[0.02]">
                          <ZoomableImage src={result.imageUrl} alt={result.medium} />
                          <div className="absolute top-8 left-8 pointer-events-none">
                            <span className="bg-white/95 backdrop-blur px-5 py-2 text-[8px] uppercase tracking-[0.3em] font-bold border border-[#1A1A1A]/5 shadow-sm">
                              {result.medium}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-4 space-y-10">
                        <div className="space-y-6">
                          <h3 className="text-4xl font-serif font-light uppercase tracking-tight leading-[0.9]">
                            {result.medium} <br />
                            <span className="italic opacity-30 lowercase">luxury curation</span>
                          </h3>
                          <div className="w-16 h-px bg-[#1A1A1A]" />
                        </div>
                        
                        <p className="text-[12px] leading-relaxed text-[#1A1A1A]/50 uppercase tracking-[0.08em] font-light">
                          {result.prompt}
                        </p>

                        <div className="pt-6 flex items-center gap-6">
                          <a 
                            href={result.imageUrl} 
                            download={`landmark-luxury-${result.medium}.png`}
                            className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-40 transition-opacity group/link"
                          >
                            <span>Download Asset</span>
                            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                          </a>
                          <div className="w-px h-4 bg-[#1A1A1A]/10" />
                          <button 
                            onClick={() => {
                              const productId = prompt("Enter Shopify Product ID to upload to:");
                              if (productId) uploadToShopify(result, productId);
                            }}
                            disabled={isUploadingToShopify === result.id}
                            className="text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-40 transition-opacity flex items-center gap-2 text-[#95BF47]"
                          >
                            {isUploadingToShopify === result.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <ShoppingBag className="w-3 h-3" />
                            )}
                            <span>{isUploadingToShopify === result.id ? "Uploading..." : "Export to Shopify"}</span>
                          </button>
                          <div className="w-px h-4 bg-[#1A1A1A]/10" />
                          <button className="text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-40 transition-opacity flex items-center gap-2">
                            <ExternalLink className="w-3 h-3" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      )}

      {view === 'optimizer' && <ImageOptimizer />}

      {view === 'contact' && (
        <main className="max-w-[1800px] mx-auto p-10 lg:p-20 min-h-[70vh] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 w-full">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-6xl font-serif font-light italic leading-tight">Connect with <br /> Excellence</h2>
                <p className="text-[14px] leading-relaxed text-[#1A1A1A]/60 max-w-md">
                  Whether you are seeking a rare timepiece, a bespoke jewelry commission, or have inquiries regarding our global trade operations, our specialists are at your disposal.
                </p>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <Globe className="w-5 h-5 mt-1 opacity-40" />
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Global Headquarters</h4>
                    <p className="text-[12px] opacity-60">120 Pall Mall, St. James's<br />London SW1Y 5EA, United Kingdom</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <ExternalLink className="w-5 h-5 mt-1 opacity-40" />
                  <div>
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Digital Concierge</h4>
                    <p className="text-[12px] opacity-60">concierge@landmark-global.com<br />+44 (0) 20 7123 4567</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-8 pt-6">
                {['Instagram', 'LinkedIn', 'WeChat', 'WhatsApp'].map(social => (
                  <button key={social} className="text-[9px] uppercase tracking-[0.3em] font-bold border-b border-[#1A1A1A]/20 pb-1 hover:border-[#1A1A1A] transition-all">
                    {social}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#F5F2ED] p-16 space-y-10">
              <h3 className="text-[11px] uppercase tracking-[0.4em] font-bold border-b border-[#1A1A1A]/10 pb-6">Inquiry Form</h3>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.2em] opacity-40">Full Name</label>
                  <input type="text" className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-2 focus:border-[#1A1A1A] outline-none transition-all text-[13px]" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.2em] opacity-40">Email Address</label>
                  <input type="email" className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-2 focus:border-[#1A1A1A] outline-none transition-all text-[13px]" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-[0.2em] opacity-40">Message</label>
                  <textarea rows={4} className="w-full bg-transparent border-b border-[#1A1A1A]/20 py-2 focus:border-[#1A1A1A] outline-none transition-all text-[13px] resize-none" placeholder="How can we assist you?" />
                </div>
                <button className="w-full py-6 bg-[#1A1A1A] text-white text-[11px] uppercase tracking-[0.4em] font-bold hover:bg-[#333] transition-all">
                  Send Inquiry
                </button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Footer - Luxury Minimalist */}
      <footer className="border-t border-[#1A1A1A]/10 bg-white py-20 px-10">
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-12">
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-2xl font-serif italic mb-2 font-light tracking-tight">Landmark Global Trade Inc.</h4>
            <p className="text-[8px] uppercase tracking-[0.4em] opacity-30">© 2026 Excellence in Luxury Retail</p>
          </div>
          
          <div className="flex items-center justify-center gap-16">
            <a href="#" className="text-[9px] uppercase tracking-[0.3em] font-bold hover:opacity-40 transition-opacity">Authenticity</a>
            <a href="#" className="text-[9px] uppercase tracking-[0.3em] font-bold hover:opacity-40 transition-opacity">Transparency</a>
            <a href="#" className="text-[9px] uppercase tracking-[0.3em] font-bold hover:opacity-40 transition-opacity">Reliability</a>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-4 text-[8px] uppercase tracking-[0.3em] opacity-30">
              <span>Powered by Gemini AI</span>
              <div className="w-1 h-1 bg-[#1A1A1A] rounded-full" />
              <span>Global / 24.7</span>
            </div>
            <p className="text-[8px] uppercase tracking-[0.3em] opacity-20">London • Paris • New York • Tokyo • Hong Kong</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
