"use client"

import { IconSend2, IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { HttpMethod } from "./types"
import { METHOD_COLORS } from "./types"

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"]

type RequestBarProps = {
  method: HttpMethod
  url: string
  loading: boolean
  onMethodChange: (method: HttpMethod) => void
  onUrlChange: (url: string) => void
  onSend: () => void
}

export function RequestBar({
  method,
  url,
  loading,
  onMethodChange,
  onUrlChange,
  onSend,
}: RequestBarProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") onSend()
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={method}
        onValueChange={(val) => onMethodChange(val as HttpMethod)}
      >
        <SelectTrigger className={cn("w-28 font-mono font-semibold", METHOD_COLORS[method])}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {METHODS.map((m) => (
            <SelectItem key={m} value={m}>
              <span className={cn("font-mono font-semibold", METHOD_COLORS[m])}>
                {m}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input
        type="url"
        placeholder="https://api.example.com/endpoint"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 flex-1 rounded-lg border bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:ring-3 font-mono placeholder:text-muted-foreground"
      />

      <Button onClick={onSend} disabled={loading || !url} className="gap-1.5">
        {loading ? (
          <IconLoader2 className="size-4 animate-spin" />
        ) : (
          <IconSend2 className="size-4" />
        )}
        Send
      </Button>
    </div>
  )
}
