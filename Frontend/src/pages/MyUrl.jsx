import React, { useContext, useState, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Badge,
  BarChart3,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  LineChart,
  Lock,
  PieChart,
  QrCode,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { UrlContext } from "../context/UrlContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import Scanner from "../components/Scanner";
import AnalyticsCharts from "../components/AnalyticsCharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { format, subDays } from "date-fns"; 
import { useDailyClickUrl } from "../api/DailyClickApi";
import { ClickContext } from "../context/ClickContext";
import { useTotalUSerClickUrl } from "../api/TotalUserClickApi";
import Navbar from "../components/NavBar";
import { useDelete } from "../api/DeleteUrlApi";
import { AuthContext } from "../context/AuthContext";

// Extract constants
const ANALYTICS_DAYS = 7;
const COPY_TIMEOUT = 1000;
const DATE_FORMAT = "yyyy-MM-dd";
const DISPLAY_DATE_FORMAT = "MMM dd";
const CREATED_DATE_FORMAT = "PP";

// Memoized URL Card Component with individual click calculation
const UrlCard = React.memo(({ 
  url, 
  copied, 
  showQR, 
  dailyClick,
  onCopy, 
  onOpenExternal, 
  onToggleQR, 
  onShowAnalytics, 
  onDelete 
}) => {
  // Calculate individual URL clicks from dailyClick data
  const urlClickCount = useMemo(() => {
    if (!dailyClick || !url._id) return url.clicks || 0;
    
    return dailyClick
      .filter(click => click.shortUrl === url._id)
      .reduce((sum, click) => sum + click.totalClicks, 0);
  }, [dailyClick, url._id, url.clicks]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {url.title && (
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {url.title}
                </h3>
              )}
              <div className="flex gap-1">
                {url.password && (
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Protected
                  </Badge>
                )}
                {url.isOneTime && (
                  <Badge variant="destructive" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    One-time
                  </Badge>
                )}
                {url.isExpired && (
                  <Badge variant="destructive" className="text-xs">
                    Expired
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">Short URL:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-purple-600">
                  {url.shortUrl}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Original:</span>
                <span className="truncate">{url.longUrl}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                {url?.createdAt && (
                  <span>Created: {format(new Date(url.createdAt), CREATED_DATE_FORMAT)}</span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {urlClickCount} clicks
                </span>
                {url.expirationDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Expires: {url.expirationDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => onCopy(url.shortUrl)}
              variant="outline"
              size="sm"
            >
              {copied === url.shortUrl ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              onClick={() => onOpenExternal(url.shortUrl)}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            <Button 
              onClick={() => onToggleQR(url._id)}
              variant="outline" 
              size="sm"
            >
              <QrCode className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => onShowAnalytics(url)}
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-700"
            >
              <LineChart className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(url._id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showQR === url._id && (
          <div className="mt-4 flex justify-center">
            <Scanner />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

UrlCard.displayName = 'UrlCard';

// Memoized Analytics Overview Component
const AnalyticsOverview = React.memo(({ totalUrls, totalClicks, activeLinks }) => (
  <div className="grid md:grid-cols-3 gap-6 mb-8">
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Total Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-purple-600">
          {totalUrls}
        </div>
      </CardContent>
    </Card>

    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Total Clicks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-blue-600">
          {totalClicks}
        </div>
      </CardContent>
    </Card>

    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Active Links
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-green-600">
          {activeLinks}
        </div>
      </CardContent>
    </Card>
  </div>
));

AnalyticsOverview.displayName = 'AnalyticsOverview';

const MyUrl = () => {
  const { allUrls, setAllUrls } = useContext(UrlContext);
  const { dailyClick, totalClicks } = useContext(ClickContext);
  const { isAuthenticated } = useContext(AuthContext);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [selectedUrl, setSelectedUrl] = useState(null);

  // API hooks
  const { getDailyClick } = useDailyClickUrl();
  const { totalUrlClick } = useTotalUSerClickUrl();
  const { deleteUrlById } = useDelete();

  // Memoized calculations
  const activeLinksCount = useMemo(() => 
    allUrls?.filter((url) => !url.isExpired).length || 0,
    [allUrls]
  );

  const filteredUrls = useMemo(() => {
    if (!searchTerm) return allUrls;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allUrls?.filter((url) =>
      url.title?.toLowerCase().includes(lowerSearchTerm) ||
      url.shortUrl?.toLowerCase().includes(lowerSearchTerm) ||
      url.longUrl?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [allUrls, searchTerm]);

  // Optimized analytics data generation
  const generateAnalyticsData = useCallback((clickData) => {
    return Array.from({ length: ANALYTICS_DAYS }, (_, i) => {
      const date = subDays(new Date(), ANALYTICS_DAYS - 1 - i);
      const formattedDate = format(date, DATE_FORMAT);

      const dayClickData = clickData?.find(
        (click) => format(new Date(click._id), DATE_FORMAT) === formattedDate
      );
      
      return {
        date: format(date, DISPLAY_DATE_FORMAT),
        clicks: dayClickData?.totalClicks || 0,
      };
    });
  }, []);

  const totalAnalyticsData = useMemo(() => 
    generateAnalyticsData(totalClicks.data),
    [totalClicks.data, generateAnalyticsData]
  );

  // Get individual URL analytics data filtered by selected URL ID
  const individualAnalyticsData = useMemo(() => {
    if (!selectedUrl?._id || !dailyClick) return [];
    
    // Filter clicks for the selected URL
    const urlClicks = dailyClick.filter(click => click.shortUrl === selectedUrl._id);
    return generateAnalyticsData(urlClicks);
  }, [dailyClick, selectedUrl?._id, generateAnalyticsData]);

  // Calculate total clicks for individual URL
  const individualTotalClicks = useMemo(() => {
    if (!selectedUrl?._id || !dailyClick) return 0;
    
    return dailyClick
      .filter(click => click.shortUrl === selectedUrl._id)
      .reduce((sum, click) => sum + click.totalClicks, 0);
  }, [dailyClick, selectedUrl?._id]);

  // Event handlers
  const handleCopy = useCallback(async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(false), COPY_TIMEOUT);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  const handleOpenExternal = useCallback((url) => {
    window.open(url, "_blank");
  }, []);

  const handleToggleQR = useCallback((urlId) => {
    setShowQR(prev => prev === urlId ? null : urlId);
  }, []);

  const handleShowAnalytics = useCallback((url) => {
    setSelectedUrl(url);
  }, []);

  const handleDeleteUrl = useCallback(async (urlId) => {
    if (!isAuthenticated) return;
    
    try {
      await deleteUrlById(urlId);
      setAllUrls((prev) => prev.filter((url) => url._id !== urlId));
    } catch (error) {
      console.error('Error deleting URL:', error);
    }
  }, [isAuthenticated, deleteUrlById, setAllUrls]);

  const handleCloseAnalytics = useCallback(() => {
    setSelectedUrl(null);
  }, []);

  // Effects
  useEffect(() => {
    if (allUrls?.length > 0 && allUrls[0]?.user) {
      totalUrlClick(allUrls[0].user);
    }
  }, [allUrls, totalUrlClick]);

  useEffect(() => {
    if (selectedUrl?._id) {
      getDailyClick(selectedUrl._id);
    }
  }, [selectedUrl?._id, getDailyClick]);

  // Early return for loading state
  if (!allUrls) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="container mx-auto py-2 relative z-10">
        <div className="mb-8 mt-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            My URLs
          </h1>
          <p className="text-gray-600 text-lg">
            Manage and track your shortened URLs
          </p>
        </div>

        {/* Analytics Overview */}
        <AnalyticsOverview 
          totalUrls={allUrls?.length || 0}
          totalClicks={totalClicks.totalClicks}
          activeLinks={activeLinksCount}
        />

        {/* Tabs for URLs and Analytics */}
        <Tabs defaultValue="urls" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="urls" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              My URLs
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="urls" className="space-y-6">
            {/* Search */}
            <div className="mb-6">
              <Input
                placeholder="Search your URLs..."
                className="max-w-md bg-white/80 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* URLs List */}
            <div className="space-y-4">
              {filteredUrls?.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500 text-lg">
                      {searchTerm
                        ? "No URLs found matching your search."
                        : "No URLs created yet."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredUrls.map((url) => (
                  <UrlCard
                    key={url._id}
                    url={url}
                    copied={copied}
                    showQR={showQR}
                    dailyClick={dailyClick}
                    onCopy={handleCopy}
                    onOpenExternal={handleOpenExternal}
                    onToggleQR={handleToggleQR}
                    onShowAnalytics={handleShowAnalytics}
                    onDelete={handleDeleteUrl}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsCharts data={totalAnalyticsData} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Individual URL Analytics Modal */}
      <Dialog open={!!selectedUrl} onOpenChange={handleCloseAnalytics}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-600" />
              Analytics for {selectedUrl?.title || 'URL'}
            </DialogTitle>
          </DialogHeader>

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
                          Created: {format(new Date(selectedUrl.createdAt), CREATED_DATE_FORMAT)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {individualTotalClicks} total clicks
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Analytics Charts */}
              <AnalyticsCharts data={individualAnalyticsData} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MyUrl;