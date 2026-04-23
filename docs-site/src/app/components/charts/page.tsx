import { ChartsExamples } from './examples';
import { PropsTable } from '@/components/props-table';
import { CodeBlock } from '@/components/code-block';
import { InstallCommand } from '@/components/install-command';

const chartProps = [
  { name: 'width', type: 'number', description: 'Total width of the SVG' },
  { name: 'height', type: 'number', description: 'Total height of the SVG' },
  { name: 'margin', type: 'Partial<Margin>', description: 'Margin for axes' },
];

const angularUsageCode = `import { Component } from '@angular/core';
import { ChartComponent, BarsComponent, XAxisComponent, YAxisComponent } from '@refraction-ui/angular-charts';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChartComponent, BarsComponent, XAxisComponent, YAxisComponent],
  template: \`
    <re-chart [width]="500" [height]="300" [margin]="{ left: 50, bottom: 40 }">
      <svg:g re-bars
        [data]="data"
        [x]="getX"
        [y]="getY"
        fill="#3b82f6"
      ></svg:g>

      <svg:g re-x-axis
        [ticks]="['Jan', 'Feb', 'Mar', 'Apr']"
        [scale]="xScale"
        [height]="260"
      ></svg:g>

      <svg:g re-y-axis
        [ticks]="[0, 50, 100, 150, 200]"
        [scale]="yScale"
      ></svg:g>
    </re-chart>
  \`
})
export class AppComponent {
  data = [
    { label: 'Jan', value: 100 },
    { label: 'Feb', value: 150 },
    { label: 'Mar', value: 120 },
    { label: 'Apr', value: 200 },
  ];

  getX = (d: any) => d.label;
  getY = (d: any) => d.value;
  xScale = (val: string | number) => 0; // Mocked for snippet
  yScale = (val: string | number) => 0; // Mocked for snippet
}`;

const reactUsageCode = `import { Chart, Bars, XAxis, YAxis } from '@refraction-ui/react-charts';

export function MyChart() {
  const data = [{ label: 'Jan', value: 100 }, { label: 'Feb', value: 150 }];
  return (
    <Chart width={500} height={300} margin={{ left: 50, bottom: 40 }}>
      <Bars data={data} x={d => d.label} y={d => d.value} fill="blue" />
      <XAxis ticks={['Jan', 'Feb']} scale={() => 0} height={260} />
      <YAxis ticks={[0, 100, 200]} scale={() => 0} />
    </Chart>
  );
}`;

export default function ChartsPage() {
  return (
    <div className="space-y-12">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Component</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Charts</h1>
        <p className="mt-3 text-lg text-muted-foreground leading-relaxed">
          Composable data visualizations built on top of D3 scales and paths.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Examples</h2>
        <p className="text-sm text-muted-foreground">Basic Bar Chart.</p>
        <ChartsExamples />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
        <InstallCommand packageName="@refraction-ui/react-charts" />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>
        <CodeBlock frameworks={{ react: reactUsageCode, astro: '<!-- pending -->', angular: angularUsageCode }} />
      </section>

      <div className="h-px bg-border" />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Props (Chart)</h2>
        <PropsTable props={chartProps} />
      </section>
    </div>
  );
}
