/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Bell, HelpCircle, CreditCard, Award, ChevronRight, Gem, ArrowUp, Star, Menu, X, User } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useProducts } from './hooks/useProducts';
import { Product, ProductType } from './lib/types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './lib/firebase';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    type: 'Account',
    title: 'Mythical Immortal Acc • 200 Skins',
    seller: 'Luka_Gamer',
    price: '450.00',
    color: 'bg-slate-500',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
    rating: 4.8,
    reviewsCount: 124
  },
  {
    id: '2',
    type: 'Diamonds',
    title: '5000+ Diamonds Top-Up',
    seller: 'LotusOfficial',
    price: '125.00',
    color: 'bg-[#9d5cff]',
    icon: <Gem size={48} strokeWidth={1} />,
    rating: 5.0,
    reviewsCount: 892
  },
  {
    id: '3',
    type: 'Boost',
    title: 'Grandmaster to Epic Boost',
    seller: 'Nika_Pro',
    price: '45.00',
    color: 'bg-emerald-500',
    icon: <ArrowUp size={48} strokeWidth={1} />,
    rating: 4.5,
    reviewsCount: 56
  }
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { user, profile, loading: authLoading } = useAuth();
  const { products: fetchedProducts, loading: productsLoading, addProduct } = useProducts();
  const isLoggedIn = !!user;

  // Render dummy products if empty (for preview)
  const products = fetchedProducts.length > 0 ? fetchedProducts : INITIAL_PRODUCTS;

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [profileSaved, setProfileSaved] = useState(false);
  const [topupAmount, setTopupAmount] = useState<string>('');
  const [topupSuccess, setTopupSuccess] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [viewedSellerProfile, setViewedSellerProfile] = useState<UserProfile | null>(null);

  const getProductIcon = (type: string, icon?: React.ReactNode) => {
    if (icon) return icon;
    if (type === 'Account') return <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>;
    if (type === 'Diamonds') return <Gem size={48} strokeWidth={1} />;
    if (type === 'Boost') return <ArrowUp size={48} strokeWidth={1} />;
    return <Star size={48} strokeWidth={1} />;
  };

  const handleLinkClick = (view: string) => (e: React.MouseEvent) => {

    e.preventDefault();
    if (!isLoggedIn && (view === 'profile' || view === 'topup' || view === 'sell')) {
      setCurrentView('auth');
    } else {
      setCurrentView(view);
      setSearchQuery('');
    }
  };

  const handleMobileLinkClick = (view: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn && (view === 'profile' || view === 'topup' || view === 'sell')) {
      setCurrentView('auth');
    } else {
      setCurrentView(view);
      setSearchQuery('');
    }
    setIsMenuOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() !== '') {
      setCurrentView('search_results');
      if (isMenuOpen) setIsMenuOpen(false);
    } else if (currentView === 'search_results') {
      setCurrentView('home');
    }
  };

  const handleSellerClick = async (sellerId: string) => {
    if (!sellerId) return;
    setCurrentView('seller_profile');
    setSelectedSellerId(sellerId);
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('./lib/firebase');
      const docSnap = await getDoc(doc(db, 'users', sellerId));
      if (docSnap.exists()) {
        setViewedSellerProfile(docSnap.data() as UserProfile);
      } else {
        setViewedSellerProfile(null);
      }
    } catch (e) {
      console.error('Error fetching seller profile', e);
      setViewedSellerProfile(null);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-[#191c25] to-[#13151c] rounded-3xl p-6 md:p-10 border border-white/5 overflow-hidden min-h-[220px] shrink-0">
              <div className="absolute right-[-40px] top-[-40px] w-64 h-64 bg-[#9d5cff]/10 blur-[80px] rounded-full"></div>
              <div className="relative z-10 max-w-lg">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                  შეიძინე და გაყიდე უსაფრთხოდ <span className="text-[#9d5cff]">LOTUS STORE</span>-ზე
                </h1>
                <p className="text-[#b5bac8] text-base md:text-lg mb-8">
                  Mobile Legends-ის ანგარიშები, ალმასები და ბუსტინგი ერთ სივრცეში.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setCurrentView('products')} className="w-full sm:w-auto px-8 py-3 bg-[#9d5cff] hover:bg-[#ad73ff] active:scale-95 text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#9d5cff]/20">
                    პროდუქტების ნახვა
                  </button>
                  <button onClick={() => {
                    if (isLoggedIn) {
                      setCurrentView('sell');
                    } else {
                      setCurrentView('auth');
                    }
                  }} className="w-full sm:w-auto px-8 py-3 bg-[#191c25] border border-white/10 hover:bg-[#202430] active:scale-95 text-white font-semibold rounded-xl transition-all">
                    გაყიდვა
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Products Grid */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold">ახალი პროდუქტები</h2>
                <button onClick={() => setCurrentView('products')} className="text-sm text-[#9d5cff] hover:underline">ყველას ნახვა</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.slice(0, 3).map((product) => (
                  <div key={product.id} onClick={() => setSelectedProduct(product)} className="bg-[#191c25] rounded-2xl border border-white/5 overflow-hidden flex flex-col group hover:border-white/10 transition-all hover:-translate-y-1 duration-300 cursor-pointer">
                    <div className="aspect-video bg-[#282c39] relative">
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider text-white z-10">{product.type}</div>
                      <div className="w-full h-full flex items-center justify-center opacity-40 text-white group-hover:scale-110 transition-transform duration-500">
                        {getProductIcon(product.type, product.icon)}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-[#9d5cff] transition-colors">{product.title}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs">
                          <div className={`w-4 h-4 rounded-full ${product.color}`}></div>
                          <span className="opacity-60 hover:opacity-100 hover:text-[#9d5cff] transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); handleSellerClick(product.sellerId); }}>{product.seller}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#ffd700]">
                          <Star size={12} fill="currentColor" />
                          <span>{product.rating.toFixed(1)}</span>
                          <span className="text-white/40 ml-1">({product.reviewsCount})</span>
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-lg font-bold text-[#f8fafc]">{product.price} ₾</span>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }} className="px-4 py-1.5 bg-[#ec4899] hover:bg-[#f060aa] active:scale-95 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-[#ec4899]/20 group-hover:shadow-[#ec4899]/40">
                          ყიდვა
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'products':
        return (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold">ყველა პროდუქტი</h1>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-[#191c25] border border-white/10 rounded-xl text-sm hover:bg-[#202430] transition-colors">ფილტრი</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product, idx) => (
                <div key={product.id + idx} onClick={() => setSelectedProduct(product)} className="bg-[#191c25] rounded-2xl border border-white/5 overflow-hidden flex flex-col group hover:border-white/10 transition-all hover:-translate-y-1 duration-300 cursor-pointer">
                  <div className="aspect-video bg-[#282c39] relative">
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider text-white z-10">{product.type}</div>
                    <div className="w-full h-full flex items-center justify-center opacity-40 text-white group-hover:scale-110 transition-transform duration-500">
                      {getProductIcon(product.type, product.icon)}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-[#9d5cff] transition-colors">{product.title}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`w-4 h-4 rounded-full ${product.color}`}></div>
                        <span className="opacity-60 hover:opacity-100 hover:text-[#9d5cff] transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); handleSellerClick(product.sellerId); }}>{product.seller}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#ffd700]">
                        <Star size={12} fill="currentColor" />
                        <span>{product.rating.toFixed(1)}</span>
                        <span className="text-white/40 ml-1">({product.reviewsCount})</span>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-lg font-bold text-[#f8fafc]">{product.price} ₾</span>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }} className="px-4 py-1.5 bg-[#ec4899] hover:bg-[#f060aa] active:scale-95 text-white text-xs font-bold rounded-lg transition-all shadow-lg shadow-[#ec4899]/20 group-hover:shadow-[#ec4899]/40">
                        ყიდვა
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'topup':
        return (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">ბალანსის შევსება</h1>
            <p className="text-[#b5bac8] text-center mb-6">აირჩიეთ შევსების მეთოდი და მიუთითეთ თანხა</p>
            
            <div className="bg-[#191c25] rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-[#9d5cff]">
                <CreditCard size={120} strokeWidth={1} />
              </div>
              
              <div className="relative z-10 flex flex-col gap-6">
                <div>
                  <label className="block text-sm text-[#b5bac8] mb-2 font-medium">თანხა (₾)</label>
                  <div className="relative">
                    <input type="number" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} placeholder="0.00" className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-5 py-4 text-xl font-bold focus:outline-none focus:border-[#9d5cff] transition-all text-white placeholder-white/20" />
                    <div className="absolute right-5 top-4 text-[#9d5cff] font-bold">GEL</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {[10, 50, 100].map(amount => (
                    <button key={amount} onClick={() => setTopupAmount(amount.toString())} className="py-3 bg-[#0d0e13] border border-white/10 rounded-xl text-center hover:border-[#9d5cff]/50 hover:bg-[#9d5cff]/5 transition-all font-semibold">
                      +{amount} ₾
                    </button>
                  ))}
                </div>
                
                <div className="h-[1px] w-full bg-white/5 my-2"></div>
                
                <div>
                  <label className="block text-sm text-[#b5bac8] mb-3 font-medium">გადახდის მეთოდი</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-4 p-4 rounded-xl border border-[#9d5cff]/30 bg-[#9d5cff]/5 cursor-pointer transition-all">
                      <input type="radio" name="payment" className="w-5 h-5 accent-[#9d5cff]" defaultChecked />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">ბარათით გადახდა</span>
                        <span className="text-xs text-[#b5bac8]">Visa, Mastercard, Amex</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-white/20 bg-[#0d0e13] cursor-pointer transition-all opacity-70 hover:opacity-100">
                      <input type="radio" name="payment" className="w-5 h-5 accent-[#9d5cff]" />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">კრიპტოვალუტა</span>
                        <span className="text-xs text-[#b5bac8]">USDT, BTC, ETH</span>
                      </div>
                    </label>
                  </div>
                </div>
                
                {topupSuccess && <div className="text-center text-emerald-500 font-bold animate-in fade-in">გადახდა წარმატებულია! ბალანსი შეივსო.</div>}
                
                <button onClick={async () => {
                  if (!user || !profile || !topupAmount) return;
                  const amount = parseFloat(topupAmount);
                  if (isNaN(amount) || amount <= 0) return;
                  
                  try {
                    const { doc, updateDoc } = await import('firebase/firestore');
                    const { db } = await import('./lib/firebase');
                    await updateDoc(doc(db, 'users', user.uid), {
                      balance: (profile.balance || 0) + amount
                    });
                    setTopupSuccess(true);
                    setTimeout(() => setTopupSuccess(false), 3000);
                    setTopupAmount('');
                  } catch (e) {
                    console.error('Error topping up', e);
                  }
                }} className="w-full py-4 mt-4 bg-gradient-to-r from-[#9d5cff] to-[#ec4899] hover:from-[#ad73ff] hover:to-[#f060aa] active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#9d5cff]/20 text-lg">
                  გადახდა
                </button>
              </div>
            </div>
          </div>
        );
      case 'ranks':
        return (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">თქვენი <span className="text-[#9d5cff]">წოდება</span></h1>
              <p className="text-[#b5bac8] text-lg">შეასრულეთ მისიები, დააგროვეთ EXP და გადადით ახალ ეტაპზე ექსკლუზიური ფასდაკლებებისთვის.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
              <div className="bg-[#191c25] rounded-3xl p-8 border border-white/5 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="w-16 h-16 rounded-full bg-[#282c39] flex items-center justify-center mb-6 border-4 border-white/5 group-hover:border-[#cd7f32]/30 transition-all duration-500">
                  <Star size={24} className="text-[#cd7f32]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#cd7f32]">მებრძოლი</h3>
                <p className="text-xs text-[#777d8e] mb-6">0 - 500 EXP</p>
                <ul className="text-xs text-left w-full space-y-3 opacity-70">
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-[#cd7f32]" /> სტანდარტული ფასები</li>
                </ul>
              </div>

              <div className="bg-[#191c25] rounded-3xl p-8 border border-white/5 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="w-16 h-16 rounded-full bg-[#282c39] flex items-center justify-center mb-6 border-4 border-white/5 group-hover:border-[#c0c0c0]/30 transition-all duration-500">
                  <Award size={24} className="text-[#c0c0c0]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#c0c0c0]">ელიტა</h3>
                <p className="text-xs text-[#777d8e] mb-6">500 - 1000 EXP</p>
                <ul className="text-xs text-left w-full space-y-3 opacity-70">
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-[#c0c0c0]" /> 1% ფასდაკლება</li>
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-[#c0c0c0]" /> ბაზისური მხარდაჭერა</li>
                </ul>
              </div>

              <div className="bg-[#191c25] rounded-3xl p-8 border border-white/5 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="w-16 h-16 rounded-full bg-[#282c39] flex items-center justify-center mb-6 border-4 border-white/5 group-hover:border-[#ffd700]/30 transition-all duration-500">
                  <Gem size={24} className="text-[#ffd700]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#ffd700]">ოსტატი</h3>
                <p className="text-xs text-[#777d8e] mb-6">1000 - 1400 EXP</p>
                <ul className="text-xs text-left w-full space-y-3 opacity-70">
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-[#ffd700]" /> 3% ფასდაკლება</li>
                  <li className="flex items-center gap-2"><ChevronRight size={14} className="text-[#ffd700]" /> VIP შეთავაზებები</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-b from-[#191c25] to-[#1d152a] rounded-3xl p-8 border border-[#9d5cff]/30 flex flex-col items-center text-center relative overflow-hidden shadow-2xl shadow-[#9d5cff]/10 lg:scale-105 z-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#9d5cff]/20 blur-[40px] rounded-full"></div>
                <div className="absolute top-4 left-0 w-full text-center">
                  <span className="text-[10px] bg-[#9d5cff] text-white px-3 py-1 rounded-full uppercase font-bold tracking-widest shadow-md">მიმდინარე</span>
                </div>
                <div className="w-20 h-20 rounded-full bg-[#282c39] flex items-center justify-center mt-4 mb-6 border-4 border-[#9d5cff] shadow-[0_0_20px_rgba(157,92,255,0.3)]">
                  <Award size={32} className="text-[#9d5cff]" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">მეფე</h3>
                <p className="text-xs text-[#9d5cff] mb-6 font-medium">1400 / 1530 EXP</p>
                <div className="w-full h-1.5 bg-[#0d0e13] rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-gradient-to-r from-[#9d5cff] to-[#ec4899] w-[85%]"></div>
                </div>
                <ul className="text-xs text-left w-full space-y-3">
                  <li className="flex items-center gap-2 font-medium"><ChevronRight size={14} className="text-[#ec4899]" /> 5% ფასდაკლება ყველაფერზე</li>
                  <li className="flex items-center gap-2 font-medium"><ChevronRight size={14} className="text-[#ec4899]" /> პრიორიტეტული მხარდაჭერა</li>
                  <li className="flex items-center gap-2 font-medium"><ChevronRight size={14} className="text-[#ec4899]" /> უფასო განცხადებები</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">პროფილის პარამეტრები</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="md:col-span-1 flex flex-col gap-4">
                <div className="bg-[#191c25] rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full border-2 border-[#9d5cff] p-1 mb-4">
                    <div className="w-full h-full rounded-full bg-[#282c39] flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{profile?.displayName || user?.email?.split('@')[0]}</h3>
                  <p className="text-sm text-[#b5bac8] mb-4">{user?.email}</p>
                  <label className="w-full py-2 bg-white/5 hover:bg-white/10 active:scale-95 text-white text-sm font-semibold rounded-lg transition-all border border-white/10 cursor-pointer block">
                    სურათის შეცვლა
                    <input type="file" className="hidden" accept="image/*" onChange={() => {
                      setProfileSaved(true);
                      setTimeout(() => setProfileSaved(false), 3000);
                    }} />
                  </label>
                  <button onClick={() => {
                    firebaseSignOut(auth);
                    setCurrentView('home');
                  }} className="w-full mt-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-semibold rounded-lg transition-all border border-red-500/20">
                    გამოსვლა
                  </button>
                </div>
              </div>
              <div className="md:col-span-2 flex flex-col gap-6">
                <div className="bg-[#191c25] rounded-3xl p-6 md:p-8 border border-white/5 shadow-xl">
                  <h3 className="text-lg font-bold mb-6 border-b border-white/5 pb-4">პირადი ინფორმაცია</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-[#b5bac8] mb-2 font-medium">სახელი</label>
                      <input type="text" defaultValue={profile?.displayName || ''} className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9d5cff] transition-all text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-[#b5bac8] mb-2 font-medium">ელ. ფოსტა</label>
                      <input type="email" defaultValue={user?.email || ''} readOnly className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9d5cff] transition-all text-white/50 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm text-[#b5bac8] mb-2 font-medium">გვარი</label>
                      <input type="text" defaultValue="ლომიძე" className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9d5cff] transition-all text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-[#b5bac8] mb-2 font-medium">მობილური</label>
                      <input type="text" defaultValue="+995 555 12 34 56" className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9d5cff] transition-all text-white" />
                    </div>
                    <div>
                      <label className="block text-sm text-[#b5bac8] mb-2 font-medium">თამაშის ID</label>
                      <input type="text" defaultValue="89214455" className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9d5cff] transition-all text-white" />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between items-center">
                    {profileSaved && <span className="text-emerald-500 text-sm font-medium animate-in fade-in">პროფილის მონაცემები შენახულია!</span>}
                    <button onClick={() => {
                      setProfileSaved(true);
                      setTimeout(() => setProfileSaved(false), 3000);
                    }} className="px-8 py-3 bg-[#9d5cff] hover:bg-[#ad73ff] active:scale-95 text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#9d5cff]/20 ml-auto">
                      შენახვა
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'sell':
        return (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">პროდუქტის გაყიდვა</h1>
            <p className="text-[#b5bac8] text-center mb-6">შეავსეთ ინფორმაცია თქვენი პროდუქტის შესახებ</p>
            <div className="bg-[#191c25] rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <form className="flex flex-col gap-5" onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = formData.get('title') as string;
                const price = formData.get('price') as string;
                const type = formData.get('type') as ProductType;
                
                if (user && profile) {
                  await addProduct({
                    type,
                    title,
                    price: parseFloat(price),
                    sellerId: user.uid,
                    sellerName: profile.displayName || user.email?.split('@')[0] || 'Unknown User',
                    color: type === 'Account' ? 'bg-slate-500' : type === 'Diamonds' ? 'bg-[#9d5cff]' : 'bg-emerald-500',
                    rating: 0,
                    reviewsCount: 0
                  });
                  setCurrentView('home');
                }
              }}>
                <div>
                  <label className="block text-sm text-[#b5bac8] mb-2 font-medium">პროდუქტის კატეგორია</label>
                  <select name="type" className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9d5cff] transition-all text-white appearance-none" required>
                    <option value="Account">Account</option>
                    <option value="Diamonds">Diamonds</option>
                    <option value="Boost">Boost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#b5bac8] mb-2 font-medium">სათაური</label>
                  <input name="title" type="text" placeholder="მაგ: 5000 Diamonds" className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9d5cff] transition-all text-white" required />
                </div>
                <div>
                  <label className="block text-sm text-[#b5bac8] mb-2 font-medium">ფასი (₾)</label>
                  <input name="price" type="number" step="0.01" placeholder="0.00" className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9d5cff] transition-all text-white" required />
                </div>
                <div>
                  <label className="block text-sm text-[#b5bac8] mb-2 font-medium">აღწერა</label>
                  <textarea name="desc" placeholder="პროდუქტის დეტალური აღწერა..." rows={4} className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9d5cff] transition-all text-white"></textarea>
                </div>
                <button type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-[#9d5cff] to-[#ec4899] hover:from-[#ad73ff] hover:to-[#f060aa] active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#9d5cff]/20 text-lg">
                  გაყიდვა
                </button>
              </form>
            </div>
          </div>
        );
      case 'auth':
        return (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md mx-auto w-full mt-10">
            <div className="bg-[#191c25] rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" stroke="url(#grad2)" strokeWidth="2" fill="none"/>
                    <path d="M12 18C14.2091 18 16 16.2091 16 14C16 11.7909 14 8 12 8C10 8 8 11.7909 8 14C8 16.2091 9.79086 18 12 18Z" fill="url(#grad2)"/>
                    <defs>
                      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor:'#9d5cff', stopOpacity:1}} />
                        <stop offset="100%" style={{stopColor:'#ec4899', stopOpacity:1}} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center mb-8">{authMode === 'login' ? 'სისტემაში შესვლა' : 'რეგისტრაცია'}</h2>
              <form className="flex flex-col gap-4" onSubmit={async (e) => {
                e.preventDefault();
                setAuthError('');
                try {
                  if (authMode === 'login') {
                    await signInWithEmailAndPassword(auth, authEmail, authPassword);
                  } else {
                    const cred = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
                    // Minimal profile creation happens in the useAuth hook automatically on auth state change
                  }
                  setCurrentView('home');
                } catch (err: any) {
                  setAuthError(err.message || 'დაფიქსირდა შეცდომა');
                }
              }}>
                {authError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-2 text-center">
                    {authError}
                  </div>
                )}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-sm text-[#b5bac8] mb-2 font-medium">სახელი</label>
                    <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} placeholder="თქვენი სახელი" className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9d5cff] transition-all text-white" required />
                  </div>
                )}
                <div>
                  <label className="block text-sm text-[#b5bac8] mb-2 font-medium">ელ. ფოსტა</label>
                  <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="example@gmail.com" className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9d5cff] transition-all text-white" required />
                </div>
                <div>
                  <label className="block text-sm text-[#b5bac8] mb-2 font-medium">პაროლი</label>
                  <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9d5cff] transition-all text-white" required />
                </div>
                {authMode === 'register' && (
                  <div>
                    <label className="block text-sm text-[#b5bac8] mb-2 font-medium">გაიმეორეთ პაროლი</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-[#0d0e13] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9d5cff] transition-all text-white" required />
                  </div>
                )}
                <button type="submit" className="w-full py-4 mt-4 bg-gradient-to-r from-[#9d5cff] to-[#ec4899] hover:from-[#ad73ff] hover:to-[#f060aa] active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#9d5cff]/20">
                  {authMode === 'login' ? 'შესვლა' : 'რეგისტრაცია'}
                </button>
              </form>
              <div className="mt-6 text-center">
                <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-sm text-[#b5bac8] hover:text-white transition-colors">
                  {authMode === 'login' ? 'არ გაქვს ანგარიში? დარეგისტრირდი' : 'უკვე გაქვს ანგარიში? შედი'}
                </button>
              </div>
            </div>
          </div>
        );
      case 'search_results':
        const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.type.toLowerCase().includes(searchQuery.toLowerCase()));
        return (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold">ძიების შედეგები: <span className="text-[#9d5cff]">"{searchQuery}"</span></h2>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product, idx) => (
                  <div key={product.id + idx} onClick={() => setSelectedProduct(product)} className="bg-[#191c25] rounded-2xl border border-white/5 overflow-hidden flex flex-col group hover:border-white/10 transition-all hover:-translate-y-1 duration-300 cursor-pointer">
                    <div className="aspect-video bg-[#282c39] relative">
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider text-white z-10">{product.type}</div>
                      <div className="w-full h-full flex items-center justify-center opacity-40 text-white group-hover:scale-110 transition-transform duration-500">
                        {getProductIcon(product.type, product.icon)}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-[#9d5cff] transition-colors">{product.title}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs">
                          <div className={`w-4 h-4 rounded-full ${product.color}`}></div>
                          <span className="opacity-60 hover:opacity-100 hover:text-[#9d5cff] transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); handleSellerClick(product.sellerId); }}>{product.seller}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-[#ffd700]">
                          <Star size={12} fill="currentColor" />
                          <span>{product.rating.toFixed(1)}</span>
                          <span className="text-white/40 ml-1">({product.reviewsCount})</span>
                        </div>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-lg font-bold text-[#f8fafc]">{product.price} ₾</span>
                        <button className="px-4 py-1.5 bg-white/5 hover:bg-[#9d5cff]/20 text-[#9d5cff] rounded-lg text-xs font-bold transition-all">ყიდვა</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                  <Search size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2">შედეგი არ მოიძებნა</h3>
                <p className="text-[#b5bac8]">სცადეთ სხვა საძიებო სიტყვა</p>
              </div>
            )}
          </div>
        );
      case 'seller_profile':
        if (!selectedSellerId) return null;
        const sellerProducts = products.filter(p => p.sellerId === selectedSellerId);
        const totalRating = sellerProducts.reduce((acc, p) => acc + (p.rating || 0), 0);
        const avgRating = sellerProducts.length > 0 ? (totalRating / sellerProducts.length).toFixed(1) : '0.0';
        const totalReviews = sellerProducts.reduce((acc, p) => acc + (p.reviewsCount || 0), 0);
        
        return (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Seller Info Card */}
            <div className="bg-[#191c25] rounded-3xl p-6 md:p-10 border border-white/5 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center md:items-start shadow-2xl">
              <div className="absolute right-0 top-0 w-64 h-64 bg-[#ec4899]/10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-full bg-gradient-to-br from-[#9d5cff] to-[#ec4899] p-1 shadow-lg shadow-[#9d5cff]/20">
                <div className="w-full h-full bg-[#13151c] rounded-full flex items-center justify-center overflow-hidden">
                   <User size={48} className="text-white/50" />
                </div>
              </div>
              
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {viewedSellerProfile?.displayName || sellerProducts[0]?.seller || 'გამყიდველი'}
                </h1>
                <p className="text-[#b5bac8] text-sm md:text-base mb-6">
                  {viewedSellerProfile?.email || 'ელ.ფოსტა მიუწვდომელია'}
                </p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="bg-black/20 rounded-xl px-5 py-3 border border-white/5 flex flex-col items-center">
                    <span className="text-sm text-[#b5bac8] mb-1">პროდუქტები</span>
                    <span className="text-xl font-bold">{sellerProducts.length}</span>
                  </div>
                  <div className="bg-black/20 rounded-xl px-5 py-3 border border-white/5 flex flex-col items-center">
                    <span className="text-sm text-[#b5bac8] mb-1">რეიტინგი</span>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-[#ffd700]" fill="currentColor" />
                      <span className="text-xl font-bold">{avgRating}</span>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-xl px-5 py-3 border border-white/5 flex flex-col items-center">
                    <span className="text-sm text-[#b5bac8] mb-1">შეფასებები</span>
                    <span className="text-xl font-bold">{totalReviews}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Products */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-6 border-b border-white/5 pb-4">გამყიდველის პროდუქტები</h2>
              {sellerProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {sellerProducts.map((product, idx) => (
                    <div key={product.id + idx} onClick={() => setSelectedProduct(product)} className="bg-[#191c25] rounded-2xl border border-white/5 overflow-hidden flex flex-col group hover:border-white/10 transition-all hover:-translate-y-1 duration-300 cursor-pointer">
                      <div className="aspect-video bg-[#282c39] relative">
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded text-[10px] font-bold uppercase tracking-wider text-white z-10">{product.type}</div>
                        <div className="w-full h-full flex items-center justify-center opacity-40 text-white group-hover:scale-110 transition-transform duration-500">
                          {getProductIcon(product.type, product.icon)}
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-[#9d5cff] transition-colors">{product.title}</h3>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 opacity-60 text-xs">
                            <div className={`w-4 h-4 rounded-full ${product.color}`}></div>
                            <span>{product.seller}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-[#ffd700]">
                            <Star size={12} fill="currentColor" />
                            <span>{product.rating.toFixed(1)}</span>
                            <span className="text-white/40 ml-1">({product.reviewsCount})</span>
                          </div>
                        </div>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="text-lg font-bold text-[#f8fafc]">{product.price} ₾</span>
                          <button className="px-4 py-1.5 bg-white/5 hover:bg-[#9d5cff]/20 text-[#9d5cff] rounded-lg text-xs font-bold transition-all">ყიდვა</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 border-dashed rounded-3xl">
                  <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">პროდუქტები ვერ მოიძებნა</h3>
                  <p className="text-[#b5bac8] text-sm">ამ გამყიდველს ჯერ არ დაუმატებია პროდუქტები.</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-[#0d0e13] text-[#f8fafc] overflow-hidden">
      {/* Abstract Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#9d5cff]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#ec4899]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] bg-[#3b82f6]/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between px-4 md:px-8 py-4 bg-[#13151c]/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" stroke="url(#grad1)" strokeWidth="2" fill="none"/>
              <path d="M12 18C14.2091 18 16 16.2091 16 14C16 11.7909 14 8 12 8C10 8 8 11.7909 8 14C8 16.2091 9.79086 18 12 18Z" fill="url(#grad1)"/>
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#9d5cff', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'#ec4899', stopOpacity:1}} />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="text-lg md:text-xl font-bold tracking-tight uppercase">LOTUS STORE</span>
        </div>

        <div className="hidden md:block flex-1 max-w-md px-10">
          <div className="relative group">
            <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="მოძებნე პროდუქტი, კატეგორია..." className="w-full bg-[#191c25] border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#9d5cff]/50 transition-all text-white placeholder-white/40" />
            <div className="absolute right-3 top-2.5 text-white/30">
              <Search size={18} />
            </div>
          </div>
        </div>

        <div className="flex md:hidden items-center gap-4 relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#ec4899] rounded-full"></span>
          </button>
          {showNotifications && (
            <div className="absolute top-12 right-12 w-64 bg-[#191c25] border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-sm font-bold mb-3 border-b border-white/5 pb-2">შეტყობინებები</h4>
              <p className="text-sm text-[#b5bac8] text-center py-4">ახალი შეტყობინებები არ არის</p>
            </div>
          )}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#" onClick={handleLinkClick('home')} className={`text-sm font-medium transition-colors ${currentView === 'home' ? 'text-[#9d5cff]' : 'hover:text-[#9d5cff]'}`}>მთავარი</a>
          <a href="#" onClick={handleLinkClick('products')} className={`text-sm font-medium transition-colors ${currentView === 'products' ? 'text-[#9d5cff]' : 'hover:text-[#9d5cff]'}`}>პროდუქტები</a>
          <a href="#" onClick={handleLinkClick('topup')} className={`text-sm font-medium transition-colors ${currentView === 'topup' ? 'text-[#9d5cff]' : 'hover:text-[#9d5cff]'}`}>შევსება</a>
          <a href="#" onClick={handleLinkClick('ranks')} className={`text-sm font-medium transition-colors ${currentView === 'ranks' ? 'text-[#9d5cff]' : 'hover:text-[#9d5cff]'}`}>წოდებები</a>
          <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
          <div className="flex items-center gap-4 relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ec4899] rounded-full"></span>
            </button>
            {showNotifications && (
              <div className="absolute top-12 right-4 w-72 bg-[#191c25] border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <h4 className="text-sm font-bold mb-3 border-b border-white/5 pb-2">შეტყობინებები</h4>
                <p className="text-sm text-[#b5bac8] text-center py-6">ახალი შეტყობინებები არ არის</p>
              </div>
            )}
            <button onClick={handleLinkClick('profile')} className={`w-9 h-9 rounded-full bg-gradient-to-tr from-[#9d5cff] to-[#ec4899] p-[2px] active:scale-95 transition-all ${currentView === 'profile' ? 'ring-2 ring-[#9d5cff] ring-offset-2 ring-offset-[#0d0e13]' : ''}`}>
              <div className="w-full h-full rounded-full bg-[#191c25] flex items-center justify-center overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-[72px] left-0 w-full h-[calc(100vh-72px)] bg-[#0d0e13]/95 backdrop-blur-xl z-40 flex flex-col p-6 overflow-y-auto border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-4 mb-8">
            <a href="#" onClick={handleMobileLinkClick('home')} className={`text-lg font-semibold transition-colors py-2 border-b border-white/5 ${currentView === 'home' ? 'text-[#9d5cff]' : 'hover:text-[#9d5cff]'}`}>მთავარი</a>
            <a href="#" onClick={handleMobileLinkClick('products')} className={`text-lg font-semibold transition-colors py-2 border-b border-white/5 ${currentView === 'products' ? 'text-[#9d5cff]' : 'hover:text-[#9d5cff]'}`}>პროდუქტები</a>
            <a href="#" onClick={handleMobileLinkClick('topup')} className={`text-lg font-semibold transition-colors py-2 border-b border-white/5 ${currentView === 'topup' ? 'text-[#9d5cff]' : 'hover:text-[#9d5cff]'}`}>შევსება</a>
            <a href="#" onClick={handleMobileLinkClick('ranks')} className={`text-lg font-semibold transition-colors py-2 border-b border-white/5 ${currentView === 'ranks' ? 'text-[#9d5cff]' : 'hover:text-[#9d5cff]'}`}>წოდებები</a>
          </div>
          
          {isLoggedIn ? (
          <div onClick={handleMobileLinkClick('profile')} className="flex items-center gap-4 mb-8 bg-[#191c25] p-4 rounded-2xl border border-white/5 cursor-pointer active:scale-95 transition-all">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-[#9d5cff] to-[#ec4899] p-[2px] ${currentView === 'profile' ? 'ring-2 ring-[#9d5cff] ring-offset-2 ring-offset-[#0d0e13]' : ''}`}>
              <div className="w-full h-full rounded-full bg-[#191c25] flex items-center justify-center overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
            <div>
              <div className="font-bold">{profile?.displayName || user?.email?.split('@')[0]}</div>
              <div className="text-xs text-[#b5bac8]">ID: {user?.uid.substring(0, 5).toUpperCase()} • {profile?.balance || 0} ₾</div>
            </div>
          </div>
          ) : (
          <div onClick={() => { setCurrentView('auth'); setIsMenuOpen(false); }} className="flex items-center justify-center mb-8 bg-gradient-to-r from-[#9d5cff]/20 to-[#ec4899]/20 p-4 rounded-2xl border border-[#9d5cff]/30 cursor-pointer active:scale-95 transition-all text-white font-bold">
            სისტემაში შესვლა
          </div>
          )}
          
          <div className="relative group mb-6">
            <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="მოძებნე პროდუქტი..." className="w-full bg-[#191c25] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9d5cff]/50 transition-all text-white placeholder-white/40" />
            <div className="absolute right-4 top-3.5 text-white/30">
              <Search size={18} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-8 overflow-y-auto lg:overflow-hidden relative z-0">
        
        {/* Left Column: Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-8 lg:overflow-y-auto lg:pr-2 lg:pb-10 scrollbar-hide">
          {renderContent()}
        </div>

        {/* Right Column: Sidebar Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6 shrink-0 lg:h-full lg:overflow-y-auto lg:pb-10">
          {/* User Profile Card */}
          {isLoggedIn ? (
          <div className="bg-[#191c25] rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-white">
              <Award size={80} strokeWidth={1} />
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-[#9d5cff] p-1">
                   <div className="w-full h-full rounded-full bg-[#282c39] flex items-center justify-center text-white">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                   </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#9d5cff] rounded-full p-1 border-2 border-[#191c25] text-white">
                  <Award size={12} strokeWidth={3} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                   <h3 className="text-lg font-bold">{profile?.displayName || user?.email?.split('@')[0]}</h3>
                   <span className="text-[10px] bg-[#9d5cff]/20 text-[#9d5cff] px-2 py-0.5 rounded-full border border-[#9d5cff]/30 uppercase font-bold tracking-widest">PRO</span>
                </div>
                <p className="text-xs text-[#b5bac8]">{profile?.role === 'admin' ? 'ადმინისტრატორი' : 'მომხმარებელი'} • ID: {user?.uid.substring(0, 5).toUpperCase()}</p>
              </div>
            </div>

            <div className="bg-[#0d0e13] rounded-2xl p-4 border border-white/5 mb-6">
               <div className="flex justify-between items-center mb-1">
                 <span className="text-xs text-[#b5bac8]">ბალანსი</span>
                 <button onClick={handleLinkClick('topup')} className="text-xs text-[#9d5cff] cursor-pointer hover:underline transition-all active:scale-95">შევსება</button>
               </div>
               <div className="text-2xl font-bold tracking-tight">{(profile?.balance || 0).toFixed(2)} ₾</div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#b5bac8] flex items-center gap-2">
                  <Award size={14} />
                  რანკი: მეფე
                </span>
                <span className="text-[#9d5cff] font-medium">1400 EXP</span>
              </div>
              <div className="w-full h-1.5 bg-[#282c39] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#9d5cff] to-[#ec4899] w-[85%]"></div>
              </div>
              <p className="text-[10px] text-center text-[#777d8e]">შემდეგ რანკამდე დარჩენილია 130 EXP</p>
            </div>
          </div>
          ) : (
          <div className="bg-[#191c25] rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
            <h3 className="text-lg font-bold mb-2">ავტორიზაცია</h3>
            <p className="text-sm text-[#b5bac8] mb-6">შედით სისტემაში ანგარიშის სამართავად და პროდუქტების შესაძენად</p>
            <button onClick={() => setCurrentView('auth')} className="w-full py-3 bg-gradient-to-r from-[#9d5cff] to-[#ec4899] hover:from-[#ad73ff] hover:to-[#f060aa] active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#9d5cff]/20">
              შესვლა
            </button>
          </div>
          )}

          {/* Information / Support Sidebar Section */}
          <div className="bg-[#191c25] rounded-3xl p-6 border border-white/5 flex-1 flex flex-col gap-4">
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#777d8e] mb-2">სწრაფი წვდომა</h4>
            <a href="https://t.me/lotus_store_ge" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-[#0d0e13]/50 rounded-xl hover:bg-[#202430] active:scale-[0.98] transition-all group text-left">
              <div className="p-2 bg-[#9d5cff]/10 text-[#9d5cff] rounded-lg group-hover:bg-[#9d5cff] group-hover:text-white transition-all">
                <HelpCircle size={18} />
              </div>
              <span className="text-sm font-medium">დახმარება (Telegram)</span>
            </a>
            <button onClick={handleLinkClick('topup')} className="flex items-center gap-3 p-3 bg-[#0d0e13]/50 rounded-xl hover:bg-[#202430] active:scale-[0.98] transition-all group text-left">
              <div className="p-2 bg-[#ec4899]/10 text-[#ec4899] rounded-lg group-hover:bg-[#ec4899] group-hover:text-white transition-all">
                <CreditCard size={18} />
              </div>
              <span className="text-sm font-medium">გადახდის მეთოდები</span>
            </button>
            
            <div className="mt-auto pt-6">
              <div className="p-4 bg-gradient-to-tr from-[#9d5cff]/5 to-[#ec4899]/5 rounded-2xl border border-white/5">
                 <p className="text-xs text-center text-[#b5bac8] italic">"საუკეთესო პლატფორმა Mobile Legends-ის მოყვარულებისთვის."</p>
              </div>
              <p className="text-[10px] text-center mt-4 text-[#777d8e]">© 2024 LOTUS STORE. ყველა უფლება დაცულია.</p>
            </div>
          </div>
        </div>
      </main>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0d0e13]/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedProduct(null)}>
          <div className="bg-[#191c25] rounded-3xl border border-white/10 w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <div className="aspect-[2/1] bg-[#282c39] relative flex items-center justify-center text-white/40">
               <div className="absolute top-4 right-4 px-3 py-1 bg-black/40 backdrop-blur-md rounded text-xs font-bold uppercase tracking-wider text-white z-10">{selectedProduct.type}</div>
               <button onClick={() => setSelectedProduct(null)} className="absolute top-4 left-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all z-10">
                 <X size={20} />
               </button>
               <div className="scale-[2]">
                 {getProductIcon(selectedProduct.type, selectedProduct.icon)}
               </div>
            </div>
            <div className="p-6 md:p-8 flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-white">{selectedProduct.title}</h2>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-[#f8fafc]">{selectedProduct.price} ₾</span>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/10 transition-colors" onClick={() => { setSelectedProduct(null); handleSellerClick(selectedProduct.sellerId); }}>
                      <div className={`w-3 h-3 rounded-full ${selectedProduct.color}`}></div>
                      <span className="text-sm opacity-80 hover:opacity-100 hover:text-[#9d5cff]">{selectedProduct.seller}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[#ffd700]">
                      <Star size={14} fill="currentColor" />
                      <span className="font-bold">{selectedProduct.rating.toFixed(1)}</span>
                      <span className="text-white/40">({selectedProduct.reviewsCount} შეფასება)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="h-[1px] w-full bg-white/5"></div>
              
              <div className="flex flex-col gap-3 text-sm text-[#b5bac8]">
                <p>ეს არის პროდუქტის დეტალური აღწერა. ის შეიცავს ყველა საჭირო ინფორმაციას, რაც მყიდველმა უნდა იცოდეს შეძენამდე. გამყიდველი უზრუნველყოფს 100% უსაფრთხოებას და სწრაფ მიწოდებას.</p>
                <ul className="space-y-2 mt-2">
                  <li className="flex items-center gap-2"><ChevronRight size={16} className="text-[#9d5cff]" /> სწრაფი მიწოდება</li>
                  <li className="flex items-center gap-2"><ChevronRight size={16} className="text-[#9d5cff]" /> 100% უსაფრთხო ტრანზაქცია</li>
                  <li className="flex items-center gap-2"><ChevronRight size={16} className="text-[#9d5cff]" /> სრული წვდომა</li>
                </ul>
              </div>
              
              <button onClick={async () => {
                if (!isLoggedIn || !user || !profile) {
                  setSelectedProduct(null);
                  setCurrentView('auth');
                } else {
                  const productPrice = parseFloat(selectedProduct.price);
                  if (profile.balance < productPrice) {
                    alert("არასაკმარისი ბალანსი! გთხოვთ შეავსოთ ანგარიში.");
                    setSelectedProduct(null);
                    setCurrentView('topup');
                    return;
                  }
                  try {
                    const { doc, updateDoc, addDoc, collection, serverTimestamp } = await import('firebase/firestore');
                    const { db } = await import('./lib/firebase');
                    await updateDoc(doc(db, 'users', user.uid), {
                      balance: profile.balance - productPrice
                    });
                    await addDoc(collection(db, 'transactions'), {
                      userId: user.uid,
                      amount: productPrice,
                      type: 'purchase',
                      productId: selectedProduct.id,
                      createdAt: serverTimestamp()
                    });
                    alert("პროდუქტი წარმატებით შეიძინეთ!");
                    setSelectedProduct(null);
                  } catch(e) {
                    console.error("Error purchasing", e);
                    alert("გადახდისას დაფიქსირდა შეცდომა.");
                  }
                }
              }} className="w-full py-4 mt-2 bg-gradient-to-r from-[#9d5cff] to-[#ec4899] hover:from-[#ad73ff] hover:to-[#f060aa] active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#9d5cff]/20 text-lg flex items-center justify-center gap-2">
                ყიდვა ახლავე
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

