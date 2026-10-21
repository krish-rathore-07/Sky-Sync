import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
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
  Share2,
} from 'lucide-react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { getSharedFile } from '../../services/ShareService.js'

function SharePage() {
  const { token } = useParams()

  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchSharedFile = async () => {
      if (!token) {
        setError('Invalid sharing link.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const data = await getSharedFile(token)

        setFile(data)
      } catch (err) {
        console.error(
          'Failed to fetch shared file:',
          err
        )

        const status = err?.response?.status

        if (status === 404) {
          setError(
            'This sharing link does not exist or has been removed.'
          )
        } else if (status === 410) {
          setError(
            'This sharing link has expired.'
          )
        } else {
          setError(
            err?.response?.data?.message ||
              'Unable to access this shared file.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSharedFile()
  }, [token])

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
      'fileName',
      'filename',
      'name'
    ) || 'Shared file'

  const fileUrl =
    getFileValue(
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

  const fileSize =
    getFileValue(
      'fileSize',
      'size',
      'bytes'
    )

  const formatFileSize = (size) => {
    if (!size || Number.isNaN(Number(size))) {
      return 'Unknown size'
    }

    const bytes = Number(size)

    if (bytes < 1024) {
      return `${bytes} B`
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return `${(
      bytes /
      (1024 * 1024 * 1024)
    ).toFixed(1)} GB`
  }

  const getFileIcon = () => {
    const lowerName = fileName.toLowerCase()
    const lowerType = contentType.toLowerCase()

    if (
      lowerType.startsWith('image/') ||
      /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/.test(
        lowerName
      )
    ) {
      return FileImage
    }

    if (
      lowerType.includes('pdf') ||
      lowerName.endsWith('.pdf')
    ) {
      return FileText
    }

    if (
      lowerType.includes('spreadsheet') ||
      /\.(xls|xlsx|csv)$/.test(lowerName)
    ) {
      return FileSpreadsheet
    }

    if (
      lowerType.includes('zip') ||
      lowerType.includes('compressed') ||
      /\.(zip|rar|7z|tar|gz)$/.test(lowerName)
    ) {
      return FileArchive
    }

    if (
      lowerType.includes('javascript') ||
      lowerType.includes('json') ||
      lowerType.includes('html') ||
      lowerType.includes('css') ||
      /\.(js|jsx|ts|tsx|json|html|css)$/.test(
        lowerName
      )
    ) {
      return FileCode2
    }

    return File
  }

  const handleOpenFile = () => {
    if (!fileUrl) {
      toast.error(
        'File URL is unavailable.'
      )
      return
    }

    window.open(
      fileUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }

  const handleDownload = () => {
    if (!fileUrl) {
      toast.error(
        'File URL is unavailable.'
      )
      return
    }

    const link =
      document.createElement('a')

    link.href = fileUrl
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.download = fileName

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        window.location.href
      )

      toast.success(
        'Share link copied!'
      )
    } catch {
      toast.error(
        'Unable to copy link.'
      )
    }
  }

  const FileIcon = getFileIcon()

  /* --------------------------------
     Loading
  -------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/10">
            <LoaderCircle
              size={30}
              className="animate-spin text-sky-500"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
            Loading shared file
          </h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Please wait a moment...
          </p>
        </div>
      </div>
    )
  }

  /* --------------------------------
     Error
  -------------------------------- */

  if (error || !file) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md text-center">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle size={38} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
            Unable to access file
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {error ||
              'This sharing link is no longer available.'}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.href = '/'
            }
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600"
          >
            <ArrowLeft size={17} />
            Go to SkySync
          </button>
        </div>
      </div>
    )
  }

  /* --------------------------------
     Main Page
  -------------------------------- */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
              <Share2 size={18} />
            </div>

            <span className="text-lg font-bold tracking-tight">
              Sky<span className="text-sky-500">Sync</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <LockKeyhole size={14} />
            Secure shared file
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">

        <div className="w-full max-w-2xl">

          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-400">
              <CheckCircle2 size={15} />
              File shared with you
            </div>
          </div>

          {/* Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

            {/* Card top */}
            <div className="p-6 sm:p-8">

              {/* File icon */}
              <div className="flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400">
                  <FileIcon size={42} strokeWidth={1.6} />
                </div>
              </div>

              {/* File name */}
              <div className="mt-6 text-center">
                <h1 className="break-all text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                  {fileName}
                </h1>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {contentType ||
                      'Shared file'}
                  </span>

                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block dark:bg-slate-700" />

                  <span>
                    {formatFileSize(fileSize)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mx-auto mt-7 max-w-md rounded-2xl bg-slate-50 p-4 text-center dark:bg-slate-950/60">
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  This file was securely shared
                  with you using SkySync. No
                  account is required to access
                  the file.
                </p>
              </div>

              {/* Actions */}
              <div className="mt-7 grid gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={handleOpenFile}
                  disabled={!fileUrl}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ExternalLink size={18} />
                  Open File
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!fileUrl}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Download size={18} />
                  Download
                </button>

              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950/50">

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <LockKeyhole size={14} />
                Protected by SkySync
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-sky-600 transition hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/30"
              >
                <Share2 size={14} />
                Copy share link
              </button>
            </div>

          </div>

          {/* Branding */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Shared securely with{' '}
            <span className="font-semibold">
              SkySync
            </span>
          </p>

        </div>
      </main>
    </div>
  )
}

export default SharePage