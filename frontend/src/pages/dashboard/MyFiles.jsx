import { useEffect, useMemo, useState } from 'react'
import {
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileCode2,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  MoreVertical,
  RefreshCw,
  Share2,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'

import Sidebar from '../../components/layout/Sidebar'
import Navbar from '../../components/layout/Navbar'
import UploadBox from '../../components/files/UploadBox'
import ShareModal from '../../components/files/ShareModal'

import {
  deleteFile,
  getMyFiles,
} from '../../services/fileService'

function MyFiles() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [menuFile, setMenuFile] = useState(null)
  const [shareFile, setShareFile] = useState(null)
  const [deleteLoading, setDeleteLoading] =
    useState(false)

  const fetchFiles = async ({
    showRefresh = false,
    notify = false,
  } = {}) => {
    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError('')

      const response = await getMyFiles()

      // fileService may return the array directly or an Axios response.
      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.files)
            ? response.files
            : Array.isArray(response?.data?.files)
              ? response.data.files
              : []

      setFiles(data)

      if (notify) {
        toast.success('Your files are up to date.')
      }

      return data
    } catch (err) {
      console.error('Failed to fetch files:', err)

      const message =
        err?.response?.data?.message ||
        'Unable to load your files.'

      setError(message)

      if (notify) {
        toast.error(message)
      }

      return null
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  // Make the mobile file-action sheet dismissible and keep the page
  // behind it from scrolling while it is open.
  useEffect(() => {
    if (!menuFile) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !deleteLoading) {
        setMenuFile(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuFile, deleteLoading])

  const getFileValue = (
    file,
    ...keys
  ) => {
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

  // The backend File entity uses originalFileName, while some API
  // responses expose the same value as originalFilename.
  const getFileName = (file) =>
    getFileValue(
      file,
      'originalFilename',
      'originalFileName',
      'fileName',
      'filename',
      'name'
    ) || 'Untitled file'

  const getFileUrl = (file) =>
    getFileValue(
      file,
      'fileUrl',
      'url',
      'secureUrl',
      'cloudinaryUrl'
    )

  const getFileType = (file) =>
    getFileValue(
      file,
      'contentType',
      'fileType',
      'type',
      'mimeType'
    ) || ''

  const getFileSize = (file) =>
    getFileValue(
      file,
      'fileSize',
      'size',
      'bytes'
    )

  const getFileId = (file) =>
    getFileValue(
      file,
      'id',
      'fileId'
    )

  const formatSize = (size) => {
    if (!size) return 'Unknown'

    const bytes = Number(size)

    if (Number.isNaN(bytes)) {
      return String(size)
    }

    if (bytes < 1024) {
      return `${bytes} B`
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }

    if (bytes < 1024 * 1024 * 1024) {
      return `${(
        bytes /
        (1024 * 1024)
      ).toFixed(1)} MB`
    }

    return `${(
      bytes /
      (1024 * 1024 * 1024)
    ).toFixed(1)} GB`
  }

  const getFileIcon = (file) => {
    const name =
      getFileName(file).toLowerCase()

    const type =
      getFileType(file).toLowerCase()

    if (
      type.startsWith('image/') ||
      /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/.test(
        name
      )
    ) {
      return FileImage
    }

    if (
      type.includes('pdf') ||
      name.endsWith('.pdf')
    ) {
      return FileText
    }

    if (
      type.includes('spreadsheet') ||
      /\.(xls|xlsx|csv)$/.test(name)
    ) {
      return FileSpreadsheet
    }

    if (
      type.includes('zip') ||
      type.includes('compressed') ||
      /\.(zip|rar|7z|tar|gz)$/.test(name)
    ) {
      return FileArchive
    }

    if (
      type.includes('javascript') ||
      type.includes('json') ||
      type.includes('html') ||
      type.includes('css') ||
      /\.(js|jsx|ts|tsx|json|html|css)$/.test(
        name
      )
    ) {
      return FileCode2
    }

    return File
  }

  const filteredFiles = useMemo(() => {
    const value =
      search.trim().toLowerCase()

    if (!value) {
      return files
    }

    return files.filter((file) =>
      getFileName(file)
        .toLowerCase()
        .includes(value)
    )
  }, [files, search])

  const handleOpen = (file) => {
    const url = getFileUrl(file)

    if (!url) {
      toast.error(
        'File URL is unavailable.'
      )
      return
    }

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    )

    toast('Opening file in a new tab.', {
      icon: '↗',
      duration: 2500,
    })
  }

  const handleDownload = (file) => {
    const url = getFileUrl(file)

    if (!url) {
      toast.error(
        'File URL is unavailable.'
      )
      return
    }

    const link =
      document.createElement('a')

    link.href = url
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.download = getFileName(file)

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast('Opening download link.', {
      icon: '⬇️',
      duration: 2500,
    })
  }

  const handleDelete = async (file) => {
    const fileId = getFileId(file)

    if (!fileId) {
      toast.error(
        'Unable to identify this file.'
      )
      return
    }

    const loadingToastId = toast.loading('Deleting file...')

    try {
      setDeleteLoading(true)

      await deleteFile(fileId)

      setFiles((current) =>
        current.filter(
          (item) =>
            getFileId(item) !== fileId
        )
      )

      setMenuFile(null)

      toast.success('File deleted successfully.', {
        id: loadingToastId,
      })
    } catch (err) {
      console.error('Failed to delete file:', err)

      toast.error(
        err?.response?.data?.message ||
          'Unable to delete file.',
        { id: loadingToastId }
      )
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
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

          <main className="w-full px-3 py-5 sm:px-5 sm:py-6 md:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">

          {/* Header */}
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <FolderOpen size={14} />
                My Files
              </div>

              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                All Files
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage everything you've
                uploaded to SkySync.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row sm:w-auto sm:shrink-0">
              <button
                type="button"
                onClick={() => fetchFiles({ showRefresh: true, notify: true })}
                disabled={refreshing || loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>

              <button
                type="button"
                onClick={() =>
                  document.getElementById('upload-section')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                }
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-sky-600 active:translate-y-0 sm:w-auto"
              >
                <Upload size={17} />
                Upload File
              </button>
            </div>
          </div>

          {/* Upload */}
          <section
            id="upload-section"
            className="mb-8"
          >
            <UploadBox
              onUploadSuccess={() => fetchFiles()}
            />
          </section>

          {/* Files card */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">
                  Your files
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {filteredFiles.length}{' '}
                  {filteredFiles.length === 1 ? 'file' : 'files'}
                  {search.trim() ? ` matching “${search.trim()}”` : ''}
                </p>
              </div>

              {search.trim() && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-sky-600 transition hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/30"
                >
                  <X size={14} />
                  Clear search
                </button>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 p-4"
                    >
                      <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

                      <div className="flex-1">
                        <div className="h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                        <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="p-10 text-center">
                <p className="text-sm text-red-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchFiles}
                  className="mt-4 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading &&
              !error &&
              filteredFiles.length === 0 && (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <FolderOpen size={28} />
                  </div>

                  <h3 className="mt-5 text-base font-semibold">
                    {search
                      ? 'No files found'
                      : 'No files yet'}
                  </h3>

                  <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                    {search
                      ? 'Try searching with a different file name.'
                      : 'Upload your first file and it will appear here.'}
                  </p>
                </div>
              )}

            {/* Desktop table */}
            {!loading &&
              !error &&
              filteredFiles.length > 0 && (
                <>
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[640px]">
                      <thead>
                        <tr className="border-b border-slate-200 text-left dark:border-slate-800">
                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Name
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Type
                          </th>

                          <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Size
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredFiles.map(
                          (file) => {
                            const Icon =
                              getFileIcon(
                                file
                              )

                            const name =
                              getFileName(
                                file
                              )

                            return (
                              <tr
                                key={getFileId(
                                  file
                                )}
                                className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800/70 dark:hover:bg-slate-800/40"
                              >
                                <td className="px-5 py-4">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400">
                                      <Icon
                                        size={19}
                                      />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold">
                                        {name}
                                      </p>

                                      <p className="mt-0.5 truncate text-xs text-slate-400">
                                        {getFileType(
                                          file
                                        ) ||
                                          'File'}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                                  {getFileType(
                                    file
                                  ) ||
                                    'Unknown'}
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                                  {formatSize(
                                    getFileSize(
                                      file
                                    )
                                  )}
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex justify-end gap-1">

                                    <button
                                      type="button"
                                      title="Open"
                                      onClick={() =>
                                        handleOpen(
                                          file
                                        )
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-sky-50 hover:text-sky-500 dark:hover:bg-sky-950/30"
                                    >
                                      <ExternalLink
                                        size={16}
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      title="Download"
                                      onClick={() =>
                                        handleDownload(
                                          file
                                        )
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                                    >
                                      <Download
                                        size={16}
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      title="Share"
                                      onClick={() =>
                                        setShareFile(
                                          file
                                        )
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-sky-50 hover:text-sky-500 dark:hover:bg-sky-950/30"
                                    >
                                      <Share2
                                        size={16}
                                      />
                                    </button>

                                    <button
                                      type="button"
                                      title="Delete"
                                      onClick={() =>
                                        setMenuFile(
                                          file
                                        )
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                                    >
                                      <Trash2
                                        size={16}
                                      />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          }
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="divide-y divide-slate-100 lg:hidden dark:divide-slate-800">
                    {filteredFiles.map(
                      (file) => {
                        const Icon =
                          getFileIcon(file)

                        return (
                          <div
                            key={getFileId(
                              file
                            )}
                            className="p-4"
                          >
                            <div className="flex items-start gap-3">

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400">
                                <Icon
                                  size={20}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                  {getFileName(
                                    file
                                  )}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {formatSize(
                                    getFileSize(
                                      file
                                    )
                                  )}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setMenuFile(
                                    file
                                  )
                                }
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <MoreVertical
                                  size={18}
                                />
                              </button>
                            </div>
                          </div>
                        )
                      }
                    )}
                  </div>
                </>
              )}
          </section>
            </div>
          </main>
        </div>
      </div>

      {/* Action menu */}
      {menuFile && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deleteLoading
            ) {
              setMenuFile(null)
            }
          }}
        >
          <div role="dialog" aria-modal="true" aria-label={`Actions for ${getFileName(menuFile)}`} className="max-h-[min(80vh,560px)] w-full max-w-sm overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900">

            <div className="mb-2 flex items-center justify-between px-2 py-2">
              <p className="max-w-[250px] truncate text-sm font-semibold">
                {getFileName(
                  menuFile
                )}
              </p>

              <button
                type="button"
                onClick={() =>
                  setMenuFile(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close file actions"
              >
                <X size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                handleOpen(menuFile)
                setMenuFile(null)
              }}
              className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ExternalLink size={17} />
              Open file
            </button>

            <button
              type="button"
              onClick={() => {
                handleDownload(menuFile)
                setMenuFile(null)
              }}
              className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Download size={17} />
              Download
            </button>

            <button
              type="button"
              onClick={() => {
                setShareFile(menuFile)
                setMenuFile(null)
              }}
              className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Share2
                size={17}
                className="text-sky-500"
              />
              Share file
            </button>

            <button
              type="button"
              disabled={deleteLoading}
              onClick={() =>
                handleDelete(menuFile)
              }
              className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/20"
            >
              <Trash2 size={17} />
              {deleteLoading
                ? 'Deleting...'
                : 'Delete file'}
            </button>
          </div>
        </div>
      )}

      {/* Share modal */}
      {shareFile && (
        <ShareModal
          file={shareFile}
          onClose={() =>
            setShareFile(null)
          }
        />
      )}
    </div>
  )
}

export default MyFiles