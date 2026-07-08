import { useState, useEffect, useCallback } from "react"
import { Search, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import courseService from "@/services/course/courseService"

// Ô tìm kiếm có icon kính lúp bên trái — nhận className từ ngoài để tuỳ chỉnh responsive/layout
const AppSearchInput = ({ className = "" }) => {
  const [isFocused, setIsFocused] = useState(false)
  const [value, setValue] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Fetch suggestions with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value.trim().length >= 2) {
        setLoading(true)
        try {
          const response = await courseService.getPublicCourses({
            search: value.trim(),
            size: 8
          })
          if (response && response.content) {
            // Lấy danh sách tên khóa học không trùng lặp
            const titles = [...new Set(response.content.map(c => c.title))]
            setSuggestions(titles)
          }
        } catch (error) {
          console.error("Error fetching suggestions:", error)
          setSuggestions([])
        } finally {
          setLoading(false)
        }
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [value])

  const handleSearch = () => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`)
      setIsFocused(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className={`flex flex-col relative ${className}`}>
      {/* Container chính: Bo tròn, có border, chứa cả Input và Button */}
      <div className="flex items-center rounded-lg bg-white border border-border overflow-hidden shadow-sm h-[42px] focus-within:ring-2 focus-within:ring-accent/20 transition-all z-10">
        {/* Phần nhập liệu bên trái */}
        <div className="flex-1 flex items-center min-w-0 h-full">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bạn đang tìm gì..."
            className="border-none focus-visible:ring-0 shadow-none h-full text-base text-black placeholder:text-muted-foreground pl-5 bg-transparent md:text-base"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
        </div>

        <button
          onClick={handleSearch}
          className="h-full px-6 flex items-center justify-center bg-accent text-white hover:brightness-110 transition-all cursor-pointer"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 stroke-[2.5]" />}
        </button>
      </div>

      {/* Gợi ý tìm kiếm */}
      {isFocused && value.trim().length >= 2 && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="py-2 max-h-[400px] overflow-y-auto">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setValue(s)
                  navigate(`/search?q=${encodeURIComponent(s)}`)
                  setIsFocused(false)
                }}
                className="w-full px-4 py-2.5 flex items-center gap-4 hover:bg-muted transition-colors text-left group"
              >
                <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-foreground group-hover:text-black line-clamp-1">{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AppSearchInput
