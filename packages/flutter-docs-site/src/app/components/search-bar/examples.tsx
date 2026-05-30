'use client'

import { useState } from 'react'
import { SearchBar, SearchResults, SearchResultItem } from '@refraction-ui/react-search-bar'

interface SearchBarExamplesProps {
  section: 'basic'
}

export function SearchBarExamples({ section }: SearchBarExamplesProps) {
  const [results, setResults] = useState<string[]>([])

  const handleSearch = (query: string) => {
    const allItems = ['Button', 'Input', 'Dialog', 'Badge', 'Toast', 'Tabs', 'Select', 'Calendar']
    setResults(allItems.filter((item) => item.toLowerCase().includes(query.toLowerCase())))
  }

  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-md">
          <SearchBar placeholder="Search components..." onSearch={handleSearch}>
            <SearchResults>
              {results.map((result) => (
                <SearchResultItem key={result}>{result}</SearchResultItem>
              ))}
            </SearchResults>
          </SearchBar>
        </div>
      </div>
    )
  }

  return null
}
