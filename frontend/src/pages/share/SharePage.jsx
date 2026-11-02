import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Share2,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { getSharedFile } from '../../services/ShareService.js'

function formatFileSize(size) {
  if (size === null || size === undefined || size === '' || Number.isNaN(Number(size))) {
    return 'Unknown size'
  }

  const bytes = Number(size)
  if (bytes < 0) return 'Unknown size'
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`

  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

function getFileIcon(fileName = '', contentType = '') {
  const lowerName = String(fileName).toLowerCase()
  const lowerType = String(contentType).toLowerCase()

  if (
    lowerType.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/.test(lowerName)
  ) {
    return FileImage
  }

  if (
    lowerType.startsWith('video/') ||
    /\.(mp4|mov|avi|mkv|webm|m4v)$/.test(lowerName)
  ) {
    return FileImage
  }

  if (
    lowerType.includes('spreadsheet') ||
    /\.(xls|xlsx|csv|ods)$/.test(lowerName)
  ) {
    return FileSpreadsheet
  }

  if (
    lowerType.includes('zip') ||
    lowerType.includes('compressed') ||
    /\.(zip|rar|7z|tar|gz|bz2)$/.test(lowerName)
  ) {
    return FileArchive
  }

  if (
    lowerType.includes('javascript') ||
    lowerType.includes('json') ||
    lowerType.includes('html') ||
    lowerType.includes('css') ||
    /\.(js|jsx|ts|tsx|json|html|css|xml|java|py)$/.test(lowerName)
  ) {
    return FileCode2
  }

  if (
    lowerType.includes('pdf') ||
    lowerType.startsWith('text/') ||
    /\.(pdf|doc|docx|txt|rtf|ppt|pptx|odt)$/.test(lowerName)
  ) {
    return FileText
  }

  return File
}

function getErrorMessage(error) {
  const status = error?.response?.status

  if (status === 404) {
    return 'This sharing link does not exist or has been removed.'
  }

  if (status === 410) {
    return 'This sharing link has expired.'
  }

  const responseData = error?.response?.data
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData
  }

  return (
    responseData?.message ||
    'Unable to access this shared file. Please try again.'
  )
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  // Fallback for browsers where Clipboard API is unavailable.
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  textarea.style.top = '0'
  textarea.style.opacity = '0'

  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)

  const copied = document.execCommand('copy')
  textarea.remove()

  if (!copied) {
    throw new Error('Unable to copy the share link.')
  }
}

function SharePage() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let active = true
    const loadingToastId = toast.loading('Loading shared file...')

    const fetchSharedFile = async () => {
      if (!token) {
        const message = 'Invalid sharing link.'
        if (active) {
          setError(message)
          setFile(null)
          setLoading(false)
        }
        toast.error(message, { id: loadingToastId })
        return
      }

      try {
        if (active) {
          setLoading(true)
          setError('')
          setFile(null)
        }

        const data = await getSharedFile(token)

        if (!data) {
          throw new Error('The shared file could not be found.')
        }

        if (active) {
          setFile(data)
          setError('')
          setCopied(false)
        }

        toast.dismiss(loadingToastId)
      } catch (err) {
        console.error('Failed to fetch shared file:', err)
        const message = getErrorMessage(err)

        if (active) {
          setError(message)
          setFile(null)
        }

        toast.error(message, { id: loadingToastId })
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    fetchSharedFile()

    return () => {
      active = false
      toast.dismiss(loadingToastId)
    }
  }, [token, retryCount])

  const getFileValue = (...keys) => {
    for (const key of keys) {
      if (
        file?.[key] !== undefined &&
        file?.[key] !== null &&
        file?.[key] !== ''
      ) {
        return file[key]
      }
    }

    return null
  }

  const fileName =
    getFileValue(
      'originalFileName',
      'originalFilename',
      'fileName',
      'filename',
      'name'
    ) || 'Shared file'

  const fileUrl = getFileValue(
    'fileUrl',
    'url',
    'secureUrl',
    'cloudinaryUrl'
  )

  const contentType =
    getFileValue(
      'contentType',
      'fileType',
      'type',
      'mimeType'
    ) || ''

  const fileSize = getFileValue('fileSize', 'size', 'bytes')
  const FileIcon = getFileIcon(fileName, contentType)

  const handleOpenFile = () => {
    if (!fileUrl) {
      toast.error('The file URL is unavailable.')
      return
    }

    window.open(fileUrl, '_blank', 'noopener,noreferrer')
    toast('Opening the shared file in a new tab.', {
      icon: '↗',
      duration: 2500,
    })
  }

  const handleDownload = () => {
    if (!fileUrl) {
      toast.error('The file URL is unavailable.')
      return
    }

    try {
      const link = document.createElement('a')
      link.href = fileUrl
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.download = fileName

      document.body.appendChild(link)
      link.click()
      link.remove()

      toast('Opening the file download...', {
        icon: '⬇️',
        duration: 2500,
      })
    } catch (downloadError) {
      console.error('Unable to start file download:', downloadError)
      toast.error('Unable to start the download. Please try opening the file instead.')
    }
  }

  const handleCopyLink = async () => {
    try {
      await copyText(window.location.href)
      setCopied(true)
      toast.success('Share link copied to clipboard.')

      window.setTimeout(() => setCopied(false), 2200)
    } catch (copyError) {
      console.error('Failed to copy share link:', copyError)
      toast.error('Unable to copy the link. Please copy it from your browser address bar.')
    }
  }

  const handleRetry = () => {
    setError('')
    setLoading(true)
    setRetryCount((current) => current + 1)
    toast('Trying to load the shared file again.', { icon: '↻' })
  }

  const handleGoToSkySync = () => {
    navigate('/', { replace: true })
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center overflow-x-hidden bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-slate-200 bg-white/90 p-7 text-center shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/20 sm:p-9">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-500">
            <LoaderCircle size={30} className="animate-spin" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
            Loading shared file
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Please wait while we securely retrieve the file details.
          </p>
        </div>
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red-400/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl"
        />

        <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white/90 p-6 text-center shadow-xl shadow-slate-200/40 backdrop-blur sm:p-8 dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-black/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle size={32} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
            Unable to access file
          </h1>

          <p className="mt-3 break-words text-sm leading-6 text-slate-500 dark:text-slate-400">
            {error || 'This sharing link is no longer available.'}
          </p>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw size={16} />
              Try again
            </button>

            <button
              type="button"
              onClick={handleGoToSkySync}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <ArrowLeft size={17} />
              Go to SkySync
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-200 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:min-h-[72px] sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
              <Share2 size={18} />
            </div>

            <span className="truncate text-lg font-bold tracking-tight sm:text-xl">
              Sky<span className="text-sky-500">Sync</span>
            </span>
          </div>

          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[10px] font-semibold text-emerald-700 sm:gap-2 sm:px-3 sm:text-xs dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            <LockKeyhole size={13} />
            <span>Secure shared file</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-6xl items-start justify-center px-3 py-7 sm:min-h-[calc(100dvh-72px)] sm:px-6 sm:py-10 lg:items-center lg:px-8 lg:py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-5 flex justify-center sm:mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400">
              <CheckCircle2 size={15} />
              File shared with you
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 sm:rounded-3xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 sm:h-24 sm:w-24 sm:rounded-3xl dark:bg-sky-950/40 dark:text-sky-400">
                  <FileIcon size={38} strokeWidth={1.6} className="sm:h-11 sm:w-11" />
                </div>
              </div>

              <div className="mt-5 min-w-0 text-center sm:mt-6">
                <h1 className="break-words text-lg font-bold leading-snug text-slate-900 sm:text-2xl dark:text-white">
                  {fileName}
                </h1>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-slate-500 dark:text-slate-400 sm:gap-x-4">
                  <span className="max-w-full break-all">{contentType || 'Shared file'}</span>
                  <span className="hidden h-1 w-1 shrink-0 rounded-full bg-slate-300 sm:block dark:bg-slate-700" />
                  <span>{formatFileSize(fileSize)}</span>
                </div>
              </div>

              <div className="mx-auto mt-6 max-w-md rounded-2xl bg-slate-50 p-3 text-center sm:mt-7 sm:p-4 dark:bg-slate-950/60">
                <p className="text-xs leading-6 text-slate-500 sm:text-sm dark:text-slate-400">
                  This file was securely shared with you using SkySync. You do
                  not need a SkySync account to access this link.
                </p>
              </div>

              {!fileUrl && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>The file URL is unavailable, so opening and downloading are disabled.</p>
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-7 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleOpenFile}
                  disabled={!fileUrl}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-xl active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:focus:ring-offset-slate-900"
                >
                  <ExternalLink size={18} />
                  Open file
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!fileUrl}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Download size={18} />
                  Download
                </button>
              </div>
            </div>

            <footer className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 sm:justify-start dark:text-slate-400">
                <LockKeyhole size={14} />
                Protected by SkySync
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500/40 sm:w-auto dark:text-sky-400 dark:hover:bg-sky-950/30"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Link copied' : 'Copy share link'}
              </button>
            </footer>
          </section>

          <p className="mt-5 px-2 text-center text-xs text-slate-400 dark:text-slate-500">
            Shared securely with <span className="font-semibold">SkySync</span>
          </p>
        </div>
      </main>
    </div>
  )
}

export default SharePage
