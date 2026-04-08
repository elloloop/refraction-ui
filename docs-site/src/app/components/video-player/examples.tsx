'use client'
import { VideoPlayer } from '@refraction-ui/react-video-player'
interface VideoPlayerExamplesProps { section: 'basic' }
export function VideoPlayerExamples({ section }: VideoPlayerExamplesProps) {
  if (section === 'basic') {
    return (
      <div className="rounded-xl border border-border bg-card p-8">
        <div className="max-w-lg">
          <VideoPlayer src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
        </div>
      </div>
    )
  }
  return null
}
