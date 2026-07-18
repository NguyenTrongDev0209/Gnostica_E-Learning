import { useEffect, useRef, useState } from "react"

const typingSuggestions = [
  "Bạn muốn học gì hôm nay?",
  "Thử tìm khóa học lập trình Web...",
  "Tìm khóa học thiết kế UI/UX...",
  "Khám phá khóa học Data Science...",
]

export const useTypewriterPlaceholder = () => {
  const [placeholder, setPlaceholder] = useState("")
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const resumeTimer = useRef(null)

  useEffect(() => {
    if (isPaused) return undefined

    const suggestion = typingSuggestions[suggestionIndex]
    const isComplete = placeholder === suggestion
    const isEmpty = placeholder === ""
    let delay = isDeleting ? 45 : 85
    if (isComplete && !isDeleting) delay = 5000
    if (isEmpty && isDeleting) delay = 700

    const timer = setTimeout(() => {
      if (isComplete && !isDeleting) return setIsDeleting(true)
      if (isEmpty && isDeleting) {
        setIsDeleting(false)
        setSuggestionIndex((current) => (current + 1) % typingSuggestions.length)
        return
      }
      setPlaceholder((current) => isDeleting
        ? current.slice(0, -1)
        : suggestion.slice(0, current.length + 1))
    }, delay)

    return () => clearTimeout(timer)
  }, [isDeleting, isPaused, placeholder, suggestionIndex])

  useEffect(() => () => clearTimeout(resumeTimer.current), [])

  const pause = () => {
    clearTimeout(resumeTimer.current)
    setIsPaused(true)
  }

  const resumeAfter = (delay = 1600) => {
    clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      setPlaceholder("")
      setSuggestionIndex(0)
      setIsDeleting(false)
      setIsPaused(false)
    }, delay)
  }

  return { placeholder, isPaused, pause, resumeAfter }
}
