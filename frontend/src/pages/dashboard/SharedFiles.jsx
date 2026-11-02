import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Link2,
  Copy,
  ExternalLink,
  Trash2,
  RefreshCw,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  File,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowUpRight,
  CalendarDays,
  HardDrive,
  Share2,
  SearchX,
  LoaderCircle,
} from 'lucide-react'

import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { getMyShares, revokeShareLink } from '../../services/ShareService.js'

const formatSize = (bytes = 0) => {
  if (!Number.isFinite(Number(bytes)) || Number(bytes) < 0) return '—'

  const size = Number(bytes)

  if (size < 1024) return `${size} B`
  if (size < 1024 ** 2) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 ** 3) return `${(size / 1024 ** 2).toFixed(1)} MB`

  return `${(size / 1024 ** 3).toFixed(2)} GB`
}

const formatDate = (date) => {
  if (!date) return 'No expiration'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) return 'Unknown'

  return parsedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getFileIcon = (contentType = '') => {
  if (contentType.startsWith('image/')) return FileImage
  if (contentType.startsWith('video/')) return FileVideo
  if (contentType.startsWith('audio/')) return FileAudio
  if (
    contentType.includes('zip') ||
    contentType.includes('compressed') ||
    contentType.includes('archive')
  ) {
    return FileArchive
  }
  if (
    contentType.includes('javascript') ||
    contentType.includes('json') ||
    contentType.includes('html') ||
    contentType.includes('css')
  ) {
    return FileCode
  }
  if (
    contentType.includes('pdf') ||
    contentType.startsWith('text/')
  ) {
    return FileText
  }

  return File
}

const getShareUrl = (share) => {
  if (share.shareUrl) {
    try {
      const url = new URL(share.shareUrl, window.location.origin)

      // Always point the share link to this frontend's origin.
      return `${window.location.origin}${url.pathname}`
    } catch {
      // Fall back to the share token below.
    }
  }

  return `${window.location.origin}/share/${share.shareToken}`
}

const isShareExpired = (share) => {
  if (share.expired) return true
  if (!share.expiresAt) return false

  const expiration = new Date(share.expiresAt).getTime()

  return Number.isFinite(expiration) && expiration < Date.now()
}

function SharedFiles() {
  const [shares, setShares] = useState([])
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [revokingToken, setRevokingToken] = useState(null)
  const [confirmShare, setConfirmShare] = useState(null)

  // Keep this function reference stable. Otherwise, the effect below would
  // run after every render, repeatedly fetching data and flashing the page.
  const loadShares = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await getMyShares()

      // Support an Axios response or a service that returns response.data.
      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : null

      if (!data) {
        console.error('Unexpected shares API response:', response)
        toast.error('Received an unexpected response from the server.')
        return
      }

      const normalizedShares = data.map((share) => ({
        ...share,
        fileName:
          share.fileName ??
          share.originalFilename ??
          share.originalFileName ??
          share.filename ??
          share.name ??
          'Untitled file',
      }))

      setShares(normalizedShares)

      if (isManualRefresh) {
        toast.success('Shared links are up to date.')
      }
    } catch (error) {
      console.error(
        'Failed to load shared files:',
        error.response?.data || error.message
      )
      toast.error('Failed to load shared files.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadShares()
  }, [loadShares])

  const filteredShares = useMemo(() => {
    const query = search.trim().toLowerCase()

    return shares.filter((share) => {
      const fileName = String(
        share.fileName ??
        share.originalFilename ??
        share.originalFileName ??
        share.filename ??
        share.name ??
        ''
      ).toLowerCase()
      const token = (share.shareToken || '').toLowerCase()

      const matchesSearch =
        !query || fileName.includes(query) || token.includes(query)

      const expired = isShareExpired(share)

      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && !expired) ||
        (filter === 'expired' && expired)

      return matchesSearch && matchesFilter
    })
  }, [shares, search, filter])

  const activeCount = shares.filter(
    (share) => !isShareExpired(share)
  ).length

  const expiredCount = shares.length - activeCount

  const copyLink = async (share) => {
    const url = getShareUrl(share)

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Share link copied!')
    } catch {
      // Fallback for browsers where Clipboard API is unavailable.
      try {
        const input = document.createElement('textarea')
        input.value = url
        input.style.position = 'fixed'
        input.style.opacity = '0'

        document.body.appendChild(input)
        input.select()

        const copied = document.execCommand('copy')
        input.remove()

        if (!copied) throw new Error('Copy failed')

        toast.success('Share link copied!')
      } catch {
        toast.error('Unable to copy the link. Please open it and copy manually.')
      }
    }
  }

  const openLink = (share) => {
    if (isShareExpired(share)) {
      toast.error('This share link has expired.')
      return
    }

    window.open(
      getShareUrl(share),
      '_blank',
      'noopener,noreferrer'
    )

    toast('Opening share link in a new tab.', {
      icon: '↗',
      duration: 2500,
    })
  }

  const revokeShare = async (share) => {
    setRevokingToken(share.shareToken)
    const loadingToastId = toast.loading('Revoking share link...')

    try {
      await revokeShareLink(share.shareToken)

      setShares((current) =>
        current.filter((item) => item.shareToken !== share.shareToken)
      )

      toast.success('Share link revoked successfully.', {
        id: loadingToastId,
      })
      setConfirmShare(null)
    } catch (error) {
      console.error('Failed to revoke share:', error)

      toast.error(
        error.response?.data?.message ||
          'Could not revoke this share link.',
        { id: loadingToastId }
      )
    } finally {
      setRevokingToken(null)
    }
  }

  useEffect(() => {
    if (!confirmShare) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !revokingToken) {
        setConfirmShare(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [confirmShare, revokingToken])

  const tabs = [
    { id: 'all', label: 'All links', count: shares.length },
    { id: 'active', label: 'Active', count: activeCount },
    { id: 'expired', label: 'Expired', count: expiredCount },
  ]

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#080d1b] dark:text-slate-100">
      <div className="flex min-h-screen w-full">
        <div className="shrink-0 self-stretch lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:self-start lg:overflow-y-auto [&_aside]:!min-h-screen">
          <Sidebar
            mobileOpen={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />
        </div>

        <div className="min-w-0 flex-1">
          <Navbar
            onMenuClick={() => setMobileSidebarOpen(true)}
            searchValue={search}
            onSearchChange={setSearch}
          />

          <main className="mx-auto w-full max-w-[1400px] min-w-0 px-3 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8 lg:py-8">
            {/* Header */}
           <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <ShieldCheck size={14} />
                  Secure sharing
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Shared Files
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                  Manage your shared links, monitor expiration, and control
                  who can access your files.
                </p>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={() => loadShares(true)}
                  disabled={refreshing || loading}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? 'animate-spin' : ''}
                  />
                  Refresh
                </button>

                <Link
                  to="/dashboard/files"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 sm:w-auto"
                >
                  <Share2 size={16} />
                  My Files
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>

            {/* Statistics */}
           <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                icon={Link2}
                label="Total share links"
                value={shares.length}
                description="Links you've created"
                iconClass="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
              />

              <StatCard
                icon={CheckCircle2}
                label="Active links"
                value={activeCount}
                description="Not past their expiration"
                iconClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              />

              <StatCard
                icon={Clock3}
                label="Expired links"
                value={expiredCount}
                description="No longer accessible"
                iconClass="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
              />
            </div>

            {/* Main panel */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
              <div className="border-b border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Your shared links</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {filteredShares.length} of {shares.length} links
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex w-full min-w-0 items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 sm:w-auto dark:bg-slate-800">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setFilter(tab.id)}
                          className={`min-h-10 flex-1 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-semibold transition sm:flex-none sm:px-3 ${
                            filter === tab.id
                              ? 'bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-indigo-300'
                              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                          }`}
                        >
                          {tab.label}
                          <span className="ml-1.5 opacity-70">
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-72 flex-col items-center justify-center gap-3 p-8">
                  <LoaderCircle
                    size={32}
                    className="animate-spin text-indigo-600"
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Loading your shared files...
                  </p>
                </div>
              ) : shares.length === 0 ? (
                <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    <Share2 size={29} />
                  </div>

                  <h3 className="text-lg font-bold">Nothing shared yet</h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Create a share link from one of your files. Your links
                    will appear here so you can manage access.
                  </p>

                  <Link
                    to="/dashboard/files"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <Share2 size={16} />
                    Go to My Files
                  </Link>
                </div>
              ) : filteredShares.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
                  <SearchX size={32} className="mb-3 text-slate-400" />
                  <h3 className="font-semibold">No matching links</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Try another search term or filter.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch('')
                      setFilter('all')
                    }}
                    className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto xl:block">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
                          <th className="px-6 py-4">File</th>
                          <th className="px-4 py-4">Status</th>
                          <th className="px-4 py-4">Created</th>
                          <th className="px-4 py-4">Expires</th>
                          <th className="px-4 py-4">Size</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredShares.map((share) => (
                          <ShareRow
                            key={share.id || share.shareToken}
                            share={share}
                            onCopy={copyLink}
                            onOpen={openLink}
                            onRevoke={setConfirmShare}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="grid gap-3 p-3 sm:p-4 xl:hidden">
                    {filteredShares.map((share) => (
                      <ShareCard
                        key={share.id || share.shareToken}
                        share={share}
                        onCopy={copyLink}
                        onOpen={openLink}
                        onRevoke={setConfirmShare}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>

            <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck size={14} />
              Only you can manage the share links belonging to your files.
            </p>
          </main>
        </div>
      </div>

      {/* Revoke confirmation */}
      {confirmShare && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !revokingToken) {
              setConfirmShare(null)
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="revoke-dialog-title"
            className="my-auto max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle size={24} />
            </div>

            <h3 id="revoke-dialog-title" className="text-lg font-bold">
              Revoke share link?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Access to{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {confirmShare.fileName || confirmShare.originalFilename || confirmShare.originalFileName || 'this file'}
              </span>{' '}
              through this link will be removed. Anyone using this link will
              no longer be able to access the shared file.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
              <button
                type="button"
                disabled={Boolean(revokingToken)}
                onClick={() => setConfirmShare(null)}
                className="min-h-11 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={Boolean(revokingToken)}
                onClick={() => revokeShare(confirmShare)}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {revokingToken ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Revoke access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, description, iconClass }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-indigo-500/40 dark:hover:shadow-indigo-950/30 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

function FileIdentity({ share }) {
  const Icon = getFileIcon(share.contentType);

  const fileName =
    share.fileName ??
    share.originalFilename ??
    share.originalFileName ??
    share.filename ??
    share.name ??
    "Untitled file";

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
        <Icon size={21} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
          {fileName}
        </p>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {share.contentType || "Unknown file type"}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ share }) {
  const expired = isShareExpired(share)

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        expired
          ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
      }`}
    >
      {expired ? <Clock3 size={12} /> : <CheckCircle2 size={12} />}
      {expired ? 'Expired' : 'Active'}
    </span>
  )
}

function ShareRow({ share, onCopy, onOpen, onRevoke }) {
  return (
    <tr className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
      <td className="max-w-[280px] px-6 py-4">
        <FileIdentity share={share} />
      </td>

      <td className="px-4 py-4">
        <StatusBadge share={share} />
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-2">
          <CalendarDays size={14} />
          {formatDate(share.createdAt)}
        </span>
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
        {share.expiresAt ? formatDate(share.expiresAt) : 'Never'}
      </td>

      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-2">
          <HardDrive size={14} />
          {formatSize(share.fileSize)}
        </span>
      </td>

      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-1.5">
          <ActionButton
            title="Copy share link"
            onClick={() => onCopy(share)}
          >
            <Copy size={16} />
          </ActionButton>

          <ActionButton
            title="Open share link"
            onClick={() => onOpen(share)}
            disabled={isShareExpired(share)}
          >
            <ExternalLink size={16} />
          </ActionButton>

          <ActionButton
            title="Revoke share link"
            onClick={() => onRevoke(share)}
            danger
          >
            <Trash2 size={16} />
          </ActionButton>
        </div>
      </td>
    </tr>
  )
}

function ShareCard({ share, onCopy, onOpen, onRevoke }) {
  return (
    <article className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 dark:border-slate-800 dark:bg-slate-950/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <FileIdentity share={share} />
        </div>

        <StatusBadge share={share} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Created</p>
          <p className="mt-1 text-sm font-medium">
            {formatDate(share.createdAt)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Expires</p>
          <p className="mt-1 text-sm font-medium">
            {share.expiresAt ? formatDate(share.expiresAt) : 'Never'}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">File size</p>
          <p className="mt-1 text-sm font-medium">
            {formatSize(share.fileSize)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">File type</p>
          <p className="mt-1 truncate text-sm font-medium">
            {share.contentType || 'Unknown'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onCopy(share)}
          className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2.5 text-xs font-semibold transition hover:bg-slate-50 sm:px-3 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <Copy size={14} />
          Copy link
        </button>

        <button
          type="button"
          onClick={() => onOpen(share)}
          disabled={isShareExpired(share)}
          className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-2.5 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3"
        >
          <ExternalLink size={14} />
          Open
        </button>

        <button
          type="button"
          onClick={() => onRevoke(share)}
          aria-label="Revoke share link"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  )
}

function ActionButton({ children, title, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 w-10 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? 'border-red-100 text-red-500 hover:border-red-200 hover:bg-red-50 dark:border-red-500/10 dark:text-red-400 dark:hover:bg-red-500/10'
          : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300'
      }`}
    >
      {children}
    </button>
  )
}

export default SharedFiles