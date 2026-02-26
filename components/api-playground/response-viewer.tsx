"use client"

import { useState } from "react"
import { IconCopy, IconCheck } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { ProxyResponse } from "./types"

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function prettyPrintJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2)
  } catch {
    return str
  }
}

function StatusBadge({ status, statusText }: { status: number; statusText: string }) {
  const isSuccess = status >= 200 && status < 300
  const isRedirect = status >= 300 && status < 400

  return (
    <Badge
      variant={isSuccess ? "default" : isRedirect ? "secondary" : "destructive"}
      className={cn(
        isSuccess && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        isRedirect && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      )}
    >
      {status} {statusText}
    </Badge>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon-xs" onClick={copy} aria-label="Copy response">
      {copied ? (
        <IconCheck className="size-3.5 text-emerald-500" />
      ) : (
        <IconCopy className="size-3.5" />
      )}
    </Button>
  )
}

type ResponseViewerProps = {
  response: ProxyResponse | null
  loading: boolean
  error: string | null
}

export function ResponseViewer({ response, loading, error }: ResponseViewerProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">Response</p>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">Response</p>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">Response</p>
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            Send a request to see the response
          </p>
        </div>
      </div>
    )
  }

  const formattedBody = prettyPrintJson(response.body)
  const headerEntries = Object.entries(response.headers)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Response</p>
        <div className="flex items-center gap-2">
          <StatusBadge status={response.status} statusText={response.statusText} />
          <span className="text-xs text-muted-foreground">{response.duration}ms</span>
          <span className="text-xs text-muted-foreground">
            {formatBytes(response.size)}
          </span>
        </div>
      </div>

      <Tabs defaultValue="body">
        <TabsList variant="line">
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">
            Headers
            {headerEntries.length > 0 && (
              <span className="ml-1 text-xs text-muted-foreground">
                ({headerEntries.length})
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="body" className="mt-2">
          <div className="relative">
            <pre className="max-h-96 overflow-auto rounded-lg border bg-muted/30 p-3 text-xs font-mono">
              {formattedBody}
            </pre>
            <div className="absolute right-2 top-2">
              <CopyButton text={formattedBody} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="headers" className="mt-2">
          <div className="rounded-lg border">
            <table className="w-full text-xs">
              <tbody>
                {headerEntries.map(([key, value]) => (
                  <tr key={key} className="border-b last:border-b-0">
                    <td className="px-3 py-1.5 font-mono font-medium text-muted-foreground">
                      {key}
                    </td>
                    <td className="px-3 py-1.5 font-mono break-all">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
