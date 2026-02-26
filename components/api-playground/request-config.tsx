"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { KeyValueEditor } from "./key-value-editor"
import type { KeyValuePair, AuthConfig, AuthType } from "./types"

type RequestConfigProps = {
  params: KeyValuePair[]
  headers: KeyValuePair[]
  body: string
  auth: AuthConfig
  onParamsChange: (params: KeyValuePair[]) => void
  onHeadersChange: (headers: KeyValuePair[]) => void
  onBodyChange: (body: string) => void
  onAuthChange: (auth: AuthConfig) => void
}

const AUTH_TYPES: { value: AuthType; label: string }[] = [
  { value: "none", label: "No Auth" },
  { value: "bearer", label: "Bearer Token" },
  { value: "api-key", label: "API Key" },
  { value: "basic", label: "Basic Auth" },
]

export function RequestConfig({
  params,
  headers,
  body,
  auth,
  onParamsChange,
  onHeadersChange,
  onBodyChange,
  onAuthChange,
}: RequestConfigProps) {
  function handleAuthTypeChange(type: AuthType) {
    switch (type) {
      case "none":
        onAuthChange({ type: "none" })
        break
      case "bearer":
        onAuthChange({ type: "bearer", token: "" })
        break
      case "api-key":
        onAuthChange({ type: "api-key", key: "", value: "", addTo: "header" })
        break
      case "basic":
        onAuthChange({ type: "basic", username: "", password: "" })
        break
    }
  }

  return (
    <Tabs defaultValue="params">
      <TabsList variant="line">
        <TabsTrigger value="params">
          Params
          {params.filter((p) => p.enabled && p.key).length > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({params.filter((p) => p.enabled && p.key).length})
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="headers">
          Headers
          {headers.filter((h) => h.enabled && h.key).length > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({headers.filter((h) => h.enabled && h.key).length})
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="body">Body</TabsTrigger>
        <TabsTrigger value="auth">Auth</TabsTrigger>
      </TabsList>

      <TabsContent value="params" className="mt-3">
        <KeyValueEditor pairs={params} onChange={onParamsChange} />
      </TabsContent>

      <TabsContent value="headers" className="mt-3">
        <KeyValueEditor pairs={headers} onChange={onHeadersChange} />
      </TabsContent>

      <TabsContent value="body" className="mt-3">
        <Textarea
          placeholder='{"key": "value"}'
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          className="min-h-32 font-mono text-xs"
        />
      </TabsContent>

      <TabsContent value="auth" className="mt-3 space-y-3">
        <Select
          value={auth.type}
          onValueChange={(val) => handleAuthTypeChange(val as AuthType)}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AUTH_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {auth.type === "bearer" && (
          <Input
            placeholder="Token"
            value={auth.token}
            onChange={(e) =>
              onAuthChange({ type: "bearer", token: e.target.value })
            }
            className="font-mono text-sm"
          />
        )}

        {auth.type === "api-key" && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Header name"
                value={auth.key}
                onChange={(e) =>
                  onAuthChange({ ...auth, key: e.target.value })
                }
                className="flex-1"
              />
              <Input
                placeholder="Value"
                value={auth.value}
                onChange={(e) =>
                  onAuthChange({ ...auth, value: e.target.value })
                }
                className="flex-1"
              />
            </div>
            <Select
              value={auth.addTo}
              onValueChange={(val) =>
                onAuthChange({
                  ...auth,
                  addTo: val as "header" | "query",
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="query">Query Param</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {auth.type === "basic" && (
          <div className="flex gap-2">
            <Input
              placeholder="Username"
              value={auth.username}
              onChange={(e) =>
                onAuthChange({ ...auth, username: e.target.value })
              }
              className="flex-1"
            />
            <Input
              placeholder="Password"
              type="password"
              value={auth.password}
              onChange={(e) =>
                onAuthChange({ ...auth, password: e.target.value })
              }
              className="flex-1"
            />
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
