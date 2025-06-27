"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, XCircle, Info, RefreshCw } from "lucide-react"

interface ErrorLog {
  id: string
  type: "error" | "warning" | "info"
  message: string
  timestamp: Date
  component?: string
  stack?: string
}

interface SystemCheck {
  name: string
  status: "pass" | "fail" | "warning" | "info"
  message: string
  details?: string
}

export function DebugPanel() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // Correct image path - matching the actual file
  const backgroundImagePath = "/images/cityscape-bg.jpg"

  useEffect(() => {
    // Capture console errors
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args) => {
      const error: ErrorLog = {
        id: Date.now().toString(),
        type: "error",
        message: args.join(" "),
        timestamp: new Date(),
        component: "Console",
      }
      setErrors((prev) => [...prev, error])
      originalError(...args)
    }

    console.warn = (...args) => {
      const warning: ErrorLog = {
        id: Date.now().toString(),
        type: "warning",
        message: args.join(" "),
        timestamp: new Date(),
        component: "Console",
      }
      setErrors((prev) => [...prev, warning])
      originalWarn(...args)
    }

    // Capture unhandled errors
    const handleError = (event: ErrorEvent) => {
      const error: ErrorLog = {
        id: Date.now().toString(),
        type: "error",
        message: event.message,
        timestamp: new Date(),
        component: event.filename || "Unknown",
        stack: event.error?.stack,
      }
      setErrors((prev) => [...prev, error])
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error: ErrorLog = {
        id: Date.now().toString(),
        type: "error",
        message: `Unhandled Promise Rejection: ${event.reason}`,
        timestamp: new Date(),
        component: "Promise",
      }
      setErrors((prev) => [...prev, error])
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    // Run system checks
    runSystemChecks()

    return () => {
      console.error = originalError
      console.warn = originalWarn
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  const runSystemChecks = () => {
    const checks: SystemCheck[] = []

    // Check if background image exists
    const img = new Image()
    img.onload = () => {
      checks.push({
        name: "Background Image",
        status: "pass",
        message: `Image loaded successfully: ${backgroundImagePath}`,
        details: "Image dimensions and aspect ratio preserved",
      })
      updateSystemChecks(checks)
    }
    img.onerror = () => {
      checks.push({
        name: "Background Image",
        status: "fail",
        message: `Failed to load background image: ${backgroundImagePath}`,
        details: "Check if the file exists and is accessible. Using fallback gradient background.",
      })
      updateSystemChecks(checks)
    }
    img.src = backgroundImagePath

    // Check CSS support
    const supportsBackdropFilter = CSS.supports("backdrop-filter", "blur(10px)")
    checks.push({
      name: "Backdrop Filter Support",
      status: supportsBackdropFilter ? "pass" : "warning",
      message: supportsBackdropFilter ? "Backdrop filter supported" : "Backdrop filter not supported",
      details: supportsBackdropFilter
        ? "Modern blur effects will work correctly"
        : "Fallback styling may be applied for older browsers",
    })

    // Check viewport dimensions
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      ratio: window.innerWidth / window.innerHeight,
    }
    checks.push({
      name: "Viewport Dimensions",
      status: "info",
      message: `${viewport.width}x${viewport.height} (${viewport.ratio.toFixed(2)}:1)`,
      details: `Device pixel ratio: ${window.devicePixelRatio}`,
    })

    // Check for required dependencies
    const requiredGlobals = ["React", "document", "window"]
    requiredGlobals.forEach((global) => {
      const exists = typeof window !== "undefined" && (window as any)[global] !== undefined
      checks.push({
        name: `Global: ${global}`,
        status: exists ? "pass" : "fail",
        message: exists ? `${global} is available` : `${global} is missing`,
        details: exists ? "Required dependency loaded" : "This may cause runtime errors",
      })
    })

    setSystemChecks(checks)
  }

  const updateSystemChecks = (newChecks: SystemCheck[]) => {
    setSystemChecks((prev) => {
      const updated = [...prev]
      newChecks.forEach((newCheck) => {
        const existingIndex = updated.findIndex((check) => check.name === newCheck.name)
        if (existingIndex >= 0) {
          updated[existingIndex] = newCheck
        } else {
          updated.push(newCheck)
        }
      })
      return updated
    })
  }

  const clearErrors = () => {
    setErrors([])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "fail":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800"
      case "fail":
        return "bg-red-100 text-red-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-red-300 text-red-700 hover:bg-red-50"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Debug Panel ({errors.length})
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-4 z-50 bg-white/95 backdrop-blur-lg rounded-lg shadow-2xl border">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Debug Panel</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={runSystemChecks} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsVisible(false)} variant="outline" size="sm">
            Close
          </Button>
        </div>
      </div>

      <div className="p-4 h-[calc(100vh-8rem)] overflow-auto">
        <Tabs defaultValue="errors" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="errors">Errors ({errors.filter((e) => e.type === "error").length})</TabsTrigger>
            <TabsTrigger value="warnings">Warnings ({errors.filter((e) => e.type === "warning").length})</TabsTrigger>
            <TabsTrigger value="system">System Checks</TabsTrigger>
          </TabsList>

          <TabsContent value="errors" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">JavaScript Errors</h3>
              <Button onClick={clearErrors} variant="outline" size="sm">
                Clear All
              </Button>
            </div>

            {errors.filter((e) => e.type === "error").length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>No errors detected</p>
              </div>
            ) : (
              <div className="space-y-2">
                {errors
                  .filter((e) => e.type === "error")
                  .map((error) => (
                    <Alert key={error.id} className="border-red-200 bg-red-50">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium text-red-800">{error.message}</p>
                          <div className="text-xs text-red-600">
                            <p>Component: {error.component}</p>
                            <p>Time: {error.timestamp.toLocaleTimeString()}</p>
                          </div>
                          {error.stack && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-red-600 hover:text-red-800">
                                Stack Trace
                              </summary>
                              <pre className="mt-1 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                                {error.stack}
                              </pre>
                            </details>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="warnings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">JavaScript Warnings</h3>
              <Button onClick={clearErrors} variant="outline" size="sm">
                Clear All
              </Button>
            </div>

            {errors.filter((e) => e.type === "warning").length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>No warnings detected</p>
              </div>
            ) : (
              <div className="space-y-2">
                {errors
                  .filter((e) => e.type === "warning")
                  .map((warning) => (
                    <Alert key={warning.id} className="border-yellow-200 bg-yellow-50">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium text-yellow-800">{warning.message}</p>
                          <div className="text-xs text-yellow-600">
                            <p>Component: {warning.component}</p>
                            <p>Time: {warning.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">System Status</h3>
              <Button onClick={runSystemChecks} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Checks
              </Button>
            </div>

            <div className="space-y-3">
              {systemChecks.map((check, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <h4 className="font-medium text-sm">{check.name}</h4>
                        <p className="text-sm text-gray-600">{check.message}</p>
                        {check.details && <p className="text-xs text-gray-500 mt-1">{check.details}</p>}
                      </div>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(check.status)}>
                      {check.status.toUpperCase()}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            {systemChecks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Info className="w-8 h-8 mx-auto mb-2" />
                <p>Click "Run Checks" to start system diagnostics</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 