import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';

import { ActivityError } from '@/components/activity/activity-error';
import { ActivityFilters } from '@/components/activity/activity-filters';
import { ActivityHeader } from '@/components/activity/activity-header';
import { ActivityLogs } from '@/components/activity/activity-logs';
import { ActivityPanel } from '@/components/activity/activity-panel';
import { ActivitySkeleton } from '@/components/activity/activity-skeleton';
import { ActivityTable } from '@/components/activity/activity-table';
import { ActivityOverview } from '@/components/activity/components/activity-overview';
import { defaultActivityFilters } from '@/components/activity/constants';
import { DashboardLayout } from '@/components/dashboard-layout';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/primitives/resizable';
import { useActivityUrlState } from '@/hooks/use-activity-url-state';
import { usePullActivity } from '@/hooks/use-pull-activity';
import { PageMeta } from '../components/page-meta';

export function ActivityFeed() {
  const { activityItemId, filters, filterValues, handleActivitySelect, handleFiltersChange } = useActivityUrlState();
  const { activity, isPending, error } = usePullActivity(activityItemId);

  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'excel' | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    // Ignore dateRange as it's always present
    if (key === 'dateRange') return false;

    // For arrays, check if they have any items
    if (Array.isArray(value)) return value.length > 0;

    // For other values, check if they exist
    return !!value;
  });

  const handleClearFilters = () => {
    handleFiltersChange(defaultActivityFilters);
  };

  const hasChanges = useMemo(() => {
    return (
      filterValues.dateRange !== defaultActivityFilters.dateRange ||
      filterValues.channels.length > 0 ||
      filterValues.workflows.length > 0 ||
      filterValues.transactionId !== defaultActivityFilters.transactionId ||
      filterValues.subscriberId !== defaultActivityFilters.subscriberId
    );
  }, [filterValues]);

  const handleTransactionIdChange = useCallback(
    (newTransactionId: string, activityId?: string) => {
      if (activityId) {
        handleActivitySelect(activityId);
      } else {
        handleFiltersChange({
          ...filterValues,
          ...(newTransactionId && { transactionId: newTransactionId }),
        });
      }
    },
    [filterValues, handleFiltersChange, handleActivitySelect]
  );

  const handleDownload = async (format: 'pdf' | 'excel') => {
    setIsDownloading(true);
    try {
      const res = await fetch(`/reports/export?format=${format}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to download report');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download report');
    } finally {
      setIsDownloading(false);
      setDownloadFormat(null);
    }
  };

  return (
    <>
      <PageMeta title="Activity Feed" />
      <DashboardLayout
        headerStartItems={
          <div className="flex items-center gap-2">
            <h1 className="text-foreground-950 flex items-center gap-1">
              <span>Activity Feed</span>
            </h1>
            <div className="relative">
              <button
                className="btn btn-primary"
                disabled={isDownloading}
                onClick={() => setDownloadFormat(downloadFormat ? null : 'pdf')}
              >
                Download Report
              </button>
              {downloadFormat && (
                <div className="absolute z-10 mt-2 w-32 rounded border bg-white shadow">
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => handleDownload('pdf')}
                    disabled={isDownloading}
                  >
                    PDF
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => handleDownload('excel')}
                    disabled={isDownloading}
                  >
                    Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        }
      >
        <ActivityFilters
          filters={filterValues}
          onFiltersChange={handleFiltersChange}
          onReset={handleClearFilters}
          showReset={hasChanges}
        />
        <div className="relative flex h-[calc(100vh-98px)]">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={70} minSize={50}>
              <ActivityTable
                selectedActivityId={activityItemId}
                onActivitySelect={handleActivitySelect}
                filters={filters}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={handleClearFilters}
              />
            </ResizablePanel>

            <AnimatePresence mode="wait">
              {activityItemId && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={35} minSize={35} maxSize={50}>
                    <motion.div
                      key={activityItemId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.2,
                      }}
                      className="bg-background h-full overflow-auto"
                    >
                      <ActivityPanel>
                        {isPending ? (
                          <ActivitySkeleton />
                        ) : error || !activity ? (
                          <ActivityError />
                        ) : (
                          <>
                            <ActivityHeader title={activity.template?.name} />
                            <ActivityOverview activity={activity} />
                            <ActivityLogs
                              activity={activity}
                              onActivitySelect={handleActivitySelect}
                              onTransactionIdChange={handleTransactionIdChange}
                            />
                          </>
                        )}
                      </ActivityPanel>
                    </motion.div>
                  </ResizablePanel>
                </>
              )}
            </AnimatePresence>
          </ResizablePanelGroup>
        </div>
      </DashboardLayout>
    </>
  );
}
