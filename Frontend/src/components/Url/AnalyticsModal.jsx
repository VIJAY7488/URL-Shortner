import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { LineChart, Eye, Loader2 } from "lucide-react";
import { format, subDays } from "date-fns";
import AnalyticsCharts from '../AnalyticsCharts';

const AnalyticsModal = ({
  selectedUrl,
  onClose,
  getUrlAnalytics
}) => {
  
  const [isLoading, setIsLoading] = React.useState(false);

  const selectedUrlAnalytics = useMemo(() => {
    const analytics = selectedUrl?._id ? getUrlAnalytics(selectedUrl._id) : null;
    console.log('Selected URL Analytics in modal:', analytics);
    console.log('Selected URL ID:', selectedUrl?._id);
    console.log('Selected URL Analytics in modal:', analytics);
    setIsLoading(true);
    return analytics;
  }, [selectedUrl?._id, getUrlAnalytics]);

  const generateIndividualAnalyticsData = (analyticsData) => {
    const clickHistory = analyticsData?.clicksByDate || [];
    console.log('Click history for individual URL:', clickHistory);

    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const searchDate = format(date, "yyyy-MM-dd");
      const displayDate = format(date, "MMM dd");

      const clickData = clickHistory.find((click) => click.date === searchDate);

      return {
        date: displayDate,
        clicks: clickData ? clickData.clicks : 0,
      };
    });
  };

  const individualAnalyticsData = useMemo(
    () => generateIndividualAnalyticsData(selectedUrlAnalytics),
    [selectedUrlAnalytics]
  );

  console.log('Loading state:', isLoading);


  return (
    <Dialog
      open={!!selectedUrl}
      onOpenChange={(open) => !open& onClose()}
    >
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-600" />
            Analytics for {selectedUrl?.title || 'URL'}
          </DialogTitle>
        </DialogHeader> &

        {selectedUrl && (
          <div className="space-y-6">
            {/* URL Details */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="space-y-2 text-sm">
                    <span className="font-medium">Short URL:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-purple-600">
                      {selectedUrl.shortUrl}
                    </code>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium">Original:</span>
                    <span className="truncate md:break-words text-gray-700">
                      {selectedUrl.longUrl}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {selectedUrl?.createdAt && (
                      <span>
                        Created:{" "}
                        {format(new Date(selectedUrl.createdAt), "PP")}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {selectedUrlAnalytics?.totalClicks || 0} total clicks
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Analytics Charts */}
            {!isLoading ? (
              <Card className="bg-white">
                <CardContent className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-gray-600">Loading analytics...</p>
                </CardContent>
              </Card>
            ) : selectedUrlAnalytics ? (
              <AnalyticsCharts data={individualAnalyticsData} />
            ) : (
              <Card className="bg-white">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No analytics data available</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsModal;