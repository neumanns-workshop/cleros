import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Scroll, BookOpen, Lightbulb } from 'lucide-react';

interface SimulationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content?: string;
  highlight?: boolean;
}

interface QuerySimulationProps {
  ancientQuery: {
    text: string;
    greek: string;
    category: string;
    petitioner: string;
  };
  modernResponse: {
    source: string;
    passage: string;
    relevance: number;
    interpretation: string;
  };
}

export const AncientQuerySimulation: React.FC<QuerySimulationProps> = ({
  ancientQuery,
  modernResponse
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps: SimulationStep[] = [
    {
      id: "ancient-voice",
      title: "Ancient Voice",
      description: "A consultation carved in lead at Dodona",
      icon: <Scroll className="w-5 h-5" />,
      content: ancientQuery.text,
      highlight: false
    },
    {
      id: "semantic-search",
      title: "Semantic Understanding", 
      description: "AI interprets the ancient concern",
      icon: <Sparkles className="w-5 h-5" />,
      content: `Query analyzed for themes: ${ancientQuery.category.toLowerCase()}`,
      highlight: true
    },
    {
      id: "corpus-search",
      title: "Corpus Consultation",
      description: "Searching sacred texts for wisdom",
      icon: <BookOpen className="w-5 h-5" />,
      content: `Scanning ${modernResponse.source} for relevant passages...`,
      highlight: true
    },
    {
      id: "wisdom-found",
      title: "Ancient Wisdom",
      description: "Relevant passage discovered",
      icon: <Lightbulb className="w-5 h-5" />,
      content: modernResponse.passage,
      highlight: false
    },
    {
      id: "interpretation",
      title: "Divine Response",
      description: "Contextual interpretation for the petitioner",
      icon: <Sparkles className="w-5 h-5" />,
      content: modernResponse.interpretation,
      highlight: false
    }
  ];

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
        // Reset after completion
        setTimeout(() => {
          setCurrentStep(0);
        }, 2000);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, steps.length]);

  const startSimulation = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="card space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gradient">
          Ancient Query Simulation
        </h3>
        <p className="text-gray-400">
          See how ancient questions find answers in sacred texts
        </p>
      </div>

      {/* Petitioner Context */}
      <div className="bg-deep-blue-900/50 rounded-lg p-4 border border-ancient-gold-500/20">
        <div className="text-sm text-ancient-gold-400 font-medium mb-2">
          {ancientQuery.petitioner}
        </div>
        <div className="font-greek text-gray-300 mb-2">
          {ancientQuery.greek}
        </div>
        <div className="text-gray-200 italic">
          &quot;{ancientQuery.text}&quot;
        </div>
      </div>

      {/* Simulation Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className={`relative flex items-start gap-4 p-4 rounded-lg transition-all duration-500 ${
              index <= currentStep 
                ? 'bg-white/5 border border-white/10' 
                : 'bg-gray-900/20 border border-gray-700/50'
            }`}
            initial={{ opacity: 0.3 }}
            animate={{ 
              opacity: index <= currentStep ? 1 : 0.3,
              scale: index === currentStep ? 1.02 : 1
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Step Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              index <= currentStep
                ? 'bg-ancient-gold-500/20 text-ancient-gold-400'
                : 'bg-gray-700/50 text-gray-500'
            }`}>
              {step.highlight && index === currentStep ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  {step.icon}
                </motion.div>
              ) : (
                step.icon
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${
                  index <= currentStep ? 'text-white' : 'text-gray-500'
                }`}>
                  {step.title}
                </h4>
                {index === currentStep && isPlaying && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-ancient-gold-500 rounded-full"
                  />
                )}
              </div>
              
              <p className={`text-sm ${
                index <= currentStep ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {step.description}
              </p>

              {/* Step Content */}
              <AnimatePresence>
                {step.content && index <= currentStep && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`mt-3 p-3 rounded-md ${
                      step.highlight 
                        ? 'bg-mystical-purple-500/20 border border-mystical-purple-500/30'
                        : 'bg-deep-blue-800/50 border border-deep-blue-700/50'
                    }`}
                  >
                    <div className={`text-sm ${
                      step.highlight ? 'text-mystical-purple-200' : 'text-gray-200'
                    }`}>
                      {step.content}
                    </div>
                    
                    {step.id === 'wisdom-found' && (
                      <div className="mt-2 text-xs text-gray-400">
                        Relevance: {Math.round(modernResponse.relevance * 100)}% semantic match
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Arrow to next step */}
            {index < steps.length - 1 && index <= currentStep && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
              >
                <ArrowRight className="w-4 h-4 text-ancient-gold-500/50" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center pt-4 border-t border-white/10">
        <button
          onClick={startSimulation}
          disabled={isPlaying}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlaying ? 'Simulating...' : 'Start Simulation'}
        </button>
        
        <button
          onClick={resetSimulation}
          className="btn-ghost"
        >
          Reset
        </button>
      </div>

      {/* Progress indicator */}
      {isPlaying && (
        <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-ancient-gold-500 to-mystical-purple-500"
            initial={{ width: "0%" }}
            animate={{ 
              width: `${((currentStep + 1) / steps.length) * 100}%` 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </div>
  );
};

// Example usage with sample data
export const SampleQuerySimulation: React.FC = () => {
  const sampleData = {
    ancientQuery: {
      text: "Concerning the safety of the child and the wife: what should be done?",
      greek: "περὶ σωτηρίας τοῦ παιδίου καὶ τῆς γυναικός· τί δεῖ ποιεῖν;",
      category: "Family Safety",
      petitioner: "Worried father at Dodona, 4th century BCE"
    },
    modernResponse: {
      source: "Orphic Hymns - Hymn to Nature",
      passage: "But, goddess, I entreat you, in prosperous seasons, to bring peace and health, and the increase of all good things...",
      relevance: 0.847,
      interpretation: "The sacred texts counsel seeking divine protection through proper reverence to Nature, who brings health and prosperity to families under her care."
    }
  };

  return <AncientQuerySimulation {...sampleData} />;
};

export default AncientQuerySimulation;
