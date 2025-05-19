import { Skeleton } from "./ui/skeleton"

const ChatDetailSkeleton = () => {
  return (
    <div className="flex flex-col h-screen flex-1">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-muted">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3 mb-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-16 w-3/4 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-muted">
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default ChatDetailSkeleton 