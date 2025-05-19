import { Skeleton } from "./ui/skeleton"

const ChatListSkeleton = () => {
  return (
    <div className="flex h-screen p-2">
      <div className="flex flex-col h-screen border bg-muted border-muted w-96">
        <div className="space-y-1">
          {/* Input and Button Skeletons */}
          {[1, 2].map((i) => (
            <div className="flex items-center justify-center gap-1" key={i}>
              <Skeleton className="flex-[12] h-[8.5]" />
              <Skeleton className="flex-[4] h-9" />
            </div>
          ))}
        </div>
        <ul className="p-2 mt-5 overflow-y-auto border-r border-muted bg-background">
          {/* Chat Item Skeletons */}
          {[1, 2, 3, 4, 5].map((i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 p-3 border-b border-muted"
            >
              <div className="flex items-center flex-1 min-w-0 gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 ml-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-6 rounded-full" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ChatListSkeleton 