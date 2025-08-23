import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Scroll } from 'lucide-react';

interface OracleQuery {
  id: string;
  category: string;
  intent: string[];
  formula_type: string;
  text: {
    english: string;
    greek: string;
  };
  context: {
    period: string;
    location: string;
    notes: string;
  };
}

// Sample oracle queries from our corpus
const oracleQueries: OracleQuery[] = [
  {
    id: "DVC 219B",
    category: "Household & Safety",
    intent: ["FAMILY", "SAFETY", "HOUSEHOLD"],
    formula_type: "which-god",
    text: {
      english: "To which of the gods should I pray concerning my household and safety?",
      greek: "τίνι θεῶν εὔχομαι περὶ οἰκίας καὶ σωτηρίας;"
    },
    context: {
      period: "5th-2nd century BCE",
      location: "Dodona, Epirus",
      notes: "A family seeking divine protection for their home"
    }
  },
  {
    id: "DVC 1093A",
    category: "Safety of Family",
    intent: ["FAMILY", "SAFETY", "HEALTH"],
    formula_type: "concerning-safety",
    text: {
      english: "Concerning the safety of the child and the wife: what should be done?",
      greek: "περὶ σωτηρίας τοῦ παιδίου καὶ τῆς γυναικός· τί δεῖ ποιεῖν;"
    },
    context: {
      period: "5th-2nd century BCE", 
      location: "Dodona, Epirus",
      notes: "A father or husband concerned for family wellbeing"
    }
  },
  {
    id: "DVC 632",
    category: "Success / Which god",
    intent: ["SUCCESS", "WHICH-GOD"],
    formula_type: "which-god + success",
    text: {
      english: "To which of the gods am I to sacrifice and pray, in order that I may prosper?",
      greek: "τίνι θεῶν θύω καὶ εὔχομαι, ἵνα εὖ πράσσω;"
    },
    context: {
      period: "5th-2nd century BCE",
      location: "Dodona, Epirus", 
      notes: "Seeking prosperity through proper divine worship"
    }
  },
  {
    id: "DVC 1124B",
    category: "Legal Dispute",
    intent: ["LEGAL"],
    formula_type: "concerning-X",
    text: {
      english: "Concerning the lawsuit: what should be done?",
      greek: "περὶ τῆς δίκης· τί δεῖ ποιεῖν;"
    },
    context: {
      period: "5th-2nd century BCE",
      location: "Dodona, Epirus",
      notes: "Legal guidance sought from Zeus"
    }
  },
  {
    id: "DVC 2525A",
    category: "Health",
    intent: ["HEALTH", "HOW-TO"],
    formula_type: "what-should-I-do",
    text: {
      english: "Concerning my body: what should I do to be in good health?",
      greek: "περὶ τοῦ σώματος· τί ποιῶν ὑγιαίνοιμι;"
    },
    context: {
      period: "5th-2nd century BCE",
      location: "Dodona, Epirus",
      notes: "Ancient medical consultation with the divine"
    }
  },
  {
    id: "DVC 1313B",
    category: "Business",
    intent: ["BUSINESS", "SUCCESS"],
    formula_type: "if-better-or-advantageous",
    text: {
      english: "Concerning a business undertaking: what is more advantageous and better?",
      greek: "περὶ πραγματείας· τί λώϊον καὶ ἄμεινον;"
    },
    context: {
      period: "5th-2nd century BCE",
      location: "Dodona, Epirus",
      notes: "A merchant seeking divine guidance on a business venture"
    }
  },
  {
    id: "DVC 1395A",
    category: "Manumission",
    intent: ["SLAVERY", "LEGAL"],
    formula_type: "if-better-or-advantageous",
    text: {
      english: "Concerning the manumission of a slave: what is better and more advantageous?",
      greek: "περὶ ἀφέσεως δούλου· τί λώϊον καὶ ἄμεινον;"
    },
    context: {
      period: "5th-2nd century BCE",
      location: "Dodona, Epirus",
      notes: "A master contemplating freeing a slave through temple dedication"
    }
  },
  {
    id: "DVC 2521A",
    category: "Legal Victory",
    intent: ["LEGAL", "OUTCOME"],
    formula_type: "if-will-win",
    text: {
      english: "Shall I win the lawsuit?",
      greek: "αἶ νικήσω τὴν δίκην;"
    },
    context: {
      period: "5th-2nd century BCE",
      location: "Dodona, Epirus",
      notes: "A litigant seeking divine assurance before court proceedings"
    }
  },
  {
    id: "DVC 1268A",
    category: "Fertility",
    intent: ["PROCREATION", "FAMILY"],
    formula_type: "which-god",
    text: {
      english: "Concerning progeny: To which of the gods should I pray or offer sacrifice, so that children may be born?",
      greek: "περὶ γενεᾶς· τίνι θεῶν εὔχομαι ἢ θύω ἵνα τέκνα γένηται;"
    },
    context: {
      period: "5th-2nd century BCE",
      location: "Dodona, Epirus",
      notes: "A couple seeking divine help to conceive children"
    }
  },
  {
    id: "DVC 1148A",
    category: "Travel Safety",
    intent: ["TRAVEL", "SAFETY"],
    formula_type: "travel-safety",
    text: {
      english: "Concerning a journey: is it safe? What is preferable?",
      greek: "περὶ πορείας· ἆρ' ἀσφαλές; τί λώϊον;"
    },
    context: {
      period: "5th-2nd century BCE",
      location: "Dodona, Epirus",
      notes: "A traveler seeking divine guidance about a dangerous journey"
    }
  },
  {
    id: "P.Oxy. 9 1213",
    category: "Marriage",
    intent: ["MARRIAGE", "RELATIONSHIP", "PERMISSION"],
    formula_type: "if-granted",
    text: {
      english: "Menandros asks whether it has been granted to me to marry. Grant me this.",
      greek: "ἀξιοῖ Μένανδρος [εἰ] δέδοταί μοι γαμῆσαι. [τοῦ]το μοι δός."
    },
    context: {
      period: "2nd century CE",
      location: "Oxyrhynchus, Egypt",
      notes: "A young man seeking divine permission for marriage"
    }
  },
  {
    id: "P.Oxy. 42 3078",
    category: "Medical Consultation",
    intent: ["HEALTH", "MEDICAL", "PERMISSION"],
    formula_type: "permission-request",
    text: {
      english: "If you permit me to consult Hermeinos the physician for treatment of the eyes, and this is to my advantage, grant me this.",
      greek: "εἰ ἐπιτρέπεις μοι χρήσασθαι Ἑρμείνωι Ἑρμοπολίτηι ἰατρῶι πρὸς θεραπείαν τῶν ὀφθαλμῶν, καὶ τοῦτό μοι συμφέρει, τοῦτό μοι δός."
    },
    context: {
      period: "2nd century CE",
      location: "Oxyrhynchus, Egypt",
      notes: "Seeking divine approval before consulting a human doctor"
    }
  },
  {
    id: "SB 26 16731",
    category: "Administrative Anxiety",
    intent: ["ADMINISTRATIVE", "ANXIETY", "CAREER"],
    formula_type: "whether-question",
    text: {
      english: "Sotas petitions: if the nomarch is not going to be angry with me because I write Valerius' pittakia, grant me this.",
      greek: "ἀξιοῖ Σώτας, εἰ οὐ μέλλει ὁ νομάρχης ἐμαυτοῦ ἀγανακτεῖν ὅτι τὰ πιττάκια Οὐαλερίου ἐγὼ γράφω, τοῦτό μοι δός."
    },
    context: {
      period: "Roman period",
      location: "Soknopaiou Nesos, Fayum",
      notes: "A scribe worried about his supervisor's reaction to his work"
    }
  },
  {
    id: "P.Oxy. 8 1149",
    category: "Business Decision",
    intent: ["BUSINESS", "ECONOMIC", "ADVANTAGE"],
    formula_type: "if-better-or-advantageous",
    text: {
      english: "Nike asks whether it is to her advantage to purchase Sarapion, a boy, from Tasarapion.",
      greek: "ἀξιοῖ Νίκη, εἰ συμφέρει αὐτῇ πρίασθαι Σαραπίωνα παῖδα παρὰ Τασαραπίωνος."
    },
    context: {
      period: "2nd century CE",
      location: "Oxyrhynchus, Egypt",
      notes: "A woman seeking divine guidance on a major purchase"
    }
  },
  {
    id: "P.Oxy. 74 5017",
    category: "Health Recovery",
    intent: ["HEALTH", "HEALING", "DIVINE_GUIDANCE"],
    formula_type: "if-will-happen",
    text: {
      english: "Euphoros asks Zeus Helios Sarapis: if I will recover, grant me this.",
      greek: "Διὶ Ἡλίῳ μεγάλῳ Σαράπιδι καὶ τοῖς συννάοις θεοῖς. ἀξιοῖ Εὔφορος, εἰ ἀνακτήσωμαι, τοῦτό μοι δός."
    },
    context: {
      period: "1st-2nd century CE",
      location: "Oxyrhynchus, Egypt",
      notes: "A man seeking divine assurance about his recovery from illness"
    }
  },
  {
    id: "P.Mich. 6 423",
    category: "Travel & Health",
    intent: ["HEALTH", "TRAVEL", "DIVINE_GUIDANCE"],
    formula_type: "general-petition",
    text: {
      english: "Dionysios petitions Sarapis and Isis about his illness: whether it is expedient for him to go home.",
      greek: "Σαράπιδι καὶ Ἴσιδι καὶ πᾶσι θεοῖς. ἀξιοῖ Διονύσιος τὸν θεὸν περὶ τῆς ἀσθενείας αὐτοῦ, εἰ συμφέρει αὐτῷ ἀπελθεῖν ἐπὶ τὰ ἴδια."
    },
    context: {
      period: "2nd century CE",
      location: "Karanis, Egypt",
      notes: "A sick man wondering whether to return home for treatment"
    }
  },
  {
    id: "BGU 1 154",
    category: "Marriage Arrangement",
    intent: ["MARRIAGE", "RELATIONSHIP"],
    formula_type: "concerning-X",
    text: {
      english: "Concerning marriage: whether it is expedient for Dionysios to marry Herais, daughter of Herakleides.",
      greek: "Διὶ Ἡλίῳ μεγάλῳ Σαράπιδι καὶ τοῖς συννάοις θεοῖς. περὶ γάμου. εἰ συμφέρει Διονυσίῳ γῆμαι Ἡραΐδα τὴν Ἡρακλείδου."
    },
    context: {
      period: "2nd century CE",
      location: "Soknopaiou Nesos, Fayum",
      notes: "A family seeking divine approval for a specific marriage match"
    }
  },
  {
    id: "P.Oslo 3 143",
    category: "Legal Strategy",
    intent: ["LEGAL", "JUSTICE", "ADVANTAGE"],
    formula_type: "if-better-or-advantageous",
    text: {
      english: "Apollonios asks whether it is to his advantage to counter-sue Herakleides about inheritance claims.",
      greek: "Διὶ Ἡλίῳ μεγάλῳ Σαράπιδι. ἀξιοῖ Ἀπολλώνιος, εἰ συμφέρει αὐτῷ ἀντικαλεῖν Ἡρακλεῖδα περὶ τῶν ἐπικλήρων, τοῦτό μοι δός."
    },
    context: {
      period: "2nd-3rd century CE",
      location: "Egypt",
      notes: "A man seeking divine guidance on legal strategy in an inheritance dispute"
    }
  },
  {
    id: "SB 12 10929",
    category: "Business Travel",
    intent: ["TRAVEL", "SAFETY", "ADVANTAGE"],
    formula_type: "if-better-or-advantageous",
    text: {
      english: "Herakleides asks whether it is advantageous for him to go up to Alexandria for his business.",
      greek: "Διὶ Ἡλίῳ μεγάλῳ Σαράπιδι καὶ τοῖς συννάοις θεοῖς. ἀξιοῖ Ἡρακλείδης, εἰ συμφέρει αὐτῷ ἀναβῆναι εἰς Ἀλεξάνδρειαν πρὸς τὰ ἴδια πράγματα, τοῦτό μοι δός."
    },
    context: {
      period: "2nd century CE",
      location: "Fayum region, Egypt",
      notes: "A businessman seeking divine approval before traveling to the big city"
    }
  }
];

interface VoicesFromThePastProps {
  className?: string;
  autoRotate?: boolean;
  rotateInterval?: number;
}

export const VoicesFromThePast: React.FC<VoicesFromThePastProps> = ({
  className = "",
  autoRotate = true,
  rotateInterval = 8000
}) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const randomIndex = Math.floor(Math.random() * oracleQueries.length);
    console.log(`Carousel: Starting with query ${randomIndex} (${oracleQueries[randomIndex]?.id}) of ${oracleQueries.length} total queries`);
    return randomIndex;
  });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!autoRotate || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * oracleQueries.length);
        } while (nextIndex === prev && oracleQueries.length > 1);
        
        console.log(`Carousel: Switching from ${prev} (${oracleQueries[prev]?.id}) to ${nextIndex} (${oracleQueries[nextIndex]?.id})`);
        return nextIndex;
      });
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, isHovered]);

  const currentQuery = oracleQueries[currentIndex];

  const categoryColors = {
    "Household & Safety": "from-blue-500 to-cyan-500",
    "Safety of Family": "from-green-500 to-emerald-500", 
    "Success / Which god": "from-amber-500 to-yellow-500",
    "Legal Dispute": "from-red-500 to-rose-500",
    "Health": "from-purple-500 to-violet-500",
    "Marriage": "from-pink-500 to-rose-500",
    "Medical Consultation": "from-indigo-500 to-purple-500",
    "Administrative Anxiety": "from-orange-500 to-red-500",
    "Business Decision": "from-teal-500 to-cyan-500",
    "Business": "from-emerald-500 to-teal-500",
    "Manumission": "from-slate-500 to-gray-500",
    "Legal Victory": "from-rose-500 to-pink-500",
    "Fertility": "from-green-400 to-emerald-400",
    "Travel Safety": "from-sky-500 to-blue-500",
    "Health Recovery": "from-violet-500 to-purple-500",
    "Travel & Health": "from-indigo-400 to-blue-400",
    "Marriage Arrangement": "from-rose-400 to-pink-400",
    "Legal Strategy": "from-red-400 to-orange-400",
    "Business Travel": "from-cyan-500 to-teal-500",
    "default": "from-gray-500 to-slate-500"
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || categoryColors.default;
  };

  return (
    <div 
      className={`card relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-mystical-purple-500/20 rounded-lg">
          <Scroll className="w-5 h-5 text-mystical-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Voices from the Past</h3>
          <p className="text-sm text-gray-400">Ancient consultations at Dodona</p>
        </div>
      </div>

      {/* Query Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {/* Query ID and Category */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500">{currentQuery.id}</span>
            <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(currentQuery.category)} text-white`}>
              {currentQuery.category}
            </div>
          </div>

          {/* English Query */}
          <blockquote className="text-lg font-serif italic text-gray-200 leading-relaxed">
            &quot;{currentQuery.text.english}&quot;
          </blockquote>

          {/* Greek Text */}
          <div className="font-greek text-base text-gray-400 border-l-2 border-ancient-gold-500/30 pl-4">
            {currentQuery.text.greek}
          </div>

          {/* Context Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{currentQuery.context.period}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{currentQuery.context.location}</span>
            </div>
          </div>

          {/* Notes */}
          <p className="text-sm text-gray-500 italic">
            {currentQuery.context.notes}
          </p>

          {/* Intent Tags */}
          <div className="flex flex-wrap gap-2">
            {currentQuery.intent.map((intent, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-md font-medium"
              >
                {intent}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="absolute bottom-4 left-6 right-6">
        <div className="flex gap-2">
          {oracleQueries.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentIndex 
                  ? 'bg-ancient-gold-500 flex-1' 
                  : 'bg-white/20 w-6'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Auto-rotation indicator */}
      {autoRotate && !isHovered && (
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: rotateInterval / 1000, repeat: Infinity, ease: "linear" }}
            className="w-3 h-3 border-2 border-ancient-gold-500/30 border-t-ancient-gold-500 rounded-full"
          />
        </div>
      )}
    </div>
  );
};

export default VoicesFromThePast;
