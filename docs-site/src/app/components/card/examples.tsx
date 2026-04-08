'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@refraction-ui/react-card'
import { Button } from '@refraction-ui/react-button'

interface CardExamplesProps {
  section: 'basic'
}

export function CardExamples({ section }: CardExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>A brief description of the card content.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is the main content area. It can contain text, images, or any other React nodes.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>You have 3 unread messages.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  New deployment started
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Build completed successfully
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Review requested
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">View All</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
