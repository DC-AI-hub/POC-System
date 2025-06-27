'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">出错了</h1>
        <p className="text-lg text-gray-600 mb-8">
          {error.message || '系统发生错误，请稍后重试'}
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
          <a 
            href="/" 
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  )
} 