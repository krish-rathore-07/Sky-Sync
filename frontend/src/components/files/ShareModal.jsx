import { useEffect, useRef, useState } from 'react'
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  LoaderCircle,
  Share2,
  Trash2,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

import {
  createShareLink,
  revokeShareLink,
} from '../../services/ShareService.js'

function ShareModal({ file, onClose }) {
  const [loading, setLoading] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [shareData, setShareData] = useState(null)
  const copyTimerRef = useRef(null)

  const fileName =
    file?.originalFileName ||
    file?.originalFilename ||
    file?.fileName ||
    file?.filename ||
    file?.name ||
    'Untitled file'

  const fileId = file?.id || file?.fileId

  // Reset modal-specific state when a different file is selected.
  useEffect(() => {
    setShareData(null)
    setCopied(false)
    setConfirmRevoke(false)

    if (copyTimerRef.current) {
      window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = null
    }
  }, [file])

  // Prevent the page behind the dialog from scrolling. Escape closes the
  // dialog only when no request is running.
  useEffect(() => {
    if (!file) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loading && !revoking) {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [file, loading, revoking, onClose])

  // Clear the copied-label timer if the modal is closed or unmounted.
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current)
      }
    }
  }, [])

  if (!file) return null

  const getToken = () =>
    shareData?.token ||
    shareData?.shareToken ||
    shareData?.publicToken ||
    shareData?.share?.token ||
    ''

  const getExistingUrl = () =>
    shareData?.shareUrl ||
    shareData?.url ||
    shareData?.publicUrl ||
    shareData?.share?.shareUrl ||
    ''

  const token = getToken()
  const existingUrl = getExistingUrl()
  const shareUrl =
    existingUrl ||
    (token ? `${window.location.origin}/share/${token}` : '')

  const handleCreateShare = async () => {
    if (!fileId) {
      toast.error('Unable to identify this file.')
      return
    }

    const loadingToastId = toast.loading('Creating your share link...')

    try {
      setLoading(true)
      const data = await createShareLink(fileId)
      setShareData(data)
      setConfirmRevoke(false)

      toast.success('Share link created successfully.', {
        id: loadingToastId,
      })
    } catch (error) {
      console.error('Failed to create share link:', error)

      const responseData = error?.response?.data
      const message =
        (typeof responseData === 'string' && responseData) ||
        responseData?.message ||
        'Unable to create the share link. Please try again.'

      toast.error(message, { id: loadingToastId })
    } finally {
      setLoading(false)
    }
  }

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return
    }

    // Fallback for browsers without the Clipboard API (or non-secure contexts).
    const input = document.createElement('textarea')
    input.value = value
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.opacity = '0'
    input.style.pointerEvents = 'none'

    document.body.appendChild(input)
    input.select()
    input.setSelectionRange(0, input.value.length)

    const copiedSuccessfully = document.execCommand('copy')
    input.remove()

    if (!copiedSuccessfully) {
      throw new Error('Clipboard copy was not successful.')
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) {
      toast.error('Create a share link before copying it.')
      return
    }

    try {
      await copyText(shareUrl)
      setCopied(true)

      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current)
      }

      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false)
        copyTimerRef.current = null
      }, 2000)

      toast.success('Share link copied to clipboard.')
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('Unable to copy the link. Please copy it manually.')
    }
  }

  const handleOpenLink = () => {
    if (!shareUrl) {
      toast.error('The share link is not available yet.')
      return
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer')
    toast('Opening the shared link in a new tab.', {
      icon: '↗',
      duration: 2500,
    })
  }

  const handleRevoke = async () => {
    if (!token) {
      toast.error('Share token is unavailable.')
      return
    }

    const loadingToastId = toast.loading('Revoking share link...')

    try {
      setRevoking(true)
      await revokeShareLink(token)
      setShareData(null)
      setConfirmRevoke(false)
      setCopied(false)

      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current)
        copyTimerRef.current = null
      }

      toast.success('Share link revoked. It can no longer be used.', {
        id: loadingToastId,
      })
    } catch (error) {
      console.error('Failed to revoke share:', error)

      const responseData = error?.response?.data
      const message =
        (typeof responseData === 'string' && responseData) ||
        responseData?.message ||
        'Unable to revoke the share link. Please try again.'

      toast.error(message, { id: loadingToastId })
    } finally {
      setRevoking(false)
    }
  }

  const busy = loading || revoking

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto overscroll-contain bg-slate-950/60 p-2 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose?.()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        aria-describedby="share-modal-description"
        className="mb-[env(safe-area-inset-bottom)] flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:mb-0 dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 p-4 sm:p-6 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
              <Share2 size={20} />
            </div>

            <div className="min-w-0">
              <h2
                id="share-modal-title"
                className="text-base font-semibold text-slate-900 dark:text-white"
              >
                Share file
              </h2>
              <p className="mt-1 max-w-[min(65vw,340px)] truncate text-xs text-slate-500 dark:text-slate-400">
                {fileName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close share dialog"
          >
            <X size={18} />
          </button>
        </header>

        {/* Scrollable content */}
        <div
          id="share-modal-description"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6"
        >
          {!shareUrl ? (
            <>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center sm:p-6 dark:border-slate-700 dark:bg-slate-950/50">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                  <Link2 size={25} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Create a secure sharing link
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Anyone with the generated link will be able to access this
                  file without signing in. Only share the link with people you
                  trust.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCreateShare}
                disabled={loading || !fileId}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Creating link...
                  </>
                ) : (
                  <>
                    <Link2 size={18} />
                    Create share link
                  </>
                )}
              </button>
              {!fileId && (
                <p className="mt-2 text-center text-xs text-red-500">
                  This file is missing an ID, so a share link cannot be created.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    <Check size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      Share link is ready
                    </p>
                    <p className="mt-1 text-xs leading-5 text-emerald-700/80 dark:text-emerald-400/80">
                      Anyone with this link can access the shared file.
                    </p>
                  </div>
                </div>
              </div>

              <label
                htmlFor="share-link-value"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Share link
              </label>

              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-950">
                <input
                  id="share-link-value"
                  type="text"
                  readOnly
                  value={shareUrl}
                  onFocus={(event) => event.target.select()}
                  className="min-h-10 min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-600 outline-none dark:text-slate-300"
                  aria-label="Generated share link"
                />

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 text-xs font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleOpenLink}
                className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ExternalLink size={17} />
                Open shared link
              </button>

              <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
                {!confirmRevoke ? (
                  <button
                    type="button"
                    onClick={() => setConfirmRevoke(true)}
                    disabled={revoking}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/20"
                  >
                    <Trash2 size={17} />
                    Revoke share link
                  </button>
                ) : (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/20">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                      Revoke this link?
                    </p>
                    <p className="mt-1 text-xs leading-5 text-red-700/80 dark:text-red-300/80">
                      Anyone using this link will lose access to the file.
                      This cannot be undone.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmRevoke(false)}
                        disabled={revoking}
                        className="min-h-11 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:bg-slate-900 dark:text-slate-200"
                      >
                        Keep link
                      </button>
                      <button
                        type="button"
                        onClick={handleRevoke}
                        disabled={revoking}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {revoking ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        {revoking ? 'Revoking...' : 'Confirm revoke'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default ShareModal
