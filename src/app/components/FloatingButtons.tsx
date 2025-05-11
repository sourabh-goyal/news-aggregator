'use client';

import { useState, useEffect } from 'react';
import InstallButton from './InstallButton';
import UpdateNotification from './UpdateNotification';
import { MessageSquare, Download, RefreshCw } from 'lucide-react';

interface FloatingButtonsProps {
  version: string;
}

export default function FloatingButtons({ version }: FloatingButtonsProps) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [platform, setPlatform] = useState({ isIOS: false, isAndroid: false });

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setPlatform({
      isIOS: /iphone|ipad|ipod/.test(userAgent),
      isAndroid: /android/.test(userAgent)
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: feedbackType,
          message: feedbackMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      setFeedbackType('');
      setFeedbackMessage('');
      setIsFeedbackOpen(false);
    } catch (error) {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      <div className="relative">
        <button
          className="p-2 bg-blue-500 text-white rounded-full shadow-lg"
          onClick={() => setShowInstallInstructions(true)}
          aria-label="Install App"
        >
          <Download className="w-5 h-5" />
        </button>
        {showInstallInstructions && (
          <div className="absolute bottom-full right-0 mb-2 w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Install App</h3>
            {platform.isIOS ? (
              <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-medium">1</span>
                  <span>Tap the Share button <svg className="inline-block h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-medium">2</span>
                  <span>Scroll down and tap "Add to Home Screen"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-medium">3</span>
                  <span>Tap "Add" to install</span>
                </li>
              </ol>
            ) : platform.isAndroid ? (
              <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-medium">1</span>
                  <span>Open Chrome menu <svg className="inline-block h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-medium">2</span>
                  <span>Tap "Add to Home screen"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-medium">3</span>
                  <span>Tap "Add" to install</span>
                </li>
              </ol>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Click the install button above in the URL bar to add this app to your device.
              </p>
            )}
            <button
              onClick={() => setShowInstallInstructions(false)}
              className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500"
            >
              Got it
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          className="p-2 bg-green-500 text-white rounded-full shadow-lg"
          onClick={() => {
            const updateButton = document.querySelector('#update-button button');
            if (updateButton instanceof HTMLElement) {
              updateButton.click();
            }
          }}
          aria-label="Check for Updates"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="relative">
        <button
          className="p-2 bg-orange-500 text-white rounded-full shadow-lg"
          onClick={() => setIsFeedbackOpen(true)}
          aria-label="Send Feedback"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>

      {/* Hidden buttons that will be triggered by the icon buttons */}
      <div className="sr-only">
        <div id="update-button">
          <UpdateNotification version={version} />
        </div>
      </div>

      {/* Feedback Drawer */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Send Feedback</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Feedback Type</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="">Select type</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                  <option value="improvement">Improvement</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  rows={4}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 