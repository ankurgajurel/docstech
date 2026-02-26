"use client"

import { useState, useCallback } from "react"
import { IconTestPipe } from "@tabler/icons-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { RequestBar } from "./request-bar"
import { RequestConfig } from "./request-config"
import { ResponseViewer } from "./response-viewer"
import { CodeGenerator } from "./code-generator"
import { createPair } from "./key-value-editor"
import type {
  HttpMethod,
  KeyValuePair,
  AuthConfig,
  ProxyResponse,
  ProxyError,
} from "./types"

export function Playground() {
  const [method, setMethod] = useState<HttpMethod>("GET")
  const [url, setUrl] = useState("")
  const [params, setParams] = useState<KeyValuePair[]>([createPair()])
  const [headers, setHeaders] = useState<KeyValuePair[]>([createPair()])
  const [body, setBody] = useState("")
  const [auth, setAuth] = useState<AuthConfig>({ type: "none" })

  const [response, setResponse] = useState<ProxyResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buildUrl = useCallback((): string => {
    if (!url) return ""
    try {
      const u = new URL(url)
      for (const p of params) {
        if (p.enabled && p.key) {
          u.searchParams.set(p.key, p.value)
        }
      }
      // Add API key as query param if configured
      if (auth.type === "api-key" && auth.addTo === "query" && auth.key) {
        u.searchParams.set(auth.key, auth.value)
      }
      return u.toString()
    } catch {
      return url
    }
  }, [url, params, auth])

  const buildHeaders = useCallback((): Record<string, string> => {
    const result: Record<string, string> = {}
    for (const h of headers) {
      if (h.enabled && h.key) result[h.key] = h.value
    }
    if (auth.type === "bearer" && auth.token) {
      result["Authorization"] = `Bearer ${auth.token}`
    } else if (auth.type === "basic" && auth.username) {
      const encoded = btoa(`${auth.username}:${auth.password}`)
      result["Authorization"] = `Basic ${encoded}`
    } else if (auth.type === "api-key" && auth.addTo === "header" && auth.key) {
      result[auth.key] = auth.value
    }
    // Set Content-Type for body requests if not already set
    if (body && method !== "GET" && !result["Content-Type"] && !result["content-type"]) {
      result["Content-Type"] = "application/json"
    }
    return result
  }, [headers, auth, body, method])

  function handleAddTestFields() {
    setMethod("POST")
    setUrl("https://jsonplaceholder.typicode.com/posts")
    setHeaders([
      createPair("Content-Type", "application/json"),
      createPair("Accept", "application/json"),
    ])
    setParams([createPair("userId", "1")])
    setBody(JSON.stringify({ title: "Test Post", body: "This is a test request from the API Playground.", userId: 1 }, null, 2))
    setAuth({ type: "bearer", token: "test-token-abc123" })
    setResponse(null)
    setError(null)
  }

  async function handleSend() {
    if (!url) return

    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          url: buildUrl(),
          headers: buildHeaders(),
          body: body && method !== "GET" ? body : null,
        }),
      })

      const data: ProxyResponse | ProxyError = await res.json()

      if ("error" in data) {
        setError(data.error)
      } else {
        setResponse(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Playground</h1>
        <div className="mt-1 flex items-center gap-3">
          <p className="text-muted-foreground">
            Test API endpoints directly from the browser.
          </p>
          <Button variant="outline" size="sm" onClick={handleAddTestFields} className="gap-1.5">
            <IconTestPipe className="size-3.5" />
            Add Test Fields
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <RequestBar
            method={method}
            url={url}
            loading={loading}
            onMethodChange={setMethod}
            onUrlChange={setUrl}
            onSend={handleSend}
          />

          <Separator />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <RequestConfig
                params={params}
                headers={headers}
                body={body}
                auth={auth}
                onParamsChange={setParams}
                onHeadersChange={setHeaders}
                onBodyChange={setBody}
                onAuthChange={setAuth}
              />

              <Separator />

              <CodeGenerator
                method={method}
                url={buildUrl() || url}
                headers={headers}
                body={body}
                auth={auth}
              />
            </div>

            <div>
              <ResponseViewer
                response={response}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
