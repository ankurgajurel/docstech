"use client"

import { IconPlus, IconTrash } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { KeyValuePair } from "./types"

type KeyValueEditorProps = {
  pairs: KeyValuePair[]
  onChange: (pairs: KeyValuePair[]) => void
  keyPlaceholder?: string
  valuePlaceholder?: string
}

let nextId = 0
export function createPair(key = "", value = ""): KeyValuePair {
  return { id: `kv-${++nextId}`, key, value, enabled: true }
}

export function KeyValueEditor({
  pairs,
  onChange,
  keyPlaceholder = "Key",
  valuePlaceholder = "Value",
}: KeyValueEditorProps) {
  function update(id: string, field: "key" | "value" | "enabled", val: string | boolean) {
    onChange(pairs.map((p) => (p.id === id ? { ...p, [field]: val } : p)))
  }

  function remove(id: string) {
    onChange(pairs.filter((p) => p.id !== id))
  }

  function add() {
    onChange([...pairs, createPair()])
  }

  return (
    <div className="space-y-2">
      {pairs.map((pair) => (
        <div key={pair.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pair.enabled}
            onChange={(e) => update(pair.id, "enabled", e.target.checked)}
            className="size-4 shrink-0 accent-primary"
          />
          <Input
            placeholder={keyPlaceholder}
            value={pair.key}
            onChange={(e) => update(pair.id, "key", e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder={valuePlaceholder}
            value={pair.value}
            onChange={(e) => update(pair.id, "value", e.target.value)}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => remove(pair.id)}
            aria-label="Remove"
          >
            <IconTrash className="size-4 text-muted-foreground" />
          </Button>
        </div>
      ))}
      <Button variant="ghost" size="sm" onClick={add} className="gap-1.5">
        <IconPlus className="size-3.5" />
        Add
      </Button>
    </div>
  )
}
