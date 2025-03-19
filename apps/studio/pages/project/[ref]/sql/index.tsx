import { useParams } from 'common'
import { useIsSQLEditorTabsEnabled } from 'components/interfaces/App/FeaturePreview/FeaturePreviewContext'
import DefaultLayout from 'components/layouts/DefaultLayout'
import { EditorBaseLayout } from 'components/layouts/editors/EditorBaseLayout'
import SQLEditorLayout from 'components/layouts/SQLEditorLayout/SQLEditorLayout'
import { SQLEditorMenu } from 'components/layouts/SQLEditorLayout/SQLEditorMenu'
import { NewTab } from 'components/layouts/Tabs/NewTab'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { getTabsStore } from 'state/tabs'
import type { NextPageWithLayout } from 'types'

const TableEditorPage: NextPageWithLayout = () => {
  const { ref: projectRef } = useParams()
  const store = getTabsStore(projectRef)
  const router = useRouter()

  // handle Tabs preview logic
  // handle redirect to last table tab
  const lastTabId = store.openTabs.find((id) => store.tabsMap[id]?.type === 'sql')
  if (lastTabId) {
    const lastTab = store.tabsMap[lastTabId]
    if (lastTab) {
      router.push(`/project/${projectRef}/sql/${lastTab.id.replace('sql-', '')}`)
    }
  }

  // redirect to /new if not using tabs
  const isSqlEditorTabsEnabled = useIsSQLEditorTabsEnabled()

  useEffect(() => {
    if (isSqlEditorTabsEnabled !== undefined && !isSqlEditorTabsEnabled) {
      router.push(`/project/${projectRef}/sql/new`)
    }
  }, [isSqlEditorTabsEnabled])

  return <NewTab />
}

TableEditorPage.getLayout = (page) => (
  <DefaultLayout>
    <EditorBaseLayout productMenu={<SQLEditorMenu />} product="SQL Editor">
      <SQLEditorLayout>{page}</SQLEditorLayout>
    </EditorBaseLayout>
  </DefaultLayout>
)

export default TableEditorPage
