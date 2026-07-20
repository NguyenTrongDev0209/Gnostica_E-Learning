import Fuse from "fuse.js"
import { getSearchTokens, normalizeSearchText } from "@/utils/searchSuggestions"

const INTENT_ALIASES = [
  { triggers: ["lap", "web"], phrases: ["lap trinh web", "phat trien web", "web development", "frontend", "backend"] },
  { triggers: ["lap trinh"], phrases: ["lap trinh", "programming", "coding", "phan mem"] },
  { triggers: ["an ninh"], phrases: ["an ninh mang", "an toan thong tin", "bao mat", "cyber security"] },
  { triggers: ["con nghe"], phrases: ["cong nghe", "cong nghe thong tin", "lap trinh", "phan mem"] },
  { triggers: ["cong nghe"], phrases: ["cong nghe thong tin", "lap trinh", "phan mem"] },
  { triggers: ["du lieu"], phrases: ["du lieu", "data", "phan tich du lieu", "khoa hoc du lieu"] },
  { triggers: ["bao mat"], phrases: ["bao mat", "an toan thong tin", "cyber security"] },
  { triggers: ["thiet ke"], phrases: ["thiet ke", "ui ux", "trai nghiem nguoi dung"] },
]

const buildSearchPhrases = (query) => {
  const normalizedQuery = normalizeSearchText(query).trim()
  const phrases = new Set([normalizedQuery])
  INTENT_ALIASES.forEach(({ triggers, phrases: aliases }) => {
    if (triggers.every((trigger) => normalizedQuery.includes(trigger))) aliases.forEach((alias) => phrases.add(alias))
  })
  return [...phrases].filter(Boolean)
}

const searchableText = (course) => [course.title, course.categoryName, course.category?.name, course.description, course.shortDescription, course.instructorName].filter(Boolean).join(" ")

export const rankRelatedCourses = (query, courses = [], excludedIds = [], limit = 4) => {
  if (!query.trim() || courses.length === 0) return []
  const excluded = new Set(excludedIds.map(String))
  const candidates = courses.filter((course) => !excluded.has(String(course.id)))
  const phrases = buildSearchPhrases(query)
  const queryTokens = getSearchTokens(phrases.join(" "))
  const bestScores = new Map()
  const fuse = new Fuse(candidates, {
    includeScore: true, ignoreLocation: true, threshold: 0.58, minMatchCharLength: 2,
    keys: [
      { name: "title", weight: 0.5 }, { name: "categoryName", weight: 0.2 },
      { name: "category.name", weight: 0.15 }, { name: "description", weight: 0.1 },
      { name: "shortDescription", weight: 0.05 },
    ],
  })

  phrases.forEach((phrase, phraseIndex) => {
    fuse.search(phrase).forEach(({ item, score = 1 }) => {
      const text = normalizeSearchText(searchableText(item))
      const overlap = queryTokens.filter((token) => text.includes(token)).length
      const adjustedScore = score + phraseIndex * 0.015 - Math.min(overlap * 0.035, 0.2)
      const current = bestScores.get(item.id)
      if (!current || adjustedScore < current.score) bestScores.set(item.id, { item, score: adjustedScore })
    })
  })

  return [...bestScores.values()].filter(({ score }) => score <= 0.6)
    .sort((a, b) => a.score - b.score).slice(0, limit).map(({ item }) => item)
}
