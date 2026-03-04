import { cache } from "react"
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { getFlatNavItems, type NavItem } from "@/components/sidebar/navigation"

const CONTENT_DIR = path.join(process.cwd(), "content/docs")

export type DocFrontmatter = {
  title: string
  description: string
}

export const getDocBySlug = cache(function getDocBySlug(slug: string[]) {
  const filePath = path.join(CONTENT_DIR, ...slug) + ".mdx"

  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  return {
    frontmatter: data as DocFrontmatter,
    content,
  }
})

export type AdjacentPage = {
  title: string
  description: string
  href: string
}

/**
 * Given a href (e.g. "/" or "/installation"), return the previous and next
 * pages based on the sidebar navigation order, with descriptions from frontmatter.
 */
export function getAdjacentPages(href: string): {
  prev: AdjacentPage | null
  next: AdjacentPage | null
} {
  const apiItems = getApiNavItems()
  const items = getFlatNavItems(apiItems)

  const index = items.findIndex((item) => item.href === href)
  if (index === -1) return { prev: null, next: null }

  function resolve(
    navItem: { title: string; href: string } | undefined
  ): AdjacentPage | null {
    if (!navItem) return null
    const slug =
      navItem.href === "/"
        ? ["introduction"]
        : navItem.href.split("/").filter(Boolean)
    const doc = getDocBySlug(slug)
    return {
      title: navItem.title,
      description: doc?.frontmatter.description ?? "",
      href: navItem.href,
    }
  }

  return {
    prev: resolve(items[index - 1]),
    next: resolve(items[index + 1]),
  }
}

/**
 * Scan content/docs/api/ for MDX files and return nav items
 * sorted by the `order` frontmatter field.
 */
export function getApiNavItems(): NavItem[] {
  const apiDir = path.join(CONTENT_DIR, "api")
  if (!fs.existsSync(apiDir)) return []

  const files = fs.readdirSync(apiDir).filter((f) => f.endsWith(".mdx"))

  const items = files.map((file) => {
    const raw = fs.readFileSync(path.join(apiDir, file), "utf-8")
    const { data } = matter(raw)
    const slug = file.replace(".mdx", "")
    return {
      title: (data.title as string) || slug,
      href: `/api/${slug}`,
      order: (data.order as number) ?? 999,
    }
  })

  items.sort((a, b) => a.order - b.order)

  return items.map(({ title, href }) => ({ title, href }))
}

export function getAllDocSlugs(): string[][] {
  const slugs: string[][] = []

  function walk(dir: string, prefix: string[] = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), [...prefix, entry.name])
      } else if (entry.name.endsWith(".mdx")) {
        slugs.push([...prefix, entry.name.replace(".mdx", "")])
      }
    }
  }

  if (fs.existsSync(CONTENT_DIR)) {
    walk(CONTENT_DIR)
  }

  return slugs
}
