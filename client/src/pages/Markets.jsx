import React, { useEffect } from 'react';

import MarketList from '../components/MarketList';
import MobileNav from '../components/MobileNav';
import { useNavigate } from "react-router-dom";
import { ChevronLeft, BarChart3 } from 'lucide-react';

const Markets = () => {
    const navigate = useNavigate();
     useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Desktop Header */}
            <div className="hidden sm:block bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                        >
                            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                            <span className="font-medium">Back</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Markets
                            </h1>
                        </div>
                        <div className="w-20"></div> {/* Spacer for alignment */}
                    </div>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="sm:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate("/")}
                            className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
                            aria-label="Go back"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h1 className="text-base font-semibold text-gray-900 dark:text-white">
                            Markets
                        </h1>
                        <div className="w-8"></div> {/* Spacer for alignment */}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto">
                <MarketList />
            </main>

            {/* Mobile Navigation */}
            <MobileNav />

            {/* Bottom padding for mobile nav */}
            <div className="h-16 sm:hidden"></div>
        </div>
    );
};

export default Markets;