import { useState, useEffect, useCallback } from 'react'
import { Currency, ExchangeRate, DEFAULT_EXCHANGE_RATES } from '@/lib/types/travel-expense'

interface UseExchangeRateOptions {
  baseCurrency?: Currency
  autoFetch?: boolean
  refreshInterval?: number
}

interface ExchangeRateHistory {
  date: Date
  rates: Record<Currency, number>
  source: string
}

export function useExchangeRate({
  baseCurrency = 'CNY',
  autoFetch = true,
  refreshInterval = 60000 // 1分钟
}: UseExchangeRateOptions = {}) {
  const [rates, setRates] = useState<Record<Currency, number>>(DEFAULT_EXCHANGE_RATES)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [history, setHistory] = useState<ExchangeRateHistory[]>([])
  const [error, setError] = useState<string | null>(null)

  // 模拟API获取汇率
  const fetchExchangeRates = useCallback(async (targetCurrency?: Currency) => {
    setLoading(true)
    setError(null)
    
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模拟汇率波动（±2%）
      const simulatedRates = { ...DEFAULT_EXCHANGE_RATES }
      Object.entries(DEFAULT_EXCHANGE_RATES).forEach(([currency, baseRate]) => {
        const fluctuation = (Math.random() - 0.5) * 0.04 // ±2%
        simulatedRates[currency as Currency] = parseFloat((baseRate * (1 + fluctuation)).toFixed(4))
      })
      
      // 如果指定了目标货币，只更新该货币
      if (targetCurrency) {
        setRates(prev => ({
          ...prev,
          [targetCurrency]: simulatedRates[targetCurrency]
        }))
      } else {
        setRates(simulatedRates)
      }
      
      const now = new Date()
      setLastUpdated(now)
      
      // 添加到历史记录
      setHistory(prev => [
        {
          date: now,
          rates: simulatedRates,
          source: 'API'
        },
        ...prev.slice(0, 9) // 保留最近10条记录
      ])
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取汇率失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 手动设置汇率
  const setManualRate = useCallback((currency: Currency, rate: number, updatedBy?: string) => {
    setRates(prev => ({
      ...prev,
      [currency]: rate
    }))
    
    const now = new Date()
    setLastUpdated(now)
    
    // 添加到历史记录
    setHistory(prev => [
      {
        date: now,
        rates: { ...rates, [currency]: rate },
        source: `手动设置${updatedBy ? ` (${updatedBy})` : ''}`
      },
      ...prev.slice(0, 9)
    ])
  }, [rates])

  // 计算换算金额
  const convertAmount = useCallback((
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency = baseCurrency
  ): number => {
    if (fromCurrency === toCurrency) return amount
    
    const fromRate = rates[fromCurrency]
    const toRate = rates[toCurrency]
    
    if (!fromRate || !toRate) return 0
    
    // 转换逻辑：先转换为基准货币，再转换为目标货币
    if (fromCurrency === 'CNY') {
      return amount / toRate
    } else if (toCurrency === 'CNY') {
      return amount * fromRate
    } else {
      // 通过人民币中转
      const cnyAmount = amount * fromRate
      return cnyAmount / toRate
    }
  }, [rates, baseCurrency])

  // 获取汇率
  const getRate = useCallback((currency: Currency): number => {
    return rates[currency] || 1
  }, [rates])

  // 格式化金额显示
  const formatAmount = useCallback((
    amount: number,
    currency: Currency,
    showSymbol: boolean = true
  ): string => {
    const currencyInfo = {
      CNY: { symbol: '¥', decimals: 2 },
      HKD: { symbol: 'HK$', decimals: 2 },
      USD: { symbol: '$', decimals: 2 },
      EUR: { symbol: '€', decimals: 2 },
      JPY: { symbol: '¥', decimals: 0 },
      GBP: { symbol: '£', decimals: 2 },
      SGD: { symbol: 'S$', decimals: 2 },
      AUD: { symbol: 'A$', decimals: 2 },
    }
    
    const info = currencyInfo[currency]
    const formatted = amount.toFixed(info.decimals)
    
    return showSymbol ? `${info.symbol}${formatted}` : formatted
  }, [])

  // 验证汇率合理性
  const validateRate = useCallback((currency: Currency, rate: number): boolean => {
    const baseRate = DEFAULT_EXCHANGE_RATES[currency]
    const deviation = Math.abs(rate - baseRate) / baseRate
    
    // 允许50%的偏差
    return deviation <= 0.5
  }, [])

  // 自动刷新
  useEffect(() => {
    if (autoFetch && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchExchangeRates()
      }, refreshInterval)
      
      return () => clearInterval(interval)
    }
  }, [autoFetch, refreshInterval, fetchExchangeRates])

  // 初始化获取汇率
  useEffect(() => {
    if (autoFetch) {
      fetchExchangeRates()
    }
  }, [autoFetch, fetchExchangeRates])

  return {
    rates,
    loading,
    error,
    lastUpdated,
    history,
    fetchExchangeRates,
    setManualRate,
    convertAmount,
    getRate,
    formatAmount,
    validateRate,
    refresh: () => fetchExchangeRates(),
  }
} 