interface ErrorAlertProps {
  message: string
  onDismiss?: () => void
}

export function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 flex items-start justify-between">
      <div>
        <p className="font-medium">Error</p>
        <p className="text-sm mt-1">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 text-red-600 hover:text-red-800 font-bold"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  )
}
