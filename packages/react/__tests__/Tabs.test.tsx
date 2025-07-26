import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import React from 'react'
import { Tabs, TabList, Tab, TabPanel } from '../src/components/Tabs'

function setup() {
  return render(
    <Tabs defaultValue="one" lazy>
      <TabList>
        <Tab value="one">One</Tab>
        <Tab value="two">Two</Tab>
      </TabList>
      <TabPanel value="one">First</TabPanel>
      <TabPanel value="two">Second</TabPanel>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('renders active panel lazily', () => {
    const { queryByText } = setup()
    expect(queryByText('First')).toBeTruthy()
    expect(queryByText('Second')).toBeNull()
  })

  it('changes tab on arrow key', () => {
    const { getByText, queryByText } = setup()
    const first = getByText('One')
    fireEvent.keyDown(first, { key: 'ArrowRight' })
    expect(queryByText('Second')).toBeTruthy()
  })
})
