import type { ActivityEvent } from '../../types/analytics'
import ActivityTimelineItem from './ActivityTimelineItem'

interface ActivityTimelineProps {
  events: ActivityEvent[]
}

export default function ActivityTimeline({ events }: ActivityTimelineProps) {
  return (
    <div
      className="border border-border relative overflow-hidden"
      style={{
        background: 'rgba(10, 20, 32, 0.55)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(100,240,200,0.15), transparent)',
        }}
      />
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-dim">
          Activity Stream
        </h3>
        <span className="font-mono text-[10px] px-2 py-0.5 border border-border text-accent">
          {events.length} events
        </span>
      </div>
      <div
        className="overflow-y-auto"
        style={{
          maxHeight: '400px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(100,240,200,0.15) transparent',
        }}
      >
        {events.map((event) => (
          <ActivityTimelineItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
