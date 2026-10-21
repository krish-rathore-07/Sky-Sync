import { useRef, useState } from 'react'
import {
  CheckCircle2,
  File,
  FileArchive,
  FileImage,
  FileText,
  FileVideo,
  LoaderCircle,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { uploadFile } from '../../services/fileService'

function UploadBox({ onUploadSuccess }) {
  const inputRef = useRef(null)

  const [selectedFile, setSelectedFile] =
    useState(null)

  const [dragActive, setDragActive] =
    useState(false)

  const [uploading, setUploading] =
    useState(false)

  const MAX_FILE_SIZE = 50 * 1024 * 1024

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return '0 B'
    }

    const units = [
      'B',
      'KB',
      'MB',
      'GB',
    ]

    const index = Math.min(
      Math.floor(
        Math.log(bytes) / Math.log(1024)
      ),
      units.length - 1
    )

    const value =
      bytes /
      Math.pow(1024, index)

    return `${value.toFixed(
      index === 0 || value >= 10 ? 0 : 1
    )} ${units[index]}`
  }

  const getExtension = (fileName) => {
    if (!fileName.includes('.')) {
      return ''
    }

    return fileName
      .split('.')
      .pop()
      .toLowerCase()
  }

  const getFileIcon = (file) => {
    if (!file) {
      return File
    }

    const type =
      file.type?.toLowerCase() || ''

    const extension =
      getExtension(file.name)

    if (
      type.includes('image') ||
      [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'svg',
      ].includes(extension)
    ) {
      return FileImage
    }

    if (
      type.includes('video') ||
      [
        'mp4',
        'mov',
        'avi',
        'mkv',
        'webm',
      ].includes(extension)
    ) {
      return FileVideo
    }

    if (
      type.includes('pdf') ||
      [
        'pdf',
        'doc',
        'docx',
        'txt',
      ].includes(extension)
    ) {
      return FileText
    }

    if (
      type.includes('zip') ||
      type.includes('archive') ||
      [
        'zip',
        'rar',
        '7z',
        'tar',
        'gz',
      ].includes(extension)
    ) {
      return FileArchive
    }

    return File
  }

  const validateFile = (file) => {
    if (!file) {
      return false
    }

    if (file.size === 0) {
      toast.error('This file is empty.')
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        'File size cannot exceed 50 MB.'
      )
      return false
    }

    return true
  }

  const selectFile = (file) => {
    if (!validateFile(file)) {
      return
    }

    setSelectedFile(file)
  }

  const handleInputChange = (event) => {
    const file =
      event.target.files?.[0]

    if (file) {
      selectFile(file)
    }

    event.target.value = ''
  }

  const handleDragEnter = (event) => {
    event.preventDefault()
    event.stopPropagation()

    setDragActive(true)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    event.stopPropagation()

    setDragActive(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    event.stopPropagation()

    setDragActive(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    event.stopPropagation()

    setDragActive(false)

    const file =
      event.dataTransfer.files?.[0]

    if (file) {
      selectFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(
        'Please select a file first.'
      )
      return
    }

    try {
      setUploading(true)

      await uploadFile(selectedFile)

      toast.success(
        'File uploaded successfully!'
      )

      setSelectedFile(null)

      onUploadSuccess?.()
    } catch (error) {
      console.error(
        'Upload failed:',
        error
      )

      const message =
        error?.response?.data?.message ||
        'Unable to upload the file.'

      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    if (uploading) {
      return
    }

    setSelectedFile(null)
  }

  const Icon = getFileIcon(selectedFile)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-5 dark:border-sky-900/40 dark:from-sky-950/30 dark:via-slate-900 dark:to-blue-950/20 sm:p-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />

      {!selectedFile ? (
        <button
          type="button"
          onClick={() =>
            inputRef.current?.click()
          }
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative flex w-full flex-col
            items-center justify-center
            rounded-2xl border-2 border-dashed
            px-5 py-9
            text-center
            transition-all duration-300
            ${
              dragActive
                ? 'border-sky-500 bg-sky-100/60 dark:bg-sky-950/40'
                : 'border-sky-200 bg-white/50 hover:border-sky-400 hover:bg-white/80 dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-sky-700 dark:hover:bg-slate-900/60'
            }
          `}
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20">
            <UploadCloud size={27} />
          </div>

          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            {dragActive
              ? 'Drop your file here'
              : 'Upload your files'}
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Drag and drop a file here, or click
            to browse from your computer.
          </p>

          <span className="mt-4 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Maximum file size: 50 MB
          </span>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleInputChange}
          />
        </button>
      ) : (
        <div className="relative">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Selected file
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Ready to upload
              </p>
            </div>

            <CheckCircle2
              size={20}
              className="text-emerald-500"
            />
          </div>

          {/* File preview */}
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400">
              <Icon size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                {formatFileSize(
                  selectedFile.size
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={removeFile}
              disabled={uploading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              aria-label="Remove selected file"
            >
              <X size={18} />
            </button>
          </div>

          {/* Upload button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="
              mt-4 flex h-11 w-full
              items-center justify-center gap-2
              rounded-xl
              bg-sky-500
              px-5
              text-sm font-semibold
              text-white
              shadow-lg shadow-sky-500/20
              transition-all duration-300
              hover:-translate-y-0.5
              hover:bg-sky-600
              hover:shadow-xl
              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:translate-y-0
            "
          >
            {uploading ? (
              <>
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                Upload File
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default UploadBox