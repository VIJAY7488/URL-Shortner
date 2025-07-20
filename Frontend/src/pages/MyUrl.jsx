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


const MyUrl = () => {
  const { allUrls } = useContext(UrlContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(null);

  const { getDailyClick } = useDailyClickUrl();
  const { dailyClick } = useContext(ClickContext);
  const { totalUrlClick } = useTotalUSerClickUrl();
  const { totalClicks } = useContext(ClickContext);



  const activeLinksCount = useMemo(() => {
    return allUrls?.filter((url) => !url.isExpired).length;
  }, [allUrls]);

  const filteredUrls = useMemo(() => {
    return allUrls?.filter(
      (url) =>
        url.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        url.shortUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        url.longUrl?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUrls, searchTerm]);

  const handleCopy = useCallback(async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  // Fetching Total url click
  useEffect(() => {
    if (allUrls.length > 0 && allUrls[0].user) {
      console.log('allUrls =>', allUrls[0].user);
      totalUrlClick(allUrls[0].user);
    }
  }, [allUrls, totalUrlClick]);


  // Generate Total analytics data
  const generateTotalAnalyticsData = () => {
    const allClickHistory = totalClicks || [];

    // Clicks over time (last 7 days)
    return Array.from({length: 7}, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const formattedDate = format(date, "yyyy-MM-dd");

      const clickData = allClickHistory.find(
        (click) => format(new Date(click._id), "yyyy-MM-dd") === formattedDate
      );  
      return {
        date: format(date, "MMM dd"),
        clicks: clickData ? clickData.totalClicks : 0,
      };
    })

    
    
  }
  const totalAnalyticsData = useMemo(() => generateTotalAnalyticsData(), [totalClicks]);


  //Get individual URL data
  useEffect(() => {
    if (selectedUrl?._id) {
      getDailyClick(selectedUrl._id);
    }
  }, [selectedUrl?._id, getDailyClick]);

  
  console.log('dailyClick:', dailyClick);

  const generateIndividualAnalyticsData = () => {
    const clickHistory = dailyClick || [];
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const formattedDate = format(date, "yyyy-MM-dd");

      const clickData = clickHistory.find(
        (click) => format(new Date(click._id), "yyyy-MM-dd") === formattedDate
      );  
      return {
        date: format(date, "MMM dd"),
        clicks: clickData ? clickData.totalClicks : 0,
      };
    });
  };

  const individualAnalyticsData = useMemo(() => generateIndividualAnalyticsData(), [dailyClick]);


  return (
    <>
    <div className="container mx-auto py-2 relative z-10">
      <Navbar/>
      <div className="mb-8 mt-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          My URLs
        </h1>
        <p className="text-gray-600 text-lg">
          Manage and track your shortened URLs
        </p>
      </div>

      {/* Analytics Overview */}
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
              {allUrls?.length || 0}
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
              {/* {totalClicks} */}
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
              {activeLinksCount}
            </div>
          </CardContent>
        </Card>
      </div>

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
                <Card
                  key={url._id}
                  className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                >
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
                              <span>Created: {format(new Date(url.createdAt), 'PP')}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {url.clicks} clicks
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
                          onClick={() => handleCopy(url.shortUrl)}
                          variant="outline"
                          size="sm"
                        >
                          {copied === url.shortUrl ? (
                            <Check className="h-4 w-4 text-green-500" />): (<Copy className="h-4 w-4" />)}
                        </Button>
                        <Button
                          onClick={() => window.open(url.shortUrl, "_blank")}
                          variant="outline"
                          size="sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>

                        {/* QR code */}
                        <Button 
                          onClick={() => setShowQR(showQR === url._id ? null : url._id)}
                          variant="outline" size="sm">
                          <QrCode className="h-4 w-4" />
                        </Button>

                        {/* Analytics */}
                        <Button
                          onClick={() => setSelectedUrl(url)}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <LineChart className="h-4 w-4" />
                        </Button>

                        {/* Delete */}
                        <Button
                          variant="outline"
                          size="sm"
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
    <Dialog open={!!selectedUrl} onOpenChange={(open) => !open && setSelectedUrl(null)} >
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <LineChart className="h-5 w-5 text-blue-600" />
            Analytics for 
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
                    <span className="truncate md:break-words text-gray-700">{selectedUrl.longUrl}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {selectedUrl?.createdAt && (
                      <span>Created: {format(new Date(selectedUrl.createdAt), 'PP')}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {selectedUrl.clicks} total clicks
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
