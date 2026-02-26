import type { Metadata } from "next"
import { Playground } from "@/components/api-playground/playground"

export const metadata: Metadata = {
  title: "API Playground",
  description: "Test API endpoints directly from the browser.",
}

export default function PlaygroundPage() {
  return <Playground />
}
