import { useState, useEffect } from 'react';
import { OracleResponse, CounselResponse } from '../types/oracle';

export const usePersonalReports = () => {
  const [personalOracleReports, setPersonalOracleReports] = useState<OracleResponse[]>([]);
  const [personalCounselReports, setPersonalCounselReports] = useState<CounselResponse[]>([]);

  const loadPersonalReports = () => {
    try {
      // Load oracle reports
      const oracleKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('oracle_response_') && key !== 'oracle_response_latest'
      );
      
      const oracleReports: OracleResponse[] = [];
      oracleKeys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheData = JSON.parse(cached);
            oracleReports.push(cacheData.response);
          }
        } catch (error) {
          console.warn(`Failed to parse cached oracle response ${key}:`, error);
        }
      });
      
      // Load counsel reports
      const counselKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('counsel_response_') && key !== 'counsel_response_latest'
      );
      
      const counselReports: CounselResponse[] = [];
      counselKeys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cacheData = JSON.parse(cached);
            counselReports.push(cacheData.response);
          }
        } catch (error) {
          console.warn(`Failed to parse cached counsel response ${key}:`, error);
        }
      });
      
      // Sort by timestamp (newest first)
      oracleReports.sort((a, b) => b.timestamp - a.timestamp);
      counselReports.sort((a, b) => b.timestamp - a.timestamp);
      
      setPersonalOracleReports(oracleReports);
      setPersonalCounselReports(counselReports);
      
      console.log(`📋 Loaded ${oracleReports.length} oracle reports and ${counselReports.length} counsel reports`);
    } catch (error) {
      console.error('Failed to load personal reports:', error);
    }
  };

  useEffect(() => {
    loadPersonalReports();
  }, []);

  return { 
    personalOracleReports, 
    personalCounselReports, 
    reloadPersonalReports: loadPersonalReports 
  };
};