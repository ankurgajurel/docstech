"use client"

import { useState } from "react"
import { IconCopy, IconCheck, IconCode } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { HttpMethod, KeyValuePair, AuthConfig } from "./types"

type CodeGeneratorProps = {
  method: HttpMethod
  url: string
  headers: KeyValuePair[]
  body: string
  auth: AuthConfig
}

function buildHeaders(
  headers: KeyValuePair[],
  auth: AuthConfig
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const h of headers) {
    if (h.enabled && h.key) result[h.key] = h.value
  }
  if (auth.type === "bearer") {
    result["Authorization"] = `Bearer ${auth.token}`
  } else if (auth.type === "basic") {
    const encoded = btoa(`${auth.username}:${auth.password}`)
    result["Authorization"] = `Basic ${encoded}`
  } else if (auth.type === "api-key" && auth.addTo === "header") {
    result[auth.key] = auth.value
  }
  return result
}

function generateCurl(props: CodeGeneratorProps): string {
  const { method, url, body } = props
  const headers = buildHeaders(props.headers, props.auth)
  const parts = [`curl -X ${method}`]

  for (const [k, v] of Object.entries(headers)) {
    parts.push(`  -H '${k}: ${v}'`)
  }

  if (body && method !== "GET") {
    parts.push(`  -d '${body}'`)
  }

  parts.push(`  '${url}'`)
  return parts.join(" \\\n")
}

function generateFetch(props: CodeGeneratorProps): string {
  const { method, url, body } = props
  const headers = buildHeaders(props.headers, props.auth)

  const options: string[] = []
  options.push(`  method: "${method}",`)

  if (Object.keys(headers).length > 0) {
    options.push(`  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")},`)
  }

  if (body && method !== "GET") {
    options.push(`  body: ${JSON.stringify(body)},`)
  }

  return `fetch("${url}", {\n${options.join("\n")}\n})\n  .then(res => res.json())\n  .then(data => console.log(data));`
}

function generatePython(props: CodeGeneratorProps): string {
  const { method, url, body } = props
  const headers = buildHeaders(props.headers, props.auth)

  const lines = ["import requests", ""]
  const args = [`"${url}"`]

  if (Object.keys(headers).length > 0) {
    lines.push(`headers = ${JSON.stringify(headers, null, 4)}`)
    args.push("headers=headers")
  }

  if (body && method !== "GET") {
    lines.push(`data = '${body}'`)
    args.push("data=data")
  }

  lines.push("")
  lines.push(`response = requests.${method.toLowerCase()}(${args.join(", ")})`)
  lines.push("print(response.json())")
  return lines.join("\n")
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon-xs" onClick={copy} aria-label="Copy">
      {copied ? (
        <IconCheck className="size-3.5 text-emerald-500" />
      ) : (
        <IconCopy className="size-3.5" />
      )}
    </Button>
  )
}

export function CodeGenerator(props: CodeGeneratorProps) {
  const [open, setOpen] = useState(false)

  const curl = generateCurl(props)
  const fetchCode = generateFetch(props)
  const python = generatePython(props)

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5 text-muted-foreground"
      >
        <IconCode className="size-4" />
        {open ? "Hide" : "Show"} Code Snippets
      </Button>

      {open && (
        <div className="mt-2 rounded-lg border bg-muted/30 p-3">
          <Tabs defaultValue="curl">
            <TabsList variant="line" className="mb-2">
              <TabsTrigger value="curl">curl</TabsTrigger>
              <TabsTrigger value="fetch">fetch</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            <TabsContent value="curl">
              <div className="relative">
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono">
                  {curl}
                </pre>
                <div className="absolute right-2 top-2">
                  <CopyButton text={curl} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="fetch">
              <div className="relative">
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono">
                  {fetchCode}
                </pre>
                <div className="absolute right-2 top-2">
                  <CopyButton text={fetchCode} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="python">
              <div className="relative">
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono">
                  {python}
                </pre>
                <div className="absolute right-2 top-2">
                  <CopyButton text={python} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
