import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchCategories, 
  fetchUnitsByCategory, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  addUnit,
  updateUnit,
  deleteUnit
} from '../services/unitService';
import { SEED_DATA } from '../seedData';
import { Category, Unit } from '../types';
import * as LucideIcons from 'lucide-react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  ChevronRight, 
  LogOut,
  Settings,
  ArrowLeft,
  Search,
  CheckCircle2
} from 'lucide-react';

const ADMIN_EMAIL = 'nazib.cse@gmail.com';

// Filter out non-component exports if any, and keep only icons
const ICON_MAP: Record<string, any> = Object.entries(LucideIcons).reduce((acc, [name, Icon]) => {
  // Lucide icons are typically objects with a specific structure in React
  // We want to avoid internal helpers like createLucideIcon
  if (name !== 'createLucideIcon' && name !== 'LucideIcon' && (typeof Icon === 'function' || typeof Icon === 'object')) {
    acc[name] = Icon;
  }
  return acc;
}, {} as Record<string, any>);

export default function AdminScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [isEditingUnit, setIsEditingUnit] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({});
  const [currentUnit, setCurrentUnit] = useState<Partial<Unit>>({});
  const [isSeeding, setIsSeeding] = useState(false);
  const [showSeedSuccess, setShowSeedSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        if (u.email === ADMIN_EMAIL) {
          setUser(u);
          setLoginError(null);
          loadCategories();
        } else {
          setUser(null);
          setLoginError(`Access denied. ${u.email} is not authorized.`);
          signOut(auth);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await fetchCategories();
      // Filter out Currency from admin as it's built-in
      const filteredCats = cats.filter(c => c.nameEn.toLowerCase() !== 'currency' && c.id !== 'currency');
      setCategories(filteredCats);
    } catch (error: any) {
      console.error('Failed to load categories', error);
      setLoginError(error.message || 'Failed to load categories');
    }
  };

  const loadUnits = async (cat: Category) => {
    setLoadingUnits(true);
    try {
      const uns = await fetchUnitsByCategory(cat.id, cat.nameEn);
      setUnits(uns);
    } catch (error: any) {
      console.error('Failed to load units', error);
      setLoginError(error.message || 'Failed to load units');
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleLogin = async () => {
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login failed', error);
      setLoginError(error.message || 'Login failed. Please try again.');
    }
  };

  const handleLogout = () => signOut(auth);

  const handleSaveCategory = async () => {
    if (!currentCategory.nameEn || !currentCategory.nameBn) return;
    
    if (currentCategory.id) {
      await updateCategory(currentCategory.id, currentCategory);
    } else {
      await addCategory({
        nameEn: currentCategory.nameEn,
        nameBn: currentCategory.nameBn,
        iconName: currentCategory.iconName || 'Grid',
        order: currentCategory.order || categories.length
      });
    }
    setIsEditingCategory(false);
    setCurrentCategory({});
    loadCategories();
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id);
      loadCategories();
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
        setUnits([]);
      }
    }
  };

  const handleSaveUnit = async () => {
    if (!selectedCategory || !currentUnit.nameEn || !currentUnit.nameBn) return;
    
    if (currentUnit.id) {
      await updateUnit(currentUnit.id, currentUnit);
    } else {
      await addUnit({
        nameEn: currentUnit.nameEn,
        nameBn: currentUnit.nameBn,
        symbol: currentUnit.symbol || '',
        multiplier: currentUnit.multiplier || 1,
        isBase: currentUnit.isBase || false,
        categoryId: selectedCategory.id
      });
    }
    setIsEditingUnit(false);
    setCurrentUnit({});
    loadUnits(selectedCategory);
  };

  const handleDeleteUnit = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      await deleteUnit(id);
      if (selectedCategory) loadUnits(selectedCategory);
    }
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm('This will populate the database with common categories and units. Continue?')) return;
    
    setIsSeeding(true);
    try {
      for (const item of SEED_DATA) {
        // Add category
        const catRef = await addCategory(item.category);
        
        // Add its units
        for (const unit of item.units) {
          await addUnit({
            ...unit,
            categoryId: catRef.id
          });
        }
      }
      setShowSeedSuccess(true);
      setTimeout(() => setShowSeedSuccess(false), 3000);
      loadCategories();
    } catch (error: any) {
      console.error('Seeding failed', error);
      alert('Seeding failed: ' + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-white dark:bg-card-dark">
        <div className="mb-8 p-4 rounded-full bg-blue-50 dark:bg-blue-900/20">
          <Settings size={64} className="text-blue-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Admin Access</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-xs">
          Please sign in with nazib.cse@gmail.com to access the admin dashboard.
        </p>
        
        {loginError && (
          <div className="mb-6 p-4 w-full max-w-sm bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
            {loginError}
          </div>
        )}

        <button 
          onClick={handleLogin}
          className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-secondary-dark border border-gray-200 dark:border-border-dark rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/pwa/google.svg" alt="Google" className="w-6 h-6" />
          <span className="font-medium text-gray-700 dark:text-gray-200">Sign in with Google</span>
        </button>
        <a href="/" className="mt-6 text-sm text-gray-500 hover:text-blue-500 transition-colors">Back to Home</a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-bg-dark">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-border-dark">
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.href = '/'} className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-dark rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Rupantor Admin</h1>
        </div>
        
        <AnimatePresence>
          {showSeedSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 z-[100]"
            >
              <div className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-2xl shadow-xl shadow-green-500/20">
                <CheckCircle2 size={20} />
                <span className="font-bold">Database Seeded Successfully!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSeeding ? 'Seeding...' : 'Seed Database'}
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 hidden md:inline">{user.email}</span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Categories Sidebar */}
        <aside className="w-full md:w-80 flex flex-col border-r border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark">
          <div className="p-4 border-b border-gray-200 dark:border-border-dark flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Categories</h2>
            <button 
              onClick={() => {
                setIsEditingCategory(true);
                setCurrentCategory({ iconName: 'Grid', order: categories.length });
              }}
              className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {categories.map((cat) => {
              const Icon = ICON_MAP[cat.iconName] || LucideIcons.Grid;
              return (
                <div 
                  key={cat.id}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    selectedCategory?.id === cat.id 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm' 
                      : 'hover:bg-gray-50 dark:hover:bg-secondary-dark text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    loadUnits(cat);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedCategory?.id === cat.id ? 'bg-white dark:bg-secondary-dark' : 'bg-gray-100 dark:bg-secondary-dark'}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{cat.nameEn}</div>
                      <div className="text-xs opacity-60">{cat.nameBn}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentCategory(cat);
                        setIsEditingCategory(true);
                      }}
                      className="p-1 hover:text-blue-500"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.id);
                      }}
                      className="p-1 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content Area (Units) */}
        <main className="flex-1 flex flex-col bg-white dark:bg-card-dark">
          {selectedCategory ? (
            <>
              <div className="p-6 border-b border-gray-200 dark:border-border-dark flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCategory.nameEn} Units</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCategory.nameEn.toLowerCase().includes('currency') 
                      ? 'Showing real-time data from ExchangeRate-API' 
                      : `Manage units for ${selectedCategory.nameBn}`}
                  </p>
                </div>
                {!selectedCategory.nameEn.toLowerCase().includes('currency') && (
                  <button 
                    onClick={() => {
                      setIsEditingUnit(true);
                      setCurrentUnit({ isBase: false, multiplier: 1 });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    <Plus size={20} />
                    <span className="font-medium">Add Unit</span>
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {loadingUnits ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500">Fetching units...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {units.map((unit) => (
                        <div key={unit.id} className="p-4 border border-gray-200 dark:border-border-dark rounded-2xl bg-gray-50/50 dark:bg-secondary-dark hover:border-blue-200 dark:hover:border-blue-900/30 transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 dark:text-white">{unit.nameEn}</span>
                                {unit.isBase && <span className="px-2 py-0.5 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full uppercase font-bold tracking-wider">Base</span>}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{unit.nameBn}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setCurrentUnit(unit); setIsEditingUnit(true); }} className="p-2 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 size={16} /></button>
                              <button onClick={() => handleDeleteUnit(unit.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Symbol: <span className="text-gray-700 dark:text-gray-300 font-medium">{unit.symbol}</span></span>
                            <span className="text-gray-400">Multiplier: <span className="text-gray-700 dark:text-gray-300 font-medium">{unit.multiplier.toFixed(6)}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {units.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <div className="p-4 rounded-full bg-gray-100 dark:bg-secondary-dark mb-4">
                          <LucideIcons.Ruler size={32} />
                        </div>
                        <p>No units found for this category</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <div className="p-6 rounded-full bg-gray-50 dark:bg-secondary-dark mb-4">
                <LucideIcons.Grid size={48} className="opacity-20" />
              </div>
              <p className="text-lg">Select a category to manage its units</p>
            </div>
          )}
        </main>
      </div>

      {/* Category Modal */}
      {isEditingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{currentCategory.id ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setIsEditingCategory(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Name (English)</label>
                <input 
                  type="text" 
                  value={currentCategory.nameEn || ''} 
                  onChange={(e) => setCurrentCategory({...currentCategory, nameEn: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="e.g. Length"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Name (Bengali)</label>
                <input 
                  type="text" 
                  value={currentCategory.nameBn || ''} 
                  onChange={(e) => setCurrentCategory({...currentCategory, nameBn: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="e.g. দৈর্ঘ্য"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Category Icon</label>
                  <button 
                    onClick={() => setIsIconPickerOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl border border-transparent hover:border-blue-500 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl text-blue-500 shadow-sm">
                        {(() => {
                          const Icon = ICON_MAP[currentCategory.iconName || 'Grid'] || LucideIcons.Grid;
                          return <Icon size={24} />;
                        })()}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {currentCategory.iconName || 'Select Icon'}
                        </div>
                        <div className="text-xs text-gray-500">Click to change icon</div>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </button>
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Order</label>
                  <input 
                    type="number" 
                    value={currentCategory.order || 0} 
                    onChange={(e) => setCurrentCategory({...currentCategory, order: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 flex gap-3">
              <button onClick={() => setIsEditingCategory(false)} className="flex-1 px-4 py-3 font-semibold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
              <button onClick={handleSaveCategory} className="flex-1 px-4 py-3 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">Save Category</button>
            </div>
          </div>
        </div>
      )}

      {/* Icon Picker Modal */}
      {isIconPickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select Icon</h3>
                <p className="text-xs text-gray-500 mt-1">{Object.keys(ICON_MAP).length} icons available</p>
              </div>
              <button onClick={() => { setIsIconPickerOpen(false); setIconSearchQuery(''); }} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="px-6 py-4">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search icons (e.g. 'home', 'user', 'settings')..." 
                  value={iconSearchQuery}
                  onChange={(e) => setIconSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[50vh] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700">
                {Object.keys(ICON_MAP)
                  .filter(name => name.toLowerCase().includes(iconSearchQuery.toLowerCase()))
                  .slice(0, 500) // Limit to 500 for performance, search still works on all
                  .map(iconName => {
                    const Icon = ICON_MAP[iconName];
                    const isSelected = currentCategory.iconName === iconName;
                    return (
                      <button
                        key={iconName}
                        onClick={() => {
                          setCurrentCategory({...currentCategory, iconName});
                          setIsIconPickerOpen(false);
                          setIconSearchQuery('');
                        }}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                          isSelected 
                            ? 'bg-blue-500 text-white shadow-lg scale-105' 
                            : 'bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500'
                        }`}
                        title={iconName}
                      >
                        <Icon size={20} />
                        <span className="mt-1.5 text-[8px] font-medium truncate w-full text-center">{iconName}</span>
                      </button>
                    );
                  })}
              </div>
              {Object.keys(ICON_MAP).filter(name => name.toLowerCase().includes(iconSearchQuery.toLowerCase())).length > 500 && (
                <p className="text-center text-[10px] text-gray-400 mt-4 italic">Showing first 500 matches. Use search to find more.</p>
              )}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 flex justify-center">
              <button 
                onClick={() => { setIsIconPickerOpen(false); setIconSearchQuery(''); }}
                className="px-8 py-3 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unit Modal */}
      {isEditingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{currentUnit.id ? 'Edit Unit' : 'New Unit'}</h3>
              <button onClick={() => setIsEditingUnit(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Name (EN)</label>
                  <input 
                    type="text" 
                    value={currentUnit.nameEn || ''} 
                    onChange={(e) => setCurrentUnit({...currentUnit, nameEn: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Name (BN)</label>
                  <input 
                    type="text" 
                    value={currentUnit.nameBn || ''} 
                    onChange={(e) => setCurrentUnit({...currentUnit, nameBn: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Symbol</label>
                  <input 
                    type="text" 
                    value={currentUnit.symbol || ''} 
                    onChange={(e) => setCurrentUnit({...currentUnit, symbol: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Multiplier</label>
                  <input 
                    type="number" 
                    value={currentUnit.multiplier || 1} 
                    onChange={(e) => setCurrentUnit({...currentUnit, multiplier: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-2xl">
                <input 
                  type="checkbox" 
                  id="isBase"
                  checked={currentUnit.isBase || false} 
                  onChange={(e) => setCurrentUnit({...currentUnit, isBase: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="isBase" className="text-sm font-medium text-gray-700 dark:text-gray-300">This is the base unit for conversion</label>
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-zinc-800/50 flex gap-3">
              <button onClick={() => setIsEditingUnit(false)} className="flex-1 px-4 py-3 font-semibold text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
              <button onClick={handleSaveUnit} className="flex-1 px-4 py-3 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">Save Unit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
