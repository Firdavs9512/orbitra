import type { ActivityEvent } from '../../types/analytics'

const TYPE_COLORS: Record<ActivityEvent['type'], string> = {
  pageview: '#64f0c8',
  click: '#44ccff',
  scroll: '#6a8a82',
  form_submit: '#44ccff',
  purchase: '#ffb84c',
  signup: '#ffb84c',
  error: '#ff5f63',
}

const DEVICE_ICONS: Record<string, string> = {
  desktop: '🖥',
  mobile: '📱',
  tablet: '📟',
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const seconds = Math.floor(diff / 1000)

  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

interface ActivityTimelineItemProps {
  event: ActivityEvent
}

export default function ActivityTimelineItem({ event }: ActivityTimelineItemProps) {
  const color = TYPE_COLORS[event.type]

  return (
    <div
      className="flex items-start gap-3 py-2.5 px-3 border-b border-[rgba(255,255,255,0.04)]"
      style={{
        borderLeft: `2px solid ${color}`,
        animation: 'fadein 0.4s ease-out',
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="font-mono text-[8px] uppercase tracking-[0.08em] px-1.5 py-0.5 border"
            style={{ borderColor: color, color }}
          >
            {event.type.replace('_', ' ')}
          </span>
          <span className="font-mono text-[9px] text-dim">{event.page}</span>
        </div>
        <div className="text-[11px] text-[#c8d8d2] truncate">{event.detail}</div>
        <div className="flex items-center gap-2 mt-1 font-mono text-[9px] text-dim">
          <span>{DEVICE_ICONS[event.user.device] || ''}</span>
          <span>
            {event.user.city}, {event.user.country}
          </span>
          <span className="text-[rgba(255,255,255,0.2)]">·</span>
          <span>{timeAgo(event.timestamp)}</span>
        </div>
      </div>
    </div>
  )
}
