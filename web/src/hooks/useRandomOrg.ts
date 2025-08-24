import { useState, useEffect } from 'react';
import { oracleService } from '../services/oracleService';

export const useRandomOrg = () => {
  const [isRandomOrgAvailable, setIsRandomOrgAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkRandomOrg = async () => {
      try {
        const available = await oracleService.checkRandomOrgAvailability();
        setIsRandomOrgAvailable(available);
        console.log(`🎲 Random.org ${available ? 'available' : 'unavailable'} - Oracle mode ${available ? 'enabled' : 'DISABLED'}`);
      } catch (error) {
        console.error('Failed to check random.org availability:', error);
        setIsRandomOrgAvailable(false);
      }
    };

    checkRandomOrg();
  }, []);

  return { isRandomOrgAvailable };
};