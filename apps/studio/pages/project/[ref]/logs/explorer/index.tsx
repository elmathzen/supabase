import { useParams } from 'common/hooks'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { IS_PLATFORM } from 'common'
import {
  Button,
  Form,
  Input,
  Modal,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from 'ui'

import { useLocalStorage } from '@uidotdev/usehooks'
import {
  LOGS_LARGE_DATE_RANGE_DAYS_THRESHOLD,
  LOGS_TABLES,
  TEMPLATES,
} from 'components/interfaces/Settings/Logs/Logs.constants'
import {
  DatePickerToFrom,
  LogTemplate,
  LogsWarning,
} from 'components/interfaces/Settings/Logs/Logs.types'
import {
  maybeShowUpgradePrompt,
  useEditorHints,
} from 'components/interfaces/Settings/Logs/Logs.utils'
import LogsQueryPanel, { SourceType } from 'components/interfaces/Settings/Logs/LogsQueryPanel'
import LogTable from 'components/interfaces/Settings/Logs/LogTable'
import UpgradePrompt from 'components/interfaces/Settings/Logs/UpgradePrompt'
import { createWarehouseQueryTemplates } from 'components/interfaces/Settings/Logs/Warehouse.utils'
import LogsLayout from 'components/layouts/LogsLayout/LogsLayout'
import CodeEditor from 'components/ui/CodeEditor/CodeEditor'
import LoadingOpacity from 'components/ui/LoadingOpacity'
import ShimmerLine from 'components/ui/ShimmerLine'
import { useWarehouseCollectionsQuery } from 'data/analytics/warehouse-collections-query'
import { useWarehouseQueryQuery } from 'data/analytics/warehouse-query'
import { useContentQuery } from 'data/content/content-query'
import {
  UpsertContentPayload,
  useContentUpsertMutation,
} from 'data/content/content-upsert-mutation'
import { useOrgSubscriptionQuery } from 'data/subscriptions/org-subscription-query'
import useLogsQuery from 'hooks/analytics/useLogsQuery'
import { useSelectedOrganization } from 'hooks/misc/useSelectedOrganization'
import { useUpgradePrompt } from 'hooks/misc/useUpgradePrompt'
import { LOCAL_STORAGE_KEYS } from 'lib/constants'
import { uuidv4 } from 'lib/helpers'
import { useProfile } from 'lib/profile'
import type { LogSqlSnippets, NextPageWithLayout } from 'types'

const PLACEHOLDER_WAREHOUSE_QUERY =
  '-- Fetch the last 10 logs in the last 7 days \nselect id, timestamp, event_message from `COLLECTION_NAME` \nwhere timestamp > timestamp_sub(current_timestamp(), interval 7 day) \norder by timestamp desc limit 10'
const LOCAL_PLACEHOLDER_QUERY =
  'select\n  timestamp, event_message, metadata\n  from edge_logs limit 5'

const PLATFORM_PLACEHOLDER_QUERY =
  'select\n  cast(timestamp as datetime) as timestamp,\n  event_message, metadata \nfrom edge_logs \nlimit 5'

const PLACEHOLDER_QUERY = IS_PLATFORM ? PLATFORM_PLACEHOLDER_QUERY : LOCAL_PLACEHOLDER_QUERY

export const LogsExplorerPage: NextPageWithLayout = () => {
  useEditorHints()
  const router = useRouter()
  const { profile } = useProfile()
  const { ref, q, ite, its, queryId, source: routerSource } = useParams()
  const projectRef = ref as string
  const organization = useSelectedOrganization()

  const [editorId, setEditorId] = useState<string>(uuidv4())
  const [warehouseEditorId, setWarehouseEditorId] = useState<string>(uuidv4())
  const [editorValue, setEditorValue] = useState<string>(PLACEHOLDER_QUERY)
  const [warehouseEditorValue, setWarehouseEditorValue] = useState<string>(
    PLACEHOLDER_WAREHOUSE_QUERY
  )
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false)
  const [warnings, setWarnings] = useState<LogsWarning[]>([])
  const [sourceType, setSourceType] = useState<SourceType>((routerSource as SourceType) || 'logs')
  const [selectedLog, setSelectedLog] = useState<any>(null)

  const [recentLogs, setRecentLogs] = useLocalStorage<LogSqlSnippets.Content[]>(
    `project-content-${projectRef}-recent-log-sql`,
    []
  )

  const { data: content } = useContentQuery({
    projectRef: ref,
    type: 'log_sql',
  })
  const query = content?.content.find((x) => x.id === queryId)

  const { data: subscription } = useOrgSubscriptionQuery({ orgSlug: organization?.slug })
  const {
    params,
    logData,
    error,
    isLoading: logsLoading,
    changeQuery,
    runQuery,
    setParams,
  } = useLogsQuery(
    projectRef,
    {
      iso_timestamp_start: its ? (its as string) : undefined,
      iso_timestamp_end: ite ? (ite as string) : undefined,
    },
    sourceType === 'logs'
  )

  const {
    refetch: runWarehouseQuery,
    data: warehouseResults,
    isFetching: warehouseFetching,
    error: warehouseError,
  } = useWarehouseQueryQuery(
    { ref: projectRef, sql: warehouseEditorValue },
    {
      enabled: false,
    }
  )
  const results = sourceType === 'warehouse' ? warehouseResults?.result : logData
  const isLoading = logsLoading || warehouseFetching

  const { data: warehouseCollections } = useWarehouseCollectionsQuery({ projectRef })

  const { mutate: upsertContent, isLoading: isUpsertingContent } = useContentUpsertMutation({
    onError: (e) => {
      const error = e as { message: string }
      console.error(error)
      setSaveModalOpen(false)
      if (queryId) {
        toast.error(`Failed to update query: ${error.message}`)
      } else {
        toast.error(`Failed to save query: ${error.message}`)
      }
    },
    onSuccess: (_data, vars) => {
      setSaveModalOpen(false)
      if (queryId) {
        toast.success(`Updated "${vars.payload.name}" log query`)
      } else {
        toast.success(`Saved "${vars.payload.name}" log query`)
      }
    },
  })

  const addRecentLogSqlSnippet = (snippet: Partial<LogSqlSnippets.Content>) => {
    const defaults: LogSqlSnippets.Content = {
      schema_version: '1',
      favorite: false,
      sql: '',
      content_id: '',
    }
    setRecentLogs([...recentLogs, { ...defaults, ...snippet }])
  }

  const { showUpgradePrompt, setShowUpgradePrompt } = useUpgradePrompt(
    params.iso_timestamp_start as string
  )

  const onSelectTemplate = (template: LogTemplate) => {
    setEditorValue(template.searchString)
    changeQuery(template.searchString)
    setEditorId(uuidv4())
    router.push({
      pathname: router.pathname,
      query: { ...router.query, q: template.searchString },
    })
    addRecentLogSqlSnippet({ sql: template.searchString })
  }

  const handleRun = (value?: string | React.MouseEvent<HTMLButtonElement>) => {
    const query = typeof value === 'string' ? value || editorValue : editorValue

    if (value && typeof value === 'string') {
      setEditorValue(value)
    }

    if (sourceType === 'warehouse') {
      const whQuery = warehouseEditorValue

      if (!warehouseCollections?.length) {
        toast.error('You do not have any collections yet.')
        return
      }

      // Check that a collection name is included in the query
      const collectionNames = warehouseCollections?.map((collection) => collection.name)
      const collectionExists = collectionNames?.find((collectionName) =>
        whQuery.includes(collectionName)
      )

      if (!collectionExists) {
        toast.error('Please specify a collection name in the query')
        return
      }

      // Check that the user is not trying to query logs tables and warehouse collections at the same time
      const logsSources = Object.values(LOGS_TABLES)
      const logsSourceExists = logsSources.find((source) => whQuery.includes(source))

      if (logsSourceExists) {
        return toast.error('Cannot query logs tables from current query.')
      }

      runWarehouseQuery()
      return router.push({
        pathname: router.pathname,
        query: { ...router.query, q: query },
      })
    }

    changeQuery(query)
    runQuery()
    router.push({
      pathname: router.pathname,
      query: { ...router.query, q: query },
    })
    addRecentLogSqlSnippet({ sql: query })
  }

  const handleInsertSource = (source: string) => {
    if (sourceType === 'warehouse') {
      //TODO: Only one collection can be queried at a time, we need to replace the current collection from the query for the new one
      return setWarehouseEditorId(uuidv4())
    }

    setEditorValue((prev) => {
      const index = prev.indexOf('from')
      if (index === -1) return `${prev}${source}`
      return `${prev.substring(0, index + 4)} ${source} ${prev.substring(index + 5)}`
    })
    setEditorId(uuidv4())
  }

  const handleCreateQuery = async (values: any, { setSubmitting }: any) => {
    if (!projectRef) return console.error('Project ref is required')
    if (!profile) return console.error('Profile is required')
    setSubmitting(true)

    const id = uuidv4()
    const payload: UpsertContentPayload = {
      id,
      name: values.name,
      description: values.description || '',
      type: 'log_sql' as const,
      content: {
        content_id: editorId,
        sql: editorValue,
        schema_version: '1',
        favorite: false,
      } as LogSqlSnippets.Content,
      owner_id: profile.id,
      visibility: 'user' as const,
    }
    upsertContent(
      { projectRef, payload },
      {
        onSuccess: () => router.push(`/project/${projectRef}/logs/explorer?queryId=${id}`),
      }
    )
  }

  function handleOnSave() {
    if (!projectRef) return console.error('Project ref is required')

    // if we have a queryId, we are editing a saved query
    if (queryId && query) {
      upsertContent({
        projectRef: projectRef!,
        payload: {
          ...query,
          content: { ...(query.content as LogSqlSnippets.Content), sql: editorValue },
        },
      })

      return
    }

    setSaveModalOpen(!saveModalOpen)
  }

  const handleDateChange = ({ to, from }: DatePickerToFrom) => {
    const shouldShowUpgradePrompt = maybeShowUpgradePrompt(from, subscription?.plan?.id)

    if (shouldShowUpgradePrompt) {
      setShowUpgradePrompt(!showUpgradePrompt)
    } else {
      setParams((prev) => ({
        ...prev,
        iso_timestamp_start: from || '',
        iso_timestamp_end: to || '',
      }))
      router.push({
        pathname: router.pathname,
        query: { ...router.query, its: from || '', ite: to || '' },
      })
    }
  }

  useEffect(() => {
    if (warehouseError) toast.error(warehouseError.message)
  }, [warehouseError])

  useEffect(() => {
    // on mount, set initial values
    if (q) {
      onSelectTemplate({
        mode: 'custom',
        searchString: q,
      })
      setWarehouseEditorValue(q)
    }
  }, [q])

  useEffect(() => {
    let newWarnings = []
    const start = params.iso_timestamp_start ? dayjs(params.iso_timestamp_start) : dayjs()
    const end = params.iso_timestamp_end ? dayjs(params.iso_timestamp_end) : dayjs()
    const daysDiff = Math.abs(start.diff(end, 'days'))
    if (
      editorValue &&
      !editorValue.includes('limit') &&
      daysDiff > LOGS_LARGE_DATE_RANGE_DAYS_THRESHOLD
    ) {
      newWarnings.push({ text: 'When querying large date ranges, include a LIMIT clause.' })
    }
    setWarnings(newWarnings)
  }, [editorValue, params.iso_timestamp_start, params.iso_timestamp_end])

  // Show the prompt on page load based on query params
  useEffect(() => {
    if (its) {
      const shouldShowUpgradePrompt = maybeShowUpgradePrompt(its as string, subscription?.plan?.id)
      if (shouldShowUpgradePrompt) {
        setShowUpgradePrompt(!showUpgradePrompt)
      }
    }
  }, [its, subscription])

  return (
    <div className="w-full h-full mx-auto">
      <ResizablePanelGroup
        className="w-full h-full max-h-screen"
        direction="vertical"
        autoSaveId={LOCAL_STORAGE_KEYS.LOG_EXPLORER_SPLIT_SIZE}
      >
        <ResizablePanel collapsible minSize={5}>
          <LogsQueryPanel
            defaultFrom={params.iso_timestamp_start || ''}
            defaultTo={params.iso_timestamp_end || ''}
            onDateChange={handleDateChange}
            onSelectSource={handleInsertSource}
            templates={TEMPLATES.filter((template) => template.mode === 'custom')}
            warehouseCollections={warehouseCollections || []}
            onSelectTemplate={onSelectTemplate}
            warehouseTemplates={createWarehouseQueryTemplates(warehouseCollections || [])}
            onSelectWarehouseTemplate={(template) => {
              setWarehouseEditorValue(template.query)
              setWarehouseEditorId(uuidv4())
            }}
            warnings={warnings}
            dataSource={sourceType}
            onDataSourceChange={(srcType) => {
              setSourceType(srcType)
              router.push({
                pathname: router.pathname,
                query: { ...router.query, source: srcType },
              })
            }}
          />

          <ShimmerLine active={isLoading} />
          {sourceType === 'warehouse' ? (
            <CodeEditor
              id={warehouseEditorId}
              language="pgsql" // its bq sql but monaco doesn't have a language for it
              defaultValue={warehouseEditorValue}
              onInputChange={(v) => setWarehouseEditorValue(v || '')}
              actions={{ runQuery: { enabled: true, callback: handleRun } }}
            />
          ) : (
            <CodeEditor
              id={editorId}
              language="pgsql"
              defaultValue={editorValue}
              onInputChange={(v) => setEditorValue(v || '')}
              actions={{ runQuery: { enabled: true, callback: handleRun } }}
            />
          )}
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel collapsible minSize={5} className="overflow-auto">
          <LoadingOpacity active={isLoading}>
            <LogTable
              isSaving={isUpsertingContent}
              showHistogramToggle={false}
              onRun={handleRun}
              onSave={handleOnSave}
              hasEditorValue={Boolean(editorValue)}
              data={results}
              error={error}
              projectRef={projectRef}
              onSelectedLogChange={setSelectedLog}
              selectedLog={selectedLog}
            />

            <div className="flex flex-row justify-end mt-2">
              <UpgradePrompt show={showUpgradePrompt} setShowUpgradePrompt={setShowUpgradePrompt} />
            </div>
          </LoadingOpacity>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Modal
        size="medium"
        onCancel={() => setSaveModalOpen(!saveModalOpen)}
        header="Save log query"
        visible={saveModalOpen}
        hideFooter
      >
        <Form
          initialValues={{
            name: '',
            desdcription: '',
          }}
          onSubmit={handleCreateQuery}
        >
          {() => (
            <>
              <Modal.Content className="space-y-6">
                <Input layout="horizontal" label="Name" id="name" />
                <div className="text-area-text-sm">
                  <Input.TextArea
                    layout="horizontal"
                    labelOptional="Optional"
                    label="Description"
                    id="description"
                    rows={2}
                  />
                </div>
              </Modal.Content>
              <Modal.Separator />
              <Modal.Content className="flex items-center justify-end gap-2">
                <Button size="tiny" type="default" onClick={() => setSaveModalOpen(!saveModalOpen)}>
                  Cancel
                </Button>
                <Button
                  size="tiny"
                  loading={isUpsertingContent}
                  disabled={isUpsertingContent}
                  htmlType="submit"
                >
                  Save
                </Button>
              </Modal.Content>
            </>
          )}
        </Form>
      </Modal>
    </div>
  )
}

LogsExplorerPage.getLayout = (page) => <LogsLayout>{page}</LogsLayout>

export default LogsExplorerPage
