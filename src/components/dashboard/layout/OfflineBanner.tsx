import { useOnline } from '@/hooks';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineBanner() {
  const isOnline = useOnline();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-error/20 border-b border-error/30 backdrop-blur-md overflow-hidden relative z-50"
        >
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center gap-3 text-error text-sm font-medium">
            <WifiOff className="w-4 h-4" />
            <span>Connection Interrupted. Monitoring offline...</span>
            <AlertTriangle className="w-3.5 h-3.5 animate-pulse ml-2" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
