import { fetchLocalData } from './api';

export interface EntityClassification {
  entity: string;
  category: string;
  start_char: number;
  end_char: number;
  hymn_id: string;
  line_num: string;
}

// Map of alternate names/epithets to primary deity names
export const deityAliases: Record<string, string> = {
  // Olympians
  'Pallas': 'Athene',
  'Tritogeneia': 'Athene',
  'Apollon': 'Apollo',
  'Pythian': 'Apollo',
  'Grynean': 'Apollo',
  'Sminthian': 'Apollo',
  'Delphic': 'Apollo',
  'Didymeus': 'Apollo',
  'Loxias': 'Apollo',
  'Lykoreus': 'Apollo',
  'Paian': 'Apollo',
  'Kronion': 'Zeus',
  'Kronian Zeus': 'Zeus',
  'Kronios': 'Zeus',
  'Nereids': 'Nereus',
  'Naiads': 'Nereus',
  'Proteus': 'Nereus',
  'Tethys': 'Okeanos',
  'Oceanids': 'Okeanos',
  'Oceanus': 'Okeanos',
  'Sea': 'Okeanos',
  // Wind deities
  'Zephyros': 'Wind',
  'Zephyrus': 'Wind',
  'Boreas': 'Wind',
  'Notus': 'Wind',
  'Eurus': 'Wind',
  'Anemoi': 'Wind',
  
  // Chthonic
  'Hades': 'Plouton',
  'Chthonic Zeus': 'Plouton',
  'Euboulos': 'Plouton',
  'Eubouleus': 'Plouton',
  'Kore': 'Persephone',
  
  // Bacchic
  'Bacchos': 'Dionysos',
  'Bacchus': 'Dionysos',
  'Bromios': 'Dionysos',
  'Bassareus': 'Dionysos',
  'Bassaros': 'Dionysos',
  'Iacchos': 'Dionysos',
  'Liknites': 'Dionysos',
  'Lyaios': 'Dionysos',
  'Lysios': 'Dionysos',
  'Lenaios': 'Dionysos',
  'God of Annual Feasts': 'Dionysos',
  'Perikionios': 'Dionysos',
  'Silenos': 'Dionysos',
  'Satyros': 'Dionysos',
  'Bacchae': 'Dionysos',
  'Bacchantes': 'Dionysos',
  
  // Nature deities
  'Muses': 'Mnemosyne',
  'Seasons': 'Themis',
  'Hours': 'Themis',
  'Fates': 'Themis',
  'Moirai': 'Themis',
  'Furies': 'Night',
  'Erinyes': 'Night',
  'Eumenides': 'Night',
  'Nymphs': 'Pan',
  'Dryads': 'Pan',
  
  // Abstract concepts
  'Nemesis': 'Abstract',
  'Sleep': 'Abstract',
  'Hypnos': 'Abstract'
};

// Special category map for aliases that don't map to existing deities
export const specialCategoryMap: Record<string, string> = {
  'Wind': 'Nature',
  'Abstract': 'Abstract'
};

/**
 * Loads deity classifications from the server
 */
export async function loadDeityClassifications(): Promise<EntityClassification[]> {
  try {
    const response = await fetchLocalData<EntityClassification[]>('/data/enriched/deities/deity_classifications.json');
    if (!response.success) {
      throw new Error(response.error || 'Failed to load deity classifications');
    }
    
    // Add aliases as additional classifications
    const classifications = response.data;
    const classificationsWithAliases = addDeityAliases(classifications);
    
    return classificationsWithAliases;
  } catch (error) {
    console.error('Error loading deity classifications:', error);
    throw new Error('Failed to load deity classifications');
  }
}

/**
 * Gets entity classifications for a specific hymn line
 */
export function getEntitiesForLine(
  classifications: EntityClassification[],
  hymnId: string,
  lineNum: number
): EntityClassification[] {
  return classifications.filter(
    (entity) => entity.hymn_id === hymnId && parseInt(entity.line_num) === lineNum
  );
}

/**
 * Gets the CSS color class for a specific deity category
 */
export function getCategoryColorClass(category: string): string {
  switch (category) {
    case 'Olympian':
      return 'deity-olympian';
    case 'Chthonic':
      return 'deity-chthonic';
    case 'Titan':
      return 'deity-titan';
    case 'Nature':
      return 'deity-nature';
    case 'Abstract':
      return 'deity-abstract';
    case 'Hero/Mortal':
      return 'deity-hero';
    default:
      return 'deity-other';
  }
}

// Function to add all deity aliases to the classifications
export const addDeityAliases = (classifications: EntityClassification[]): EntityClassification[] => {
  const classificationsWithAliases = [...classifications];

  // Process the normal deity aliases (those that map to existing deities)
  classifications.forEach((classification: EntityClassification) => {
    Object.entries(deityAliases).forEach(([alias, primaryName]) => {
      if (classification.entity === primaryName) {
        // Clone the classification for the alias
        const aliasClassification = {
          ...classification,
          entity: alias
        };
        classificationsWithAliases.push(aliasClassification);
      }
    });
  });

  // Add special category entities that don't map to existing deities
  Object.entries(specialCategoryMap).forEach(([specialEntity, category]) => {
    // Find entities in deityAliases that map to this special entity
    Object.entries(deityAliases).forEach(([alias, target]) => {
      if (target === specialEntity) {
        // Create a generic classification for this alias
        const newClassification: EntityClassification = {
          entity: alias,
          category: category,
          // Use dummy values for the other fields since we just need the entity and category
          hymn_id: "0",
          line_num: "0",
          start_char: 0,
          end_char: 0
        };
        classificationsWithAliases.push(newClassification);
      }
    });
  });

  return classificationsWithAliases;
}; 