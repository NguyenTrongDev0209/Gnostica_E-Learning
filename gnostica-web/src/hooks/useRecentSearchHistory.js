import { useState } from "react"
import { normalizeSearchText } from "@/utils/searchSuggestions"

const historyLifetime = 30 * 24 * 60 * 60 * 1000
const legacySearchesKey = "gnostica-recent-searches"
const legacyCoursesKey = "gnostica-recent-courses"

const readHistory = (storageKey, legacyKey, type, validCoursesById) => {
  if (typeof window === "undefined") return []

  try {
    const scopedValue = window.localStorage.getItem(storageKey)
    const legacyValue = window.localStorage.getItem(legacyKey)
    const rawValue = scopedValue || legacyValue || "[]"
    const parsedValue = JSON.parse(rawValue)
    if (!Array.isArray(parsedValue)) return []

    const now = Date.now()
    const validRecords = parsedValue
      .map((item) => {
        if (type === "search" && typeof item === "string") return { value: item, savedAt: now }
        if (type === "course" && (typeof item === "string" || typeof item === "number")) {
          const course = validCoursesById.get(String(item))
          return course ? { course, savedAt: now } : null
        }
        if (type === "course" && item?.id && !item.course) {
          const course = validCoursesById.get(String(item.id))
          return course ? { course, savedAt: item.savedAt || now } : null
        }
        return item
      })
      .filter((item) => item && now - Number(item.savedAt) <= historyLifetime)
      .filter((item) => type !== "course" || item.course?.id)

    window.localStorage.setItem(storageKey, JSON.stringify(validRecords))
    if (!scopedValue && legacyValue) window.localStorage.removeItem(legacyKey)
    return validRecords
  } catch {
    return []
  }
}

export const useRecentSearchHistory = (storageScope, validCourses) => {
  const safeScope = String(storageScope || "guest")
  const searchesKey = `${legacySearchesKey}:${safeScope}`
  const coursesKey = `${legacyCoursesKey}:${safeScope}`
  const validCoursesById = new Map(validCourses.map((course) => [String(course.id), course]))
  const [searchRecords, setSearchRecords] = useState(() =>
    readHistory(searchesKey, legacySearchesKey, "search", validCoursesById).slice(0, 3)
  )
  const [courseRecords, setCourseRecords] = useState(() =>
    readHistory(coursesKey, legacyCoursesKey, "course", validCoursesById).slice(0, 5)
  )

  const persist = (storageKey, records) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(records))
    }
  }

  const rememberSearch = (query) => {
    const trimmedQuery = query.trim()
    setSearchRecords((currentRecords) => {
      const normalizedQuery = normalizeSearchText(trimmedQuery)
      const nextRecords = [
        { value: trimmedQuery, savedAt: Date.now() },
        ...currentRecords.filter((item) => normalizeSearchText(item.value) !== normalizedQuery),
      ].slice(0, 3)
      persist(searchesKey, nextRecords)
      return nextRecords
    })
  }

  const rememberCourse = (course) => {
    setCourseRecords((currentRecords) => {
      const nextRecords = [
        { course, savedAt: Date.now() },
        ...currentRecords.filter((item) => String(item.course.id) !== String(course.id)),
      ].slice(0, 5)
      persist(coursesKey, nextRecords)
      return nextRecords
    })
  }

  const clearHistory = () => {
    setSearchRecords([])
    setCourseRecords([])
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(searchesKey)
      window.localStorage.removeItem(coursesKey)
      window.localStorage.removeItem(legacySearchesKey)
      window.localStorage.removeItem(legacyCoursesKey)
    }
  }

  return {
    recentSearches: searchRecords.map((item) => item.value),
    recentCourses: courseRecords.map((item) => item.course),
    rememberSearch,
    rememberCourse,
    clearHistory,
  }
}
