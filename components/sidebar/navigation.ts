import { IconRocket, IconApi, IconTerminal2 } from "@tabler/icons-react"

export type NavItem = {
  title: string
  href: string
}

export type NavGroup = {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
}

/** Flat ordered list of all nav items across groups. */
export function getFlatNavItems(apiItems?: NavItem[]): NavItem[] {
  return buildNavigation(apiItems).flatMap((group) => group.items)
}

export function buildNavigation(apiItems?: NavItem[]): NavGroup[] {
  return [
    {
      title: "Getting Started",
      icon: IconRocket,
      items: [
        { title: "Introduction", href: "/" },
        { title: "Getting Started", href: "/getting-started" },
      ],
    },
    {
      title: "API Reference",
      icon: IconApi,
      items: apiItems ?? [],
    },
    {
      title: "Tools",
      icon: IconTerminal2,
      items: [{ title: "API Playground", href: "/playground" }],
    },
  ]
}
