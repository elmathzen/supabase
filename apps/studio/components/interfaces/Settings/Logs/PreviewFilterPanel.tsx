import { Eye, EyeOff, RefreshCw, Search, Terminal, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { useParams } from 'common'
import { ButtonTooltip } from 'components/ui/ButtonTooltip'
import CSVButton from 'components/ui/CSVButton'
import DatabaseSelector from 'components/ui/DatabaseSelector'
import { useLoadBalancersQuery } from 'data/read-replicas/load-balancers-query'
import { Button, Input, Tooltip, TooltipContent, TooltipTrigger, cn } from 'ui'
import { DatePickerValue, LogsDatePicker } from './Logs.DatePickers'
import {
  FILTER_OPTIONS,
  LOG_ROUTES_WITH_REPLICA_SUPPORT,
  LogsTableName,
  PREVIEWER_DATEPICKER_HELPERS,
} from './Logs.constants'
import type { Filters, LogSearchCallback, LogTemplate } from './Logs.types'
import LogsFilterPopover from './LogsFilterPopover'
import dayjs from 'dayjs'

interface PreviewFilterPanelProps {
  defaultSearchValue?: string
  defaultToValue?: string
  defaultFromValue?: string
  templates?: any
  isLoading: boolean
  newCount: number
  onRefresh?: () => void
  onSearch?: LogSearchCallback
  onExploreClick?: () => void
  queryUrl: string
  onSelectTemplate: (template: LogTemplate) => void
  table: LogsTableName
  condensedLayout: Boolean
  isShowingEventChart: boolean
  onToggleEventChart: () => void
  csvData?: unknown[]
  onFiltersChange: (filters: Filters) => void
  filters: Filters
  onSelectedDatabaseChange: (id: string) => void
  className?: string
}

/**
 * Logs control panel header + wrapper
 */
const PreviewFilterPanel = ({
  isLoading,
  newCount,
  onRefresh,
  onSearch = () => {},
  defaultSearchValue = '',
  onExploreClick,
  queryUrl,
  condensedLayout,
  isShowingEventChart,
  onToggleEventChart,
  csvData,
  onFiltersChange,
  filters,
  table,
  onSelectedDatabaseChange,
  className,
}: PreviewFilterPanelProps) => {
  const router = useRouter()
  const { ref } = useParams()
  const [search, setSearch] = useState('')

  const { data: loadBalancers } = useLoadBalancersQuery({ projectRef: ref })

  // [Joshen] These are the routes tested that can show replica logs
  const showDatabaseSelector = LOG_ROUTES_WITH_REPLICA_SUPPORT.includes(router.pathname)

  const hasEdits = search !== defaultSearchValue

  // Sync local state with provided default value
  useEffect(() => {
    if (search !== defaultSearchValue) {
      setSearch(defaultSearchValue)
    }
  }, [defaultSearchValue])

  const RefreshButton = () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          title="refresh"
          type="default"
          className="px-1.5"
          icon={
            <div className="relative">
              {newCount > 0 && (
                <div className="absolute -top-3 right-3 flex items-center justify-center">
                  <div className="absolute z-20">
                    <p style={{ fontSize: '0.6rem' }} className="text-white">
                      {newCount > 1000 ? `${Math.floor(newCount / 100) / 10}K` : newCount}
                    </p>
                  </div>
                  <div className="h-4 w-4 animate-ping rounded-full bg-green-800 opacity-60"></div>
                  <div className="z-60 absolute top-0 right-0 h-full w-full rounded-full bg-green-900 opacity-80"></div>
                </div>
              )}
              <RefreshCw />
            </div>
          }
          loading={isLoading}
          disabled={isLoading}
          onClick={onRefresh}
        />
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        Refresh logs
      </TooltipContent>
    </Tooltip>
  )

  function getDefaultDatePickerValue() {
    // if we have values in the URL, use them
    const iso_timestamp_start = router.query.iso_timestamp_start as string
    const iso_timestamp_end = router.query.iso_timestamp_end as string
    if (iso_timestamp_start && iso_timestamp_end) {
      return {
        to: iso_timestamp_end,
        from: iso_timestamp_start,
        text: `${dayjs(iso_timestamp_start).format('DD MMM, HH:mm')} - ${dayjs(iso_timestamp_end).format('DD MMM, HH:mm')}`,
        isHelper: false,
      }
    }
    return {
      to: PREVIEWER_DATEPICKER_HELPERS[2].calcTo(),
      from: PREVIEWER_DATEPICKER_HELPERS[2].calcFrom(),
      text: 'Last hour',
      isHelper: true,
    }
  }

  const [selectedDatePickerValue, setSelectedDatePickerValue] = useState<DatePickerValue>(
    getDefaultDatePickerValue()
  )

  const handleInputSearch = (query: string) => onSearch('search-input-change', { query })

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between',
        condensedLayout ? ' p-3' : '',
        className
      )}
    >
      <div className="flex flex-row items-center gap-x-2">
        <form
          id="log-panel-search"
          onSubmit={(e) => {
            // prevent redirection
            e.preventDefault()
            handleInputSearch(search)
          }}
        >
          <Input
            className="w-60"
            size="tiny"
            placeholder="Search events"
            onChange={(e) => setSearch(e.target.value)}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              setSearch(e.target.value)
              handleInputSearch(e.target.value)
            }}
            icon={
              <div className="text-foreground-lighter">
                <Search size={14} />
              </div>
            }
            value={search}
            actions={
              <div className="flex items-center gap-x-1 mr-0.5">
                {hasEdits && (
                  <ButtonTooltip
                    icon={<span>↲</span>}
                    type="text"
                    className="px-1 h-[20px]"
                    onClick={() => handleInputSearch(search)}
                    tooltip={{ content: { side: 'bottom', text: 'Search for events' } }}
                  />
                )}

                {search.length > 0 && (
                  <ButtonTooltip
                    icon={<X />}
                    type="text"
                    className="p-[1px] h-[20px]"
                    onClick={() => handleInputSearch('')}
                    tooltip={{ content: { side: 'bottom', text: 'Clear search' } }}
                  />
                )}
              </div>
            }
          />
        </form>

        <RefreshButton />
        <LogsDatePicker
          helpers={PREVIEWER_DATEPICKER_HELPERS}
          onSubmit={(vals) => {
            onSearch('datepicker-change', { to: vals.to, from: vals.from })
            setSelectedDatePickerValue(vals)
          }}
          value={selectedDatePickerValue}
        />

        {FILTER_OPTIONS[table] !== undefined && (
          <div className="flex items-center">
            {FILTER_OPTIONS[table] &&
              Object.values(FILTER_OPTIONS[table]).map((x, i: number) => {
                const classes = []

                if (Object.values(FILTER_OPTIONS[table]).length >= 2) {
                  if (i === 0) {
                    classes.push('rounded-tr-none rounded-br-none')
                  } else if (i === Object.values(FILTER_OPTIONS[table]).length - 1) {
                    classes.push('rounded-tl-none rounded-bl-none')
                  } else {
                    classes.push('rounded-none')
                  }
                }

                return (
                  <LogsFilterPopover
                    buttonClassName={classes.join(' ')}
                    key={`${x.key}-filter`}
                    options={x}
                    onFiltersChange={onFiltersChange}
                    filters={filters}
                  />
                )
              })}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button
            type="default"
            onClick={() => onToggleEventChart()}
            icon={isShowingEventChart ? <Eye /> : <EyeOff />}
          >
            Chart
          </Button>
        </div>
        <CSVButton data={csvData} disabled={!Boolean(csvData)} title="Download data" />
      </div>

      {showDatabaseSelector ? (
        <div className="flex items-center justify-center gap-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild className="px-1.5" type="default" icon={<Terminal />}>
                <Link href={queryUrl} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Open query in Logs Explorer
            </TooltipContent>
          </Tooltip>
          <DatabaseSelector
            onSelectId={onSelectedDatabaseChange}
            additionalOptions={
              table === LogsTableName.EDGE
                ? (loadBalancers ?? []).length > 0
                  ? [{ id: `${ref}-all`, name: 'API Load Balancer' }]
                  : []
                : []
            }
          />
        </div>
      ) : (
        <Button asChild type="default" onClick={onExploreClick}>
          <Link href={queryUrl}>Explore via query</Link>
        </Button>
      )}
    </div>
  )
}

export default PreviewFilterPanel
