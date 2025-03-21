import { useState, useRef } from 'react'
import { LW14_URL } from '~/lib/constants'
import { Check, Copy } from 'lucide-react'
import useConfData from './hooks/use-conf-data'

export default function TicketCopy() {
  const [state] = useConfData()
  const userData = state.userTicketData
  const { username } = userData
  const [copied, setCopied] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const displayUrl = `.../launch-week?referal=${username}`
  const link = `${LW14_URL}?referal=${username}`

  return (
    <button
      type="button"
      name="Copy"
      ref={buttonRef}
      onClick={() => {
        navigator.clipboard.writeText(link).then(() => {
          setCopied(true)
          setTimeout(() => {
            setCopied(false)
          }, 2000)
        })
      }}
      className="font-mono w-full flex-grow px-2 lg:px-3.5 !pr-1 py-1 rounded-md bg-alternative-200 border flex gap-2 relative text-foreground-light hover:text-foreground text-xs pointer-events-auto justify-between items-center hover:border-stronger transition-all max-w-[80vw]"
    >
      <span className="truncate">{displayUrl}</span>
      <div className="w-6 min-w-6 h-6 flex items-center justify-center flex-shrink-0 border border-strong rounded bg-muted hover:bg-selection hover:border-stronger">
        {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={1.5} />}
      </div>
    </button>
  )
}
