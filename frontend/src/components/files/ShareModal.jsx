import { useEffect, useState } from 'react'
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

function ShareModal({
  file,
  onClose,
}) {
  const [loading, setLoading] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [copied, setCopied] = useState(false)

  const [shareData, setShareData] = useState(null)

  const fileName =
    file?.fileName ||
    file?.filename ||
    file?.name ||
    'Untitled file'

  const fileId =
    file?.id ||
    file?.fileId

  useEffect(() => {
    setShareData(null)
    setCopied(false)
  }, [file])

  if (!file) {
    return null
  }

  const getToken = () => {
    return (
      shareData?.token ||
      shareData?.shareToken ||
      shareData?.publicToken ||
      shareData?.share?.token ||
      ''
    )
  }

  const getExistingUrl = () => {
    return (
      shareData?.shareUrl ||
      shareData?.url ||
      shareData?.publicUrl ||
      shareData?.share?.shareUrl ||
      ''
    )
  }

  const token = getToken()

  const existingUrl = getExistingUrl()

  const shareUrl =
    existingUrl ||
    (token
      ? `${window.location.origin}/share/${token}`
      : '')

  const handleCreateShare = async () => {
    if (!fileId) {
      toast.error(
        'Unable to identify this file.'
      )
      return
    }

    try {
      setLoading(true)

      const data =
        await createShareLink(fileId)

      setShareData(data)

      toast.success(
        'Share link created!'
      )
    } catch (error) {
      console.error(
        'Failed to create share link:',
        error
      )

      const message =
        error?.response?.data?.message ||
        'Unable to create share link.'

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) {
      return
    }

    try {
      await navigator.clipboard.writeText(
        shareUrl
      )

      setCopied(true)

      toast.success(
        'Share link copied!'
      )

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error(
        'Copy failed:',
        error
      )

      toast.error(
        'Unable to copy the link.'
      )
    }
  }

  const handleOpenLink = () => {
    if (!shareUrl) {
      return
    }

    window.open(
      shareUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleRevoke = async () => {
    if (!token) {
      toast.error(
        'Share token is unavailable.'
      )
      return
    }

    try {
      setRevoking(true)

      await revokeShareLink(token)

      setShareData(null)

      toast.success(
        'Share link revoked.'
      )
    } catch (error) {
      console.error(
        'Failed to revoke share:',
        error
      )

      const message =
        error?.response?.data?.message ||
        'Unable to revoke share link.'

      toast.error(message)
    } finally {
      setRevoking(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading &&
          !revoking
        ) {
          onClose()
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 p-5 sm:p-6 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400">
              <Share2 size={20} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Share file
              </h2>

              <p className="mt-1 max-w-[280px] truncate text-xs text-slate-500 dark:text-slate-400">
                {fileName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              loading || revoking
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Close share modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">

          {!shareUrl ? (
            <>
              {/* Empty share state */}
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-950/50">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-500 dark:bg-sky-950/50 dark:text-sky-400">
                  <Link2 size={25} />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                  Create a secure sharing link
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Anyone with the generated link
                  will be able to access this file
                  without signing in.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCreateShare}
                disabled={loading}
                className="
                  mt-5 flex h-12 w-full
                  items-center justify-center gap-2
                  rounded-xl
                  bg-sky-500
                  px-5
                  text-sm font-semibold
                  text-white
                  shadow-lg
                  shadow-sky-500/20
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:bg-sky-600
                  hover:shadow-xl
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                    Creating link...
                  </>
                ) : (
                  <>
                    <Link2 size={18} />
                    Create Share Link
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    <Check size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      Share link is ready
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-600/80 dark:text-emerald-400/70">
                      Anyone with this link can
                      access the shared file.
                    </p>
                  </div>
                </div>
              </div>

              {/* URL */}
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Share link
              </label>

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-950">
                <div className="min-w-0 flex-1 px-2">
                  <p className="truncate text-sm text-slate-600 dark:text-slate-300">
                    {shareUrl}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-sky-500 px-3 text-xs font-semibold text-white transition hover:bg-sky-600"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Open */}
              <button
                type="button"
                onClick={handleOpenLink}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ExternalLink size={17} />
                Open shared link
              </button>

              {/* Revoke */}
              <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/20"
                >
                  {revoking ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={17} />
                  )}

                  {revoking
                    ? 'Revoking...'
                    : 'Revoke share link'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShareModal