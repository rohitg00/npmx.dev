import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { useAtproto } from '~/composables/atproto/useAtproto'

const { mockUseProfileLikes } = vi.hoisted(() => ({
  mockUseProfileLikes: vi.fn(),
}))

mockNuxtImport('useProfileLikes', () => mockUseProfileLikes)

import ProfilePage from '~/pages/profile/[identity]/index.vue'

function createAtprotoUser(handle: string) {
  return {
    did: `did:plc:${handle}`,
    handle,
    pds: 'https://bsky.social',
  }
}

registerEndpoint('/api/social/profile/test-handle', () => ({
  displayName: 'Test User',
  description: '',
  website: '',
  handle: 'test-handle',
  recordExists: false,
}))

describe('Profile invite section', () => {
  beforeEach(() => {
    const { user } = useAtproto()
    user.value = null
    mockUseProfileLikes.mockReset()
  })

  it('does not show invite section while auth is still loading', async () => {
    const { user } = useAtproto()
    user.value = undefined

    mockUseProfileLikes.mockReturnValue({
      data: ref({ records: [] }),
      status: ref('success'),
    })

    const wrapper = await mountSuspended(ProfilePage, {
      route: '/profile/test-handle',
    })

    expect(wrapper.text()).not.toContain("It doesn't look like they're using npmx yet")
  })

  it('shows invite section after auth resolves for non-owner', async () => {
    const { user } = useAtproto()
    user.value = createAtprotoUser('other-user')

    mockUseProfileLikes.mockReturnValue({
      data: ref({ records: [] }),
      status: ref('success'),
    })

    const wrapper = await mountSuspended(ProfilePage, {
      route: '/profile/test-handle',
    })

    expect(wrapper.text()).toContain("It doesn't look like they're using npmx yet")
  })

  it('does not show invite section for profile owner', async () => {
    const { user } = useAtproto()
    user.value = createAtprotoUser('test-handle')

    mockUseProfileLikes.mockReturnValue({
      data: ref({ records: [] }),
      status: ref('success'),
    })

    const wrapper = await mountSuspended(ProfilePage, {
      route: '/profile/test-handle',
    })

    expect(wrapper.text()).not.toContain("It doesn't look like they're using npmx yet")
  })
})
