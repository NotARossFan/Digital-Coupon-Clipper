import React, { useState, useEffect } from 'react';
import { Coupon } from '../types';

interface CouponPlaygroundProps {
  onRefReset: () => void;
}

const CouponPlayground: React.FC<CouponPlaygroundProps> = ({ onRefReset }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize dummy coupons
  useEffect(() => {
    const initialCoupons: Coupon[] = Array.from({ length: 6 }).map((_, i) => ({
      id: i + 1,
      product: ['Gala Apples', 'Whole Wheat Bread', 'Large Eggs', 'Almond Milk', 'Greek Yogurt', 'Chicken Breast'][i],
      discount: ['$0.50 off', '$1.00 off', '$0.75 off', '$1.25 off', '$0.40 off', '$2.00 off'][i],
      isClipped: false,
      image: `https://picsum.photos/seed/grocery${i}/150/150`,
    }));
    setCoupons(initialCoupons);
    onRefReset();
  }, [onRefReset]);

  const handleClip = (id: number) => {
    setCoupons(prev => prev.map(c => {
      if (c.id === id) {
        if (!c.isClipped) {
            setNotification(`Clipped ${c.product}!`);
            setTimeout(() => setNotification(null), 2000);
            return { ...c, isClipped: true };
        }
      }
      return c;
    }));
  };

  // Expose a global function for the demo script to call, simulating console interaction
  useEffect(() => {
    (window as any).demoClipAll = () => {
      setCoupons(prev => {
        const count = prev.filter(c => !c.isClipped).length;
        setNotification(`Auto-clipped ${count} coupons!`);
        setTimeout(() => setNotification(null), 3000);
        return prev.map(c => ({ ...c, isClipped: true }));
      });
    };
    return () => {
        delete (window as any).demoClipAll;
    }
  }, []);

  return (
    <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Test Playground</h3>
        <button 
          onClick={() => setCoupons(coupons.map(c => ({ ...c, isClipped: false })))}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Reset All
        </button>
      </div>
      
      <div className="relative flex-grow overflow-y-auto bg-slate-50 p-4 rounded-lg border border-slate-100">
        {notification && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg z-10 transition-all animate-bounce">
                {notification}
            </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {coupons.map(coupon => (
            <div key={coupon.id} className={`bg-white p-3 rounded-lg shadow-sm border ${coupon.isClipped ? 'border-emerald-400 ring-1 ring-emerald-100' : 'border-slate-200'} transition-all`}>
              <img src={coupon.image} alt={coupon.product} className="w-full h-24 object-cover rounded-md mb-3" />
              <h4 className="font-medium text-slate-800 text-sm truncate">{coupon.product}</h4>
              <p className="text-emerald-600 font-bold text-sm mb-3">{coupon.discount}</p>
              <button
                onClick={() => handleClip(coupon.id)}
                disabled={coupon.isClipped}
                // IMPORTANT: This class is what the AI should detect in a screenshot if this were a real site
                className={`w-full py-1.5 rounded text-xs font-semibold transition-colors demo-clip-btn ${
                  coupon.isClipped 
                    ? 'bg-slate-100 text-slate-400 cursor-default' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {coupon.isClipped ? 'Clipped' : 'Clip Coupon'}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 text-xs text-slate-400 text-center">
        This is a simulation. The generated script targets real websites, but you can test the logic here if you upload a screenshot of *this* block.
      </div>
    </div>
  );
};

export default CouponPlayground;