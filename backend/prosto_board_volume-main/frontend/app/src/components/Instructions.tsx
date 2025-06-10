import React, { useState } from 'react';
import { Camera, Ruler as Ruler2, Upload, Lightbulb, AlertCircle, CheckSquare, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Instructions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      layout
      className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-6"
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-800 focus:outline-none group"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className="flex items-center">
          <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
          <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            How to Get the Best Results
          </span>
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-600 transform transition-colors group-hover:text-indigo-600" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-8 mt-4">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-5 rounded-lg shadow-sm border border-indigo-200">
                    <h4 className="font-medium text-indigo-900 mb-3 flex items-center">
                      <CheckSquare className="h-5 w-5 mr-2 text-indigo-600" />
                      Photography Tips
                    </h4>
                    <ul className="space-y-3">
                      {[
                        { icon: <Camera className="h-4 w-4" />, text: "Ensure good lighting conditions" },
                        { icon: <Camera className="h-4 w-4" />, text: "Avoid shadows on the boards" },
                        { icon: <Camera className="h-4 w-4" />, text: "Keep camera parallel to boards" },
                        { icon: <Camera className="h-4 w-4" />, text: "Include all board edges in frame" }
                      ].map((item, index) => (
                        <li key={index} className="flex items-center text-indigo-700">
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-indigo-200 rounded-full mr-2">
                            {item.icon}
                          </span>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-5 rounded-lg shadow-sm border border-amber-200">
                    <h4 className="font-medium text-amber-900 mb-3 flex items-center">
                      <Ruler2 className="h-5 w-5 mr-2 text-amber-600" />
                      Measurement Tips
                    </h4>
                    <ul className="space-y-3">
                      {[
                        { icon: <Ruler2 className="h-4 w-4" />, text: "Measure board height accurately" },
                        { icon: <Ruler2 className="h-4 w-4" />, text: "Provide precise board length" },
                        { icon: <Ruler2 className="h-4 w-4" />, text: "Use millimeters for all measurements" },
                        { icon: <Ruler2 className="h-4 w-4" />, text: "Double-check your measurements" }
                      ].map((item, index) => (
                        <li key={index} className="flex items-center text-amber-700">
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-amber-200 rounded-full mr-2">
                            {item.icon}
                          </span>
                          <span>{item.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                <p className="text-blue-800 text-sm leading-relaxed">
                  For accurate results, ensure your measurements are precise and the image clearly shows all board edges. 
                  The system works best with well-lit, front-facing photographs of wooden boards with minimal background clutter.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
