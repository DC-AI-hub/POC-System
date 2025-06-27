"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Badge } from './badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Alert, AlertDescription } from './alert'
import { RefreshCw, Clock, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { Currency, CURRENCIES } from '@/lib/types/travel-expense'
import { useExchangeRate } from '@/hooks/use-exchange-rate'

interface ExchangeRateDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ExchangeRateDialog({ 
  trigger, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange 
}: ExchangeRateDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [manualRates, setManualRates] = useState<Record<Currency, string>>({} as Record<Currency, string>)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD')
  
  const exchangeRate = useExchangeRate({ autoFetch: true })
  
  const open = controlledOpen ?? internalOpen
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen

  // 初始化手动汇率输入值
  useEffect(() => {
    const initialRates: Record<Currency, string> = {} as Record<Currency, string>
    CURRENCIES.forEach(currency => {
      initialRates[currency.code] = exchangeRate.rates[currency.code]?.toString() || '0'
    })
    setManualRates(initialRates)
  }, [exchangeRate.rates])

  const handleManualRateChange = (currency: Currency, value: string) => {
    setManualRates(prev => ({
      ...prev,
      [currency]: value
    }))
  }

  const handleSetManualRate = (currency: Currency) => {
    const rate = parseFloat(manualRates[currency])
    if (!isNaN(rate) && rate > 0) {
      if (exchangeRate.validateRate(currency, rate)) {
        exchangeRate.setManualRate(currency, rate, '用户手动设置')
      } else {
        alert('汇率偏差过大，请检查输入值')
      }
    } else {
      alert('请输入有效的汇率值')
    }
  }

  const getRateChange = (currency: Currency) => {
    const history = exchangeRate.history
    if (history.length < 2) return null
    
    const current = history[0].rates[currency]
    const previous = history[1].rates[currency]
    
    if (!current || !previous) return null
    
    const change = ((current - previous) / previous) * 100
    return {
      percentage: change,
      isUp: change > 0,
      isDown: change < 0
    }
  }

  const formatLastUpdated = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return '刚刚更新'
    if (minutes < 60) return `${minutes}分钟前更新`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}小时前更新`
    
    const days = Math.floor(hours / 24)
    return `${days}天前更新`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            汇率管理
          </DialogTitle>
          <DialogDescription>
            查看和管理当前汇率，支持手动调整和历史记录查看
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">当前汇率</TabsTrigger>
            <TabsTrigger value="manual">手动设置</TabsTrigger>
            <TabsTrigger value="history">历史记录</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatLastUpdated(exchangeRate.lastUpdated)}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => exchangeRate.refresh()}
                disabled={exchangeRate.loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${exchangeRate.loading ? 'animate-spin' : ''}`} />
                刷新汇率
              </Button>
            </div>

            {exchangeRate.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{exchangeRate.error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CURRENCIES.filter(c => c.code !== 'CNY').map(currency => {
                const rate = exchangeRate.rates[currency.code]
                const change = getRateChange(currency.code)
                
                return (
                  <Card key={currency.code}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{currency.symbol}</span>
                        <Badge variant="outline">{currency.code}</Badge>
                      </CardTitle>
                      <CardDescription>{currency.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">
                          {rate?.toFixed(4) || '0.0000'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          1 {currency.code} = {rate?.toFixed(4) || '0.0000'} CNY
                        </div>
                        {change && (
                          <div className={`flex items-center gap-1 text-sm ${
                            change.isUp ? 'text-green-600' : change.isDown ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {change.isUp ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : change.isDown ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : null}
                            {change.percentage > 0 ? '+' : ''}{change.percentage.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                手动设置的汇率将覆盖系统汇率，请谨慎操作。系统允许的汇率偏差范围为±50%。
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CURRENCIES.filter(c => c.code !== 'CNY').map(currency => (
                <Card key={currency.code}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      {currency.symbol} {currency.name}
                      <Badge variant="outline">{currency.code}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`rate-${currency.code}`}>汇率 (1 {currency.code} = ? CNY)</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id={`rate-${currency.code}`}
                          type="number"
                          step="0.0001"
                          value={manualRates[currency.code] || ''}
                          onChange={(e) => handleManualRateChange(currency.code, e.target.value)}
                          placeholder="输入汇率"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSetManualRate(currency.code)}
                        >
                          设置
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      当前系统汇率: {exchangeRate.rates[currency.code]?.toFixed(4) || '0.0000'}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {exchangeRate.history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无历史记录
              </div>
            ) : (
              <div className="space-y-4">
                {exchangeRate.history.map((record, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>{record.date.toLocaleString()}</span>
                        <Badge variant="outline">{record.source}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>货币</TableHead>
                            <TableHead>汇率</TableHead>
                            <TableHead>变化</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {CURRENCIES.filter(c => c.code !== 'CNY').map(currency => {
                            const currentRate = record.rates[currency.code]
                            const previousRate = index < exchangeRate.history.length - 1 
                              ? exchangeRate.history[index + 1].rates[currency.code] 
                              : null
                            
                            const change = previousRate 
                              ? ((currentRate - previousRate) / previousRate) * 100 
                              : null

                            return (
                              <TableRow key={currency.code}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {currency.symbol} {currency.name}
                                    <Badge variant="outline" className="text-xs">
                                      {currency.code}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>{currentRate?.toFixed(4) || '-'}</TableCell>
                                <TableCell>
                                  {change !== null ? (
                                    <span className={`flex items-center gap-1 ${
                                      change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                      {change > 0 ? (
                                        <TrendingUp className="h-3 w-3" />
                                      ) : change < 0 ? (
                                        <TrendingDown className="h-3 w-3" />
                                      ) : null}
                                      {change > 0 ? '+' : ''}{change.toFixed(2)}%
                                    </span>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 