import { useRef, useState } from 'react'
import {
  CheckCircle2,
  File,
  FileArchive,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  LoaderCircle,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { uploadFile } from '../../services/fileService'

const MAX_FILE_SIZE = 50 * 1024 * 1024

function formatFileSize(bytes = 0) {
  if (!Number.isFinite(Number(bytes)) || Number(bytes) <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(
    Math.floor(Math.log(Number(bytes)) / Math.log(1024)),
    units.length - 1
  )
  const value = Number(bytes) / 1024 ** index

  return `${value.toFixed(index === 0 || value >= 10 ? 0 : 1)} ${units[index]}`
}

function getExtension(fileName = '') {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot > 0 ? fileName.slice(lastDot + 1).toLowerCase() : ''
}

function getFileIcon(file) {
  if (!file) return File

  const type = file.type?.toLowerCase() || ''
  const extension = getExtension(file.name)

  if (
    type.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(extension)
  ) {
    return FileImage
  }

  if (
    type.startsWith('video/') ||
    ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'].includes(extension)
  ) {
    return FileVideo
  }

  if (
    type.includes('spreadsheet') ||
    ['xls', 'xlsx', 'csv', 'ods'].includes(extension)
  ) {
    return FileSpreadsheet
  }

  if (
    type.includes('zip') ||
    type.includes('archive') ||
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)
  ) {
    return FileArchive
  }

  if (
    type.includes('javascript') ||
    type.includes('json') ||
    type.includes('html') ||
    type.includes('css') ||
    ['js', 'jsx', 'ts', 'tsx', 'json', 'html', 'css', 'xml', 'java', 'py'].includes(extension)
  ) {
    return FileCode2
  }

  if (
    type.includes('pdf') ||
    type.startsWith('text/') ||
    ['pdf', 'doc', 'docx', 'txt', 'rtf', 'ppt', 'pptx', 'odt'].includes(extension)
  ) {
    return FileText
  }

  return File
}

function UploadBox({ onUploadSuccess }) {
  const inputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  const validateFile = (file) => {
    if (!file) return false

    if (file.size === 0) {
      toast.error('This file is empty. Please choose another file.')
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size cannot exceed 50 MB.')
      return false
    }

    return true
  }

  const selectFile = (file) => {
    if (uploading || !file) return
    if (!validateFile(file)) return

    setSelectedFile(file)
    toast.success('File selected and ready to upload.')
  }

  const openFilePicker = () => {
    if (!uploading) inputRef.current?.click()
  }

  const handleInputChange = (event) => {
    const file = event.target.files?.[0]

    if (file) selectFile(file)

    // Allows the same file to be selected again after removing it.
    event.target.value = ''
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setDragActive(false)

    if (uploading) return

    const files = Array.from(event.dataTransfer?.files || [])

    if (files.length > 1) {
      toast('Only one file can be uploaded at a time. The first file was selected.', {
        icon: 'ℹ️',
      })
    }

    if (files[0]) selectFile(files[0])
  }

  const handleDragEnter = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!uploading) setDragActive(true)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!uploading) {
      event.dataTransfer.dropEffect = 'copy'
      setDragActive(true)
    }
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    event.stopPropagation()

    // Ignore dragleave events moving between children inside the dropzone.
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDragActive(false)
    }
  }

  const handleDropZoneKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openFilePicker()
    }
  }

  const removeFile = () => {
    if (uploading) return

    setSelectedFile(null)
    setDragActive(false)
    toast('Selected file removed.', { icon: '🗑️' })
  }

  const handleUpload = async () => {
    if (uploading) return

    if (!selectedFile) {
      toast.error('Please select a file first.')
      return
    }

    if (!validateFile(selectedFile)) {
      setSelectedFile(null)
      return
    }

    const loadingToastId = toast.loading('Uploading your file...')

    try {
      setUploading(true)
      await uploadFile(selectedFile)

      setSelectedFile(null)
      toast.success('File uploaded successfully!', {
        id: loadingToastId,
      })

      // The upload has already succeeded. A list-refresh failure should not
      // incorrectly report that the upload itself failed.
      try {
        await onUploadSuccess?.()
      } catch (refreshError) {
        console.error('File uploaded, but the file list did not refresh:', refreshError)
        toast.error('File uploaded, but your file list could not be refreshed.')
      }
    } catch (error) {
      console.error('Upload failed:', error)

      const responseData = error?.response?.data
      const message =
        (typeof responseData === 'string' && responseData) ||
        responseData?.message ||
        'Unable to upload the file. Please try again.'

      toast.error(message, { id: loadingToastId })
    } finally {
      setUploading(false)
    }
  }

  const Icon = getFileIcon(selectedFile)

  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-3 shadow-sm sm:p-5 lg:p-6 dark:border-sky-900/40 dark:from-sky-950/30 dark:via-slate-900 dark:to-blue-950/20">
      {/* Decorative background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl"
      />

      {!selectedFile ? (
        <>
          <div
            role="button"
            tabIndex={uploading ? -1 : 0}
            aria-label="Choose a file or drop one here to upload. Maximum size 50 megabytes."
            aria-disabled={uploading}
            onClick={openFilePicker}
            onKeyDown={handleDropZoneKeyDown}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex min-h-[210px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center outline-none transition duration-200 focus-visible:ring-4 focus-visible:ring-sky-500/20 sm:min-h-[230px] sm:px-6 sm:py-10 lg:min-h-[250px] ${
              dragActive
                ? 'scale-[1.005] border-sky-500 bg-sky-100/70 dark:bg-sky-950/50'
                : 'border-sky-200 bg-white/60 hover:border-sky-400 hover:bg-white/90 focus-visible:border-sky-500 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-sky-700 dark:hover:bg-slate-900/70'
            } ${uploading ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <div
              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-sky-500/20 transition sm:h-16 sm:w-16 ${
                dragActive ? 'bg-sky-600' : 'bg-sky-500'
              }`}
            >
              <UploadCloud size={28} className="sm:h-8 sm:w-8" />
            </div>

            <h3 className="text-base font-semibold text-slate-900 sm:text-lg dark:text-white">
              {dragActive ? 'Drop your file here' : 'Upload your files'}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Drag and drop a file here, or{' '}
              <span className="font-semibold text-sky-600 dark:text-sky-400">
                browse your device
              </span>
              .
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Maximum size: 50 MB
              </span>
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                One file at a time
              </span>
            </div>

            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              onChange={handleInputChange}
              disabled={uploading}
              tabIndex={-1}
            />
          </div>

          <p className="relative mt-3 text-center text-[11px] leading-5 text-slate-400 dark:text-slate-500">
            Your file will be uploaded securely to your SkySync account.
          </p>
        </>
      ) : (
        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
                Ready to upload
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Check the file details before continuing.
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 size={14} />
              Selected
            </span>
          </div>

          {/* Selected file summary */}
          <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4 dark:border-slate-800 dark:bg-slate-950/80">
            <div className="flex min-w-0 items-center gap-3 sm:flex-1">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 sm:h-12 sm:w-12 dark:bg-sky-950/40 dark:text-sky-400">
                <Icon size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  title={selectedFile.name}
                  className="break-all text-sm font-semibold text-slate-800 dark:text-slate-200 sm:break-words"
                >
                  {selectedFile.name}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {formatFileSize(selectedFile.size)}
                  {selectedFile.type ? ` · ${selectedFile.type}` : ''}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={openFilePicker}
                disabled={uploading}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Change file
              </button>

              <button
                type="button"
                onClick={removeFile}
                disabled={uploading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                aria-label="Remove selected file"
                title="Remove selected file"
              >
                <X size={18} />
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              onChange={handleInputChange}
              disabled={uploading}
              tabIndex={-1}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-xl active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {uploading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  Upload file
                </>
              )}
            </button>

            <button
              type="button"
              onClick={removeFile}
              disabled={uploading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[120px] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Trash2 size={16} />
              Remove
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default UploadBox
