import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpRight, History, Loader2, Search, Trash2, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { AppButton } from "@/components/common/micro/AppButton"
import { categorySuggestionMocks, searchSuggestionMocks } from "@/mocks/searchSuggestions"
import { useRecentSearchHistory } from "@/hooks/useRecentSearchHistory"
import { useTypewriterPlaceholder } from "@/hooks/useTypewriterPlaceholder"
import { useCourseSearchSuggestions } from "@/hooks/course/useCourseSearchSuggestions"
import {
  getHighlightedSegments,
  getSearchScore,
  getSearchTokens,
  matchesSearchTokens,
  normalizeSearchText,
} from "@/utils/searchSuggestions"

const highlightMatchedText = (text, query) => {
  return getHighlightedSegments(text, query).map((segment, index) => segment.isHighlighted ? (
    <span key={`${segment.text}-${index}`} className="text-accent">{segment.text}</span>
  ) : segment.text)
}

const handleCourseImageError = (event) => {
  event.currentTarget.onerror = null
  event.currentTarget.src = "/banner_small1.webp"
}

const AppSearchInput = ({ className = "", storageScope = "guest" }) => {
  const [isFocused, setIsFocused] = useState(false)
  const [value, setValue] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isComposing, setIsComposing] = useState(false)
  const [activeSuggestionKey, setActiveSuggestionKey] = useState(null)
  const searchInputRef = useRef(null)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()
  const {
    courses: serverCourses,
    isLoading: isLoadingServerCourses,
    hasServerResult,
  } = useCourseSearchSuggestions(searchQuery)
  const { placeholder, isPaused: isPlaceholderPaused, pause, resumeAfter } = useTypewriterPlaceholder()
  const {
    recentSearches,
    recentCourses,
    rememberSearch: persistRecentSearch,
    rememberCourse,
    clearHistory,
  } = useRecentSearchHistory(storageScope, searchSuggestionMocks)

  const handleFocus = () => {
    setIsFocused(true)
    setActiveSuggestionKey(null)
    pause()
  }

  const handleBlur = () => {
    setTimeout(() => setIsFocused(false), 200)
    resumeAfter(1600)
  }

  const { categorySuggestions, courseSuggestions } = useMemo(() => {
    const tokens = getSearchTokens(searchQuery)
    const courseSource = hasServerResult && serverCourses.length > 0
      ? serverCourses
      : searchSuggestionMocks
    if (tokens.length === 0) {
      return {
        categorySuggestions: categorySuggestionMocks,
        courseSuggestions: courseSource,
      }
    }

    return {
      categorySuggestions: categorySuggestionMocks
        .filter((category) => matchesSearchTokens(category.label, tokens))
        .sort((first, second) =>
          getSearchScore(second.label, tokens) - getSearchScore(first.label, tokens)
        ),
      courseSuggestions: courseSource
        .filter((course) => matchesSearchTokens(
          `${course.title} ${course.category} ${course.instructor}`,
          tokens
        ))
        .sort((first, second) => {
          const getCourseScore = (course) =>
            getSearchScore(course.title, tokens) * 3 +
            getSearchScore(course.category, tokens) * 2 +
            getSearchScore(course.instructor, tokens)
          return getCourseScore(second) - getCourseScore(first)
        }),
    }
  }, [hasServerResult, searchQuery, serverCourses])

  const isMeaningfulSearch = (query) => {
    const tokens = getSearchTokens(query)
    if (tokens.length === 0) return false

    return categorySuggestionMocks.some((category) =>
      matchesSearchTokens(category.label, tokens)
    ) || [...searchSuggestionMocks, ...serverCourses].some((course) =>
      matchesSearchTokens(`${course.title} ${course.category} ${course.instructor}`, tokens)
    )
  }

  const rememberMeaningfulSearch = (query) => {
    const trimmedQuery = query.trim()
    if (!isMeaningfulSearch(trimmedQuery)) return
    persistRecentSearch(trimmedQuery)
  }

  const selectSuggestion = (query, course) => {
    rememberMeaningfulSearch(query)
    if (course) rememberCourse(course)
    setValue(query)
    setSearchQuery(query)
    navigate(`/search?q=${encodeURIComponent(query)}`)
    setIsFocused(false)
    searchInputRef.current?.blur()
  }

  const visibleCategorySuggestions = categorySuggestions
    .filter((category) =>
      searchQuery.trim() || !recentSearches.some((recentSearch) =>
        normalizeSearchText(recentSearch) === normalizeSearchText(category.label)
      )
    )
    .slice(0, searchQuery.trim() ? 10 : 5)

  const handleSearch = () => {
    if (!value.trim()) return
    rememberMeaningfulSearch(value)
    navigate(`/search?q=${encodeURIComponent(value.trim())}`)
    setIsFocused(false)
    searchInputRef.current?.blur()
  }

  const displayedCourses = searchQuery.trim() ? courseSuggestions : recentCourses

  const selectableSuggestions = useMemo(() => [
    ...(!searchQuery.trim() ? recentSearches.map((query) => ({
      key: `recent-${query}`,
      query,
    })) : []),
    ...visibleCategorySuggestions.map((category) => ({
      key: `category-${category.id}`,
      query: category.label,
    })),
    ...displayedCourses.map((course) => ({
      key: `course-${course.id}`,
      query: course.title,
      course,
    })),
  ], [displayedCourses, recentSearches, searchQuery, visibleCategorySuggestions])

  useEffect(() => {
    if (!activeSuggestionKey) return
    dropdownRef.current
      ?.querySelector(`[data-suggestion-key="${CSS.escape(activeSuggestionKey)}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [activeSuggestionKey])

  const handleInputChange = (event) => {
    const nextValue = event.target.value
    setValue(nextValue)
    setActiveSuggestionKey(null)
    if (!isComposing && !event.nativeEvent.isComposing) setSearchQuery(nextValue)
  }

  const handleInputKeyDown = (event) => {
    if (isComposing || event.nativeEvent.isComposing) return

    if (event.key === "Escape") {
      event.preventDefault()
      setIsFocused(false)
      searchInputRef.current?.blur()
      return
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      if (selectableSuggestions.length === 0) return
      const currentIndex = selectableSuggestions.findIndex((item) => item.key === activeSuggestionKey)
      const direction = event.key === "ArrowDown" ? 1 : -1
      const nextIndex = currentIndex === -1
        ? (direction === 1 ? 0 : selectableSuggestions.length - 1)
        : (currentIndex + direction + selectableSuggestions.length) % selectableSuggestions.length
      setActiveSuggestionKey(selectableSuggestions[nextIndex].key)
      return
    }

    if (event.key === "Enter") {
      event.preventDefault()
      const activeSuggestion = selectableSuggestions.find((item) => item.key === activeSuggestionKey)
      if (activeSuggestion) selectSuggestion(activeSuggestion.query, activeSuggestion.course)
      else handleSearch()
    }
  }

  return (
    <div className={`relative flex flex-col ${className}`}>
      <div className="z-10 flex h-[42px] items-center overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-accent/20">
        <div className="flex h-full min-w-0 flex-1 items-center">
          <Input
            ref={searchInputRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={(event) => {
              setIsComposing(false)
              setSearchQuery(event.currentTarget.value)
            }}
            placeholder={isPlaceholderPaused ? "Bạn cần tìm gì..." : placeholder}
            className="h-full border-none bg-transparent pl-5 text-base text-black shadow-none placeholder:text-muted-foreground focus-visible:ring-0 md:text-base"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {value && (
            <AppButton
              type="button"
              appVariant="ghostMuted"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setValue("")
                setSearchQuery("")
                setActiveSuggestionKey(null)
              }}
              className="mr-1 h-8 w-8 shrink-0 rounded-full p-0 shadow-none"
              aria-label="Xóa nội dung tìm kiếm"
            >
              <X className="h-4 w-4" />
            </AppButton>
          )}
        </div>

        <AppButton
          onClick={handleSearch}
          appVariant="accent"
          className="h-full rounded-none px-6 shadow-none"
          aria-label="Tìm kiếm khóa học"
        >
          <Search className="h-5 w-5 stroke-[2.5]" />
        </AppButton>
      </div>

      {isFocused && (
        <div
          ref={dropdownRef}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="max-h-[520px] overflow-y-auto">
            <section className="border-b border-border p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <h3 className="py-1 text-sm font-bold text-foreground">Danh mục</h3>
                {!searchQuery.trim() && (recentSearches.length > 0 || recentCourses.length > 0) && (
                  <AppButton
                    type="button"
                    appVariant="ghostMuted"
                    appSize="sm"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      clearHistory()
                      setActiveSuggestionKey(null)
                    }}
                    className="text-xs !h-7 !gap-1.5 !px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa lịch sử
                  </AppButton>
                )}
              </div>
              {!searchQuery.trim() && recentSearches.map((recentSearch) => (
                <AppButton
                  key={`recent-${recentSearch}`}
                  role="option"
                  aria-selected={activeSuggestionKey === `recent-${recentSearch}`}
                  data-suggestion-key={`recent-${recentSearch}`}
                  appVariant="ghostMuted"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(recentSearch)}
                  onMouseEnter={() => setActiveSuggestionKey(`recent-${recentSearch}`)}
                  className={`group h-10 w-full justify-start gap-4 rounded-lg px-1 text-left ${activeSuggestionKey === `recent-${recentSearch}` ? "bg-muted text-primary" : ""}`}
                >
                  <History className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {recentSearch}
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
                </AppButton>
              ))}
              {visibleCategorySuggestions.length > 0 ? visibleCategorySuggestions.map((category) => (
                <AppButton
                  key={category.id}
                  role="option"
                  aria-selected={activeSuggestionKey === `category-${category.id}`}
                  data-suggestion-key={`category-${category.id}`}
                  appVariant="ghostMuted"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(category.label)}
                  onMouseEnter={() => setActiveSuggestionKey(`category-${category.id}`)}
                  className={`group h-10 w-full justify-start gap-4 rounded-lg px-1 text-left ${activeSuggestionKey === `category-${category.id}` ? "bg-muted text-primary" : ""}`}
                >
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {highlightMatchedText(category.label, searchQuery)}
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
                </AppButton>
              )) : (
                <p className="px-2 pb-3 text-sm text-muted-foreground">Không có danh mục phù hợp.</p>
              )}
            </section>

            <section className="p-2">
              <h3 className="px-2 py-2 text-sm font-bold text-foreground">
                <span className="flex items-center gap-2">
                  {searchQuery.trim() ? "Khóa học" : "Đã xem gần đây"}
                  {isLoadingServerCourses && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                </span>
              </h3>
              {displayedCourses.length > 0 ? displayedCourses.map((course) => (
                <AppButton
                  key={course.id}
                  role="option"
                  aria-selected={activeSuggestionKey === `course-${course.id}`}
                  data-suggestion-key={`course-${course.id}`}
                  appVariant="ghostMuted"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(course.title, course)}
                  onMouseEnter={() => setActiveSuggestionKey(`course-${course.id}`)}
                  className={`group mb-1 w-full justify-start rounded-lg text-left last:mb-0 !h-auto !min-h-[72px] !gap-3 !p-2 ${activeSuggestionKey === `course-${course.id}` ? "bg-muted text-primary" : ""}`}
                >
                  <img
                    src={course.image}
                    alt=""
                    onError={handleCourseImageError}
                    className="h-14 w-20 shrink-0 rounded-md object-cover"
                  />
                  <span className="min-w-0 flex-1 self-center">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">
                      {highlightMatchedText(course.category, searchQuery)}
                    </span>
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {highlightMatchedText(course.title, searchQuery)}
                    </span>
                    <span className="mt-1 block truncate text-xs font-normal text-muted-foreground">
                      {highlightMatchedText(course.instructor, searchQuery)}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 self-center text-muted-foreground transition-colors group-hover:text-accent" />
                </AppButton>
              )) : (
                <p className="px-2 pb-3 text-sm text-muted-foreground">
                  {searchQuery.trim() ? "Không có khóa học phù hợp." : "Chưa có khóa học đã xem gần đây."}
                </p>
              )}

              {searchQuery.trim() && categorySuggestions.length === 0 && courseSuggestions.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Không tìm thấy gợi ý cho “{value}”
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

export default AppSearchInput
