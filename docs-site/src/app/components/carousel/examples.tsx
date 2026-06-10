'use client'

import {
  Carousel,
  CarouselItem,
  CarouselTrigger,
  CarouselContent,
} from '@refraction-ui/react-carousel'

interface CarouselExamplesProps {
  section: 'single' | 'multiple'
}

const items = [
  {
    value: 'shipping',
    title: 'How long does shipping take?',
    body: 'Orders ship within one business day and arrive in 3–5 business days.',
  },
  {
    value: 'returns',
    title: 'What is your return policy?',
    body: 'Returns are accepted within 30 days of delivery for a full refund.',
  },
  {
    value: 'support',
    title: 'How do I contact support?',
    body: 'Reach our team any time at support@example.com — we reply within a day.',
  },
]

export function CarouselExamples({ section }: CarouselExamplesProps) {
  if (section === 'multiple') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <Carousel type="multiple" defaultValue={['shipping', 'support']} className="w-full">
          {items.map((item) => (
            <CarouselItem key={item.value} value={item.value}>
              <CarouselTrigger>{item.title}</CarouselTrigger>
              <CarouselContent>{item.body}</CarouselContent>
            </CarouselItem>
          ))}
        </Carousel>
      </div>
    )
  }

  // single + collapsible
  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <Carousel type="single" collapsible defaultValue="shipping" className="w-full">
        {items.map((item) => (
          <CarouselItem key={item.value} value={item.value}>
            <CarouselTrigger>{item.title}</CarouselTrigger>
            <CarouselContent>{item.body}</CarouselContent>
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  )
}
