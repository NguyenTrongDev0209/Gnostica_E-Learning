export const normalizeSearchText = (text) =>
  text
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")

export const getSearchTokens = (query) =>
  normalizeSearchText(query).trim().split(/\s+/).filter(Boolean)

const getLevenshteinDistance = (firstValue, secondValue) => {
  const previousRow = Array.from({ length: secondValue.length + 1 }, (_, index) => index)

  for (let firstIndex = 1; firstIndex <= firstValue.length; firstIndex += 1) {
    const currentRow = [firstIndex]
    for (let secondIndex = 1; secondIndex <= secondValue.length; secondIndex += 1) {
      const substitutionCost = firstValue[firstIndex - 1] === secondValue[secondIndex - 1] ? 0 : 1
      currentRow[secondIndex] = Math.min(
        currentRow[secondIndex - 1] + 1,
        previousRow[secondIndex] + 1,
        previousRow[secondIndex - 1] + substitutionCost
      )
    }
    previousRow.splice(0, previousRow.length, ...currentRow)
  }

  return previousRow[secondValue.length]
}

export const findTokenMatchRange = (normalizedText, token) => {
  const exactMatchIndex = normalizedText.indexOf(token)
  if (exactMatchIndex !== -1) {
    return { start: exactMatchIndex, end: exactMatchIndex + token.length, distance: 0 }
  }

  if (token.length < 3) return null

  const maximumDistance = token.length >= 6 ? 2 : 1
  for (const wordMatch of normalizedText.matchAll(/[a-z0-9]+/g)) {
    const comparableWord = wordMatch[0].slice(0, token.length)
    const distance = getLevenshteinDistance(comparableWord, token)
    if (comparableWord.length >= token.length - maximumDistance && distance <= maximumDistance) {
      return {
        start: wordMatch.index,
        end: wordMatch.index + Math.min(wordMatch[0].length, token.length),
        distance,
      }
    }
  }

  return null
}

export const matchesSearchTokens = (text, tokens) => {
  const normalizedText = normalizeSearchText(text)
  return tokens.every((token) => findTokenMatchRange(normalizedText, token) !== null)
}

export const getSearchScore = (text, tokens) => {
  const normalizedText = normalizeSearchText(text)
  const words = normalizedText.split(/\s+/)

  return tokens.reduce((total, token) => {
    if (normalizedText === token) return total + 120
    if (normalizedText.startsWith(token)) return total + 90
    if (words.some((word) => word.startsWith(token))) return total + 70
    if (normalizedText.includes(token)) return total + 50

    const fuzzyMatch = findTokenMatchRange(normalizedText, token)
    return total + (fuzzyMatch ? 30 - fuzzyMatch.distance * 5 : 0)
  }, 0)
}

export const getHighlightedSegments = (text, query) => {
  const tokens = getSearchTokens(query)
  if (tokens.length === 0) return [{ text, isHighlighted: false }]

  const characters = Array.from(text)
  const normalizedCharacters = []
  const normalizedToOriginalIndex = []

  characters.forEach((character, originalIndex) => {
    Array.from(normalizeSearchText(character)).forEach((normalizedCharacter) => {
      normalizedCharacters.push(normalizedCharacter)
      normalizedToOriginalIndex.push(originalIndex)
    })
  })

  const normalizedText = normalizedCharacters.join("")
  const highlightedCharacters = characters.map(() => false)

  tokens.forEach((token) => {
    const matchRange = findTokenMatchRange(normalizedText, token)
    if (!matchRange) return
    for (let index = matchRange.start; index < matchRange.end; index += 1) {
      highlightedCharacters[normalizedToOriginalIndex[index]] = true
    }
  })

  return characters.reduce((segments, character, index) => {
    const isHighlighted = highlightedCharacters[index]
    const previousSegment = segments.at(-1)
    if (previousSegment?.isHighlighted === isHighlighted) previousSegment.text += character
    else segments.push({ text: character, isHighlighted })
    return segments
  }, [])
}
