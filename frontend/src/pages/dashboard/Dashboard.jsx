import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Download,
  FileArchive,
  FileImage,
  FileText,
  FileVideo,
  Files,
  FolderOpen,
  HardDrive,
  MoreHorizontal,
  RefreshCw,
  Search,
  Share2,
  Trash2,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import UploadBox from '../../components/files/UploadBox'
import Sidebar from '../../components/layout/Sidebar'
import Navbar from '../../components/layout/Navbar'
import { getMyFiles, deleteFile } from '../../services/fileService'
import { useAuth } from '../../context/AuthContext'
import ShareModal from '../../components/files/ShareModal'

function Dashboard() {
  const { user } = useAuth()

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false)

  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const [searchValue, setSearchValue] = useState('')

  const [selectedFile, setSelectedFile] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [shareFile, setShareFile] = useState(null)
  // --------------------------------------------------
  // Fetch files
  // --------------------------------------------------

  const fetchFiles = async (showRefresh = false, notify = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true)
        if (files.length === 0) setLoading(true)
      } else {
        setLoading(true)
      }

      setError('')

      const response = await getMyFiles()

      // Support both a direct array and common API/Axios response shapes.
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
      if (notify) toast.success('Your files are up to date.')
    } catch (err) {
      console.error('Failed to fetch files:', err)

      const responseMessage = err?.response?.data
      const message =
        (typeof responseMessage === 'string' ? responseMessage : responseMessage?.message) ||
        'Unable to load your files.'

      setError(message)
      if (notify) toast.error(message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  // Keep the page from scrolling behind the file-actions dialog.
  useEffect(() => {
    if (!selectedFile) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !deleting) {
        setSelectedFile(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedFile, deleting])

  // --------------------------------------------------
  // File helpers
  // --------------------------------------------------

  // The backend may expose this as originalFilename or originalFileName.
  // Keep both spellings, plus the alternative fields used by other responses.
  const getFileName = (file) => {
    const candidate =
      file?.originalFilename ??
      file?.originalFileName ??
      file?.fileName ??
      file?.filename ??
      file?.name ??
      file?.file?.originalFilename ??
      file?.file?.originalFileName ??
      file?.file?.fileName

    return typeof candidate === 'string' && candidate.trim()
      ? candidate.trim()
      : 'Untitled file'
  }

  const getFileSize = (file) => {
    return (
      file?.fileSize ||
      file?.size ||
      file?.bytes ||
      0
    )
  }

  const getFileUrl = (file) => {
    return (
      file?.fileUrl ||
      file?.url ||
      file?.secureUrl ||
      file?.cloudinaryUrl ||
      ''
    )
  }

  const getFileType = (file) => {
    return (
      file?.contentType ||
      file?.fileType ||
      file?.type ||
      ''
    )
  }

  const getFileId = (file) => {
    return file?.id || file?.fileId
  }

  const formatFileSize = (bytes) => {
    const numericBytes = Number(bytes)

    if (!Number.isFinite(numericBytes) || numericBytes <= 0) {
      return '0 B'
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB']

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    )

    const safeIndex = Math.min(
      index,
      units.length - 1
    )

    const value =
      numericBytes /
      Math.pow(1024, safeIndex)

    return `${value.toFixed(
      value >= 10 || safeIndex === 0 ? 0 : 1
    )} ${units[safeIndex]}`
  }

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return 'Recently'
    }

    const date = new Date(dateValue)

    if (Number.isNaN(date.getTime())) {
      return 'Recently'
    }

    return date.toLocaleDateString(
      undefined,
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  const getFileExtension = (fileName) => {
    if (!fileName || !fileName.includes('.')) {
      return ''
    }

    return fileName
      .split('.')
      .pop()
      .toLowerCase()
  }

  const getFileIcon = (file) => {
    const type = getFileType(file).toLowerCase()
    const extension = getFileExtension(
      getFileName(file)
    )

    if (
      type.includes('image') ||
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(
        extension
      )
    ) {
      return FileImage
    }

    if (
      type.includes('video') ||
      ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(
        extension
      )
    ) {
      return FileVideo
    }

    if (
      type.includes('pdf') ||
      ['pdf', 'doc', 'docx', 'txt'].includes(
        extension
      )
    ) {
      return FileText
    }

    if (
      type.includes('zip') ||
      type.includes('archive') ||
      ['zip', 'rar', '7z', 'tar', 'gz'].includes(
        extension
      )
    ) {
      return FileArchive
    }

    return Files
  }

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const filteredFiles = useMemo(() => {
    const query = searchValue
      .trim()
      .toLowerCase()

    if (!query) {
      return files
    }

    return files.filter((file) =>
      getFileName(file)
        .toLowerCase()
        .includes(query)
    )
  }, [files, searchValue])

  // --------------------------------------------------
  // Statistics
  // --------------------------------------------------

  const totalStorage = useMemo(() => {
    return files.reduce((total, file) => {
      return total + Number(getFileSize(file) || 0)
    }, 0)
  }, [files])

  const stats = [
    {
      label: 'Total Files',
      value: files.length,
      icon: Files,
      description:
        files.length === 1
          ? '1 file stored'
          : `${files.length} files stored`,
    },
    {
      label: 'Storage Used',
      value: formatFileSize(totalStorage),
      icon: HardDrive,
      description: 'Across your files',
    },
    {
      label: 'Shared Files',
      value: '—',
      icon: Share2,
      description: 'Manage your shared links',
    },
  ]

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  const handleDelete = async () => {
    if (!selectedFile) {
      return
    }

    const fileId = getFileId(selectedFile)

    if (!fileId) {
      toast.error('Unable to identify this file.')
      return
    }

    try {
      setDeleting(true)

      await deleteFile(fileId)

      setFiles((currentFiles) =>
        currentFiles.filter(
          (file) => getFileId(file) !== fileId
        )
      )

      setSelectedFile(null)

      toast.success('File deleted successfully.')
    } catch (err) {
      console.error('Failed to delete file:', err)

      const responseMessage = err?.response?.data
      const message =
        (typeof responseMessage === 'string' ? responseMessage : responseMessage?.message) ||
        'Unable to delete the file.'

      toast.error(message)
    } finally {
      setDeleting(false)
    }
  }

  // --------------------------------------------------
  // View / Download
  // --------------------------------------------------

  const handleOpenFile = (file) => {
    const url = getFileUrl(file)

    if (!url) {
      toast.error(
        'File URL is not available.'
      )
      return
    }

    // Open directly from the user's click. Browsers may return null when
    // noopener is enabled even if the new tab opened successfully.
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen w-full overflow-x-clip bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <div className="flex min-h-screen w-full min-w-0">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onClose={() =>
            setMobileSidebarOpen(false)
          }
        />

        {/* Main */}
        <div className="min-w-0 flex-1">
          <Navbar
            onMenuClick={() =>
              setMobileSidebarOpen(true)
            }
            searchValue={searchValue}
            onSearchChange={setSearchValue}
          />

          <main className="w-full min-w-0 px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl min-w-0">
              {/* -------------------------------- */}
              {/* Welcome */}
              {/* -------------------------------- */}

              <section className="mb-7">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                  <div>
                    <p className="mb-1 text-sm font-medium text-sky-500">
                      Your workspace
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                      Welcome back,{' '}
                      {user?.name?.split(' ')[0] ||
                        'there'}{' '}
                      👋
                    </h1>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Manage your files, keep them
                      organized, and share them
                      securely with SkySync.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      fetchFiles(true, true)
                    }
                    disabled={refreshing}
                    className="
                      inline-flex h-10
                      items-center justify-center
                      gap-2
                      self-start
                      rounded-xl
                      border border-slate-200
                      bg-white
                      px-4
                      text-sm font-medium
                      text-slate-600
                      shadow-sm
                      transition-all duration-200
                      hover:bg-slate-50
                      hover:text-slate-900
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      sm:self-auto
                      dark:border-slate-800
                      dark:bg-slate-900
                      dark:text-slate-400
                      dark:hover:bg-slate-800
                      dark:hover:text-white
                    "
                  >
                    <RefreshCw
                      size={16}
                      className={
                        refreshing
                          ? 'animate-spin'
                          : ''
                      }
                    />
                    Refresh
                  </button>
                </div>
              </section>

              {/* -------------------------------- */}
              {/* Stats */}
              {/* -------------------------------- */}

              <section className="mb-7 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon

                  return (
                    <div
                      key={stat.label}
                      className="
                        group rounded-2xl
                        border border-slate-200
                        bg-white
                        p-5
                        shadow-sm
                        transition-all duration-300
                        hover:-translate-y-0.5
                        hover:shadow-md
                        dark:border-slate-800
                        dark:bg-slate-900
                      "
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            {stat.label}
                          </p>

                          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {stat.value}
                          </p>

                          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            {stat.description}
                          </p>
                        </div>

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-500 transition-transform duration-300 group-hover:scale-105 dark:bg-sky-950/40 dark:text-sky-400">
                          <Icon size={21} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </section>

              {/* -------------------------------- */}
              {/* Upload area */}
              {/* -------------------------------- */}

              <section className="mb-7">
  <div className="mb-4">
    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
      Upload Files
    </h2>

    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
      Add a new file to your secure SkySync workspace.
    </p>
  </div>

  <UploadBox
    onUploadSuccess={() => fetchFiles(true)}
  />
</section>

              {/* -------------------------------- */}
              {/* Files */}
              {/* -------------------------------- */}

              <section>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      My Files
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {searchValue
                        ? `${filteredFiles.length} result${
                            filteredFiles.length === 1
                              ? ''
                              : 's'
                          } found`
                        : `${files.length} file${
                            files.length === 1
                              ? ''
                              : 's'
                          } in your workspace`}
                    </p>
                  </div>

                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/20 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={19}
                        className="mt-0.5 shrink-0 text-red-500"
                      />

                      <div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                          Couldn't load your files
                        </p>

                        <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/70">
                          {error}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        fetchFiles(true, true)
                      }
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-red-500 px-3 text-xs font-semibold text-white transition hover:bg-red-600"
                    >
                      <RefreshCw size={14} />
                      Try again
                    </button>
                  </div>
                )}

                {/* Loading */}
                {loading && (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="hidden lg:block">
                      <div className="grid grid-cols-[minmax(0,2fr)_120px_150px_50px] gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                        {[
                          'file',
                          'size',
                          'date',
                          'action',
                        ].map((item) => (
                          <div
                            key={item}
                            className="h-3 animate-pulse rounded bg-slate-200 dark:bg-slate-800"
                          />
                        ))}
                      </div>

                      {Array.from({
                        length: 5,
                      }).map((_, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-[minmax(0,2fr)_120px_150px_50px] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 dark:border-slate-800/70"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

                            <div className="flex-1">
                              <div className="h-3 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                              <div className="mt-2 h-2.5 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
                            </div>
                          </div>

                          <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                          <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                          <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
                        </div>
                      ))}
                    </div>

                    {/* Mobile skeleton */}
                    <div className="space-y-3 p-3 sm:p-4 lg:hidden">
                      {Array.from({
                        length: 4,
                      }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                        >
                          <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />

                          <div className="flex-1">
                            <div className="h-3 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

                            <div className="mt-2 h-2.5 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty */}
                {!loading &&
                  !error &&
                  filteredFiles.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                        {searchValue ? (
                          <Search size={27} />
                        ) : (
                          <FolderOpen size={27} />
                        )}
                      </div>

                      <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-white">
                        {searchValue
                          ? 'No files found'
                          : 'Your workspace is empty'}
                      </h3>

                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {searchValue
                          ? 'Try a different search term.'
                          : 'Upload your first file and it will appear here.'}
                      </p>

                      {searchValue && (
                        <button
                          type="button"
                          onClick={() =>
                            setSearchValue('')
                          }
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                          <X size={16} />
                          Clear search
                        </button>
                      )}
                    </div>
                  )}

                {/* Desktop table */}
                {!loading &&
                  !error &&
                  filteredFiles.length > 0 && (
                    <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:block">
                      {/* Header */}
                      <div className="grid grid-cols-[minmax(0,2fr)_120px_150px_50px] gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-950/30">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          File
                        </p>

                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Size
                        </p>

                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Uploaded
                        </p>

                        <span />
                      </div>

                      {/* Rows */}
                      {filteredFiles.map(
                        (file, index) => {
                          const Icon =
                            getFileIcon(file)

                          const fileId =
                            getFileId(file)

                          return (
                            <div
                              key={
                                fileId ||
                                `${getFileName(
                                  file
                                )}-${index}`
                              }
                              className="group grid grid-cols-[minmax(0,2fr)_120px_150px_50px] items-center gap-4 border-b border-slate-100 px-5 py-4 transition-colors last:border-0 hover:bg-slate-50/70 dark:border-slate-800/70 dark:hover:bg-slate-800/40"
                            >
                              {/* File */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenFile(
                                    file
                                  )
                                }
                                className="flex min-w-0 items-center gap-3 text-left"
                              >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400">
                                  <Icon size={20} />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-sky-600 dark:text-slate-200 dark:group-hover:text-sky-400">
                                    {getFileName(
                                      file
                                    )}
                                  </p>

                                  <p className="mt-1 truncate text-xs text-slate-400">
                                    {getFileType(
                                      file
                                    ) ||
                                      getFileExtension(
                                        getFileName(
                                          file
                                        )
                                      ).toUpperCase() ||
                                      'File'}
                                  </p>
                                </div>
                              </button>

                              {/* Size */}
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {formatFileSize(
                                  getFileSize(
                                    file
                                  )
                                )}
                              </p>

                              {/* Date */}
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {formatDate(
                                  file?.createdAt ||
                                    file?.uploadedAt ||
                                    file?.createdDate
                                )}
                              </p>

                              {/* Actions */}
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedFile(
                                    file
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 opacity-70 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100 dark:hover:bg-slate-800 dark:hover:text-white"
                                aria-label={`Actions for ${getFileName(
                                  file
                                )}`}
                              >
                                <MoreHorizontal
                                  size={18}
                                />
                              </button>
                            </div>
                          )
                        }
                      )}
                    </div>
                  )}

                {/* Mobile cards */}
                {!loading &&
                  !error &&
                  filteredFiles.length > 0 && (
                    <div className="space-y-3 lg:hidden">
                      {filteredFiles.map(
                        (file, index) => {
                          const Icon =
                            getFileIcon(file)

                          const fileId =
                            getFileId(file)

                          return (
                            <div
                              key={
                                fileId ||
                                `${getFileName(
                                  file
                                )}-${index}`
                              }
                              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                            >
                              <div className="flex items-start gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenFile(
                                      file
                                    )
                                  }
                                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400"
                                >
                                  <Icon size={20} />
                                </button>

                                <div className="min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenFile(
                                        file
                                      )
                                    }
                                    className="block max-w-full text-left"
                                  >
                                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                                      {getFileName(
                                        file
                                      )}
                                    </p>
                                  </button>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {formatFileSize(
                                      getFileSize(
                                        file
                                      )
                                    )}{' '}
                                    ·{' '}
                                    {formatDate(
                                      file?.createdAt ||
                                        file?.uploadedAt ||
                                        file?.createdDate
                                    )}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedFile(
                                      file
                                    )
                                  }
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                                  aria-label={`Actions for ${getFileName(
                                    file
                                  )}`}
                                >
                                  <MoreHorizontal
                                    size={18}
                                  />
                                </button>
                              </div>
                            </div>
                          )
                        }
                      )}
                    </div>
                  )}
              </section>
            </div>
          </main>
        </div>
      </div>

      {/* -------------------------------- */}
      {/* File actions modal */}
      {/* -------------------------------- */}

      {selectedFile && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !deleting
            ) {
              setSelectedFile(null)
            }
          }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="file-actions-title" className="my-auto max-h-[calc(100vh-1.5rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:max-h-[calc(100vh-2rem)]">
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400">
                  {(() => {
                    const Icon =
                      getFileIcon(
                        selectedFile
                      )

                    return <Icon size={20} />
                  })()}
                </div>

                <div className="min-w-0">
                  <h3 id="file-actions-title" className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {getFileName(
                      selectedFile
                    )}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(
                      getFileSize(
                        selectedFile
                      )
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedFile(null)
                }
                disabled={deleting}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Actions */}
            <div className="space-y-2 p-3 sm:p-4">
              <button
                type="button"
                onClick={() => {
                  handleOpenFile(
                    selectedFile
                  )
                  setSelectedFile(null)
                }}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Download size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">
                    Open file
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Open the file in a new tab
                  </p>
                </div>
              </button>

             <button
  type="button"
  onClick={() => {
    setShareFile(selectedFile)
    setSelectedFile(null)
  }}
  className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800"
>
  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500 dark:bg-sky-950/40 dark:text-sky-400">
    <Share2 size={18} />
  </div>

  <div>
    <p className="text-sm font-semibold text-slate-800 dark:text-white">
      Share file
    </p>

    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
      Create a secure sharing link
    </p>
  </div>
</button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-950/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">
                  {deleting ? (
                    <RefreshCw
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={18} />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {deleting
                      ? 'Deleting...'
                      : 'Delete file'}
                  </p>

                  <p className="mt-0.5 text-xs text-red-500/70 dark:text-red-400/60">
                    Permanently remove this file
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      {shareFile && (
        <ShareModal
          file={shareFile}
          onClose={() => setShareFile(null)}
        />
      )}
    </div>
  )
}

export default Dashboard