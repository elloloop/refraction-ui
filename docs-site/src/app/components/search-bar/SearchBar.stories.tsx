import {
  SearchBar,
  SearchResults,
  SearchResultItem,
} from '@refraction-ui/react-search-bar'
import { SearchBarExamples } from './examples'

// Generated from the docs-site example (curated, real props/content).
const meta = { title: 'Inputs/SearchBar' }
export default meta

export const Basic = { render: () => <SearchBarExamples section="basic" /> }

export const Loading = {
  render: () => (
    <div className="max-w-md w-full">
      <SearchBar
        placeholder="Search components..."
        defaultValue="cal"
        loading
      >
        <SearchResults>
          <SearchResultItem>Calendar</SearchResultItem>
        </SearchResults>
      </SearchBar>
    </div>
  ),
}
