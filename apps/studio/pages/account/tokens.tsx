import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import {
  AccessTokenList,
  NewAccessTokenButton,
  NewTokenBanner,
} from 'components/interfaces/Account'
import AccountLayout from 'components/layouts/AccountLayout/account-layout'
import { FormHeader } from 'components/ui/Forms/FormHeader'
import { NewAccessToken } from 'data/access-tokens/access-tokens-create-mutation'
import type { NextPageWithLayout } from 'types'
import { Button } from 'ui'
import { Admonition } from 'ui-patterns'
import AppLayout from 'components/layouts/AppLayout/AppLayout'
import DefaultLayout from 'components/layouts/DefaultLayout'
import AccountSettingsLayout from 'components/layouts/AccountLayout/account-settings-layout'

const UserAccessTokens: NextPageWithLayout = () => {
  const [newToken, setNewToken] = useState<NewAccessToken | undefined>()

  return (
    <>
      <div>
        <FormHeader
          title="Access Tokens"
          description="Personal access tokens can be used with our Management API or CLI."
        />
      </div>
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <Button asChild type="default" icon={<ExternalLink strokeWidth={1.5} />}>
            <Link
              href="https://supabase.com/docs/reference/api/introduction"
              target="_blank"
              rel="noreferrer"
            >
              API Docs
            </Link>
          </Button>
          <Button asChild type="default" icon={<ExternalLink strokeWidth={1.5} />}>
            <Link
              href="https://supabase.com/docs/reference/cli/start"
              target="_blank"
              rel="noreferrer"
            >
              CLI docs
            </Link>
          </Button>
        </div>
        <NewAccessTokenButton onCreateToken={setNewToken} />
      </div>

      <div className="flex items-center justify-between">
        <Admonition
          type="warning"
          title="Personal access tokens can be used to control your whole account and use features added in the future. Be careful when sharing them!"
          className="mb-6 w-full"
        />
      </div>
      <div className="space-y-4">
        {newToken && <NewTokenBanner token={newToken} />}
        <AccessTokenList />
      </div>
    </>
  )
}

UserAccessTokens.getLayout = (page) => (
  <AppLayout>
    <DefaultLayout headerTitle="Account">
      <AccountLayout
        title="Access Tokens"
        breadcrumbs={[{ key: 'supabase-account-tokens', label: 'Access Tokens' }]}
      >
        <AccountSettingsLayout>{page}</AccountSettingsLayout>
      </AccountLayout>
    </DefaultLayout>
  </AppLayout>
)

export default UserAccessTokens
