import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BottomNav } from './components/layout/BottomNav';
import { Dashboard } from './pages/Dashboard';
import { GridTrading } from './pages/GridTrading';
import { GridEngine } from './pages/GridEngine';
import { AIPlan } from './pages/AIPlan';
import { RiskCenter } from './pages/RiskCenter';
import { Settings } from './pages/Settings';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeOut' as const,
  duration: 0.3,
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-lg mx-auto"
            >
              <Dashboard />
            </motion.div>
          }
        />
        <Route
          path="/grid"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-lg mx-auto"
            >
              <GridTrading />
            </motion.div>
          }
        />
        <Route
          path="/grid-engine"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-lg mx-auto"
            >
              <GridEngine />
            </motion.div>
          }
        />
        <Route
          path="/ai-plan"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-lg mx-auto"
            >
              <AIPlan />
            </motion.div>
          }
        />
        <Route
          path="/risk"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-lg mx-auto"
            >
              <RiskCenter />
            </motion.div>
          }
        />
        <Route
          path="/settings"
          element={
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-lg mx-auto"
            >
              <Settings />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-finance-bg">
        <AnimatedRoutes />
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
