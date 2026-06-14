import type { Meta, StoryObj } from '@storybook/react'
import { Chart, Bars, Line, Circles, PieChart } from '@refraction-ui/react-charts'

const meta: Meta<typeof Chart> = {
  title: 'Components/Charts',
  component: Chart,
}
export default meta

type Story = StoryObj<typeof Chart>

const revenue = [
  { month: 'Jan', value: 32 },
  { month: 'Feb', value: 48 },
  { month: 'Mar', value: 41 },
  { month: 'Apr', value: 64 },
  { month: 'May', value: 58 },
  { month: 'Jun', value: 76 },
]

const series = [
  { x: 0, y: 12 },
  { x: 1, y: 28 },
  { x: 2, y: 22 },
  { x: 3, y: 40 },
  { x: 4, y: 34 },
  { x: 5, y: 52 },
]

const traffic = [
  { source: 'Direct', visits: 420 },
  { source: 'Search', visits: 310 },
  { source: 'Social', visits: 180 },
  { source: 'Email', visits: 90 },
]

export const BarsChart: StoryObj<any> = {
  render: () => (
    <div className="text-primary">
      <Chart width={520} height={280} margin={{ top: 16, right: 16, bottom: 32, left: 32 }}>
        <Bars data={revenue} x={(d) => d.month} y={(d) => d.value} fill="currentColor" />
      </Chart>
    </div>
  ),
}

export const LineChart: StoryObj<any> = {
  render: () => (
    <div className="text-primary">
      <Chart width={520} height={280} margin={{ top: 16, right: 16, bottom: 32, left: 32 }}>
        <Line data={series} x={(d) => d.x} y={(d) => d.y} stroke="currentColor" strokeWidth={2} />
        <Circles data={series} cx={(d) => d.x} cy={(d) => d.y} r={4} fill="currentColor" />
      </Chart>
    </div>
  ),
}

export const Pie: StoryObj<any> = {
  render: () => (
    <PieChart data={traffic} value={(d) => d.visits} width={280} height={280} />
  ),
}
