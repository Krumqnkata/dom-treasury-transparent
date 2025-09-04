import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Currency = 'BGN' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  convertAmount: (amount: number, fromBGN?: boolean) => number;
  formatAmount: (amount: number) => string;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('currency') as Currency) || 'EUR';
  });
  const [exchangeRate, setExchangeRate] = useState<number>(1.95583); // Default BGN/EUR rate
  const [loading, setLoading] = useState(false);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const fetchExchangeRate = async () => {
    if (currency === 'BGN') {
      setExchangeRate(1);
      return;
    }

    try {
      setLoading(true);
      // Using Bulgarian National Bank API for official rates
      const response = await fetch('https://www.bnb.bg/Statistics/StExternalSector/StExchangeRates/StERForeignCurrencies/index.htm?download=xml&search=&lang=BG');
      
      if (!response.ok) {
        // Fallback to ECB rates if BNB is unavailable
        const ecbResponse = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        const ecbData = await ecbResponse.json();
        setExchangeRate(ecbData.rates.BGN || 1.95583);
        return;
      }

      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const eurRate = xmlDoc.querySelector('ROW[GOLD="EUR"] RATE');
      
      if (eurRate) {
        const rate = parseFloat(eurRate.textContent || '1.95583');
        setExchangeRate(rate);
      } else {
        setExchangeRate(1.95583); // Default fixed rate
      }
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      setExchangeRate(1.95583); // Default fixed rate
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, [currency]);

  const convertAmount = (amount: number, fromBGN = true): number => {
    if (currency === 'BGN') return amount;
    
    if (fromBGN) {
      // Convert from BGN to EUR
      return amount / exchangeRate;
    } else {
      // Convert from EUR to BGN
      return amount * exchangeRate;
    }
  };

  const formatAmount = (amount: number): string => {
    const convertedAmount = convertAmount(amount);
    const symbol = currency === 'BGN' ? 'лв.' : '€';
    return `${convertedAmount.toFixed(2)} ${symbol}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      exchangeRate,
      convertAmount,
      formatAmount,
      loading
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}