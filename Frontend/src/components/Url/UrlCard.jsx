import React, { useState, useCallback } from "react";
import { Card, CardContent } from "../ui/card";
import {
  Badge,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  LineChart,
  Lock,
  QrCode,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import Scanner from "../../components/Scanner";
import UrlBadges from "./UrlBadges";
import UrlActions from "./UrlActions";

const UrlCard = ({ url, onDeleteUrl, onAnalyticsClick, getUrlAnalytics, getDailyClick }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopy = useCallback(async (urlToCopy) => {
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(urlToCopy);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  const getUrlClickCount = useCallback((urlId) => {
    if(!urlId) return 0;

    console.log('Getting click count for URL ID:', urlId);
    const urlAnalytics = getUrlAnalytics(urlId);
    console.log('URL Analytics data:', urlAnalytics);
    if (!urlAnalytics?.recentClicks || !urlId) return 0;


    if (!urlAnalytics?.recentClicks) {
      console.log('No recentClicks found in analytics data');
      return 0;
    }
    
    // Calculate total clicks for this specific URL
    const totalClicks = urlAnalytics.recentClicks
      .filter(click => click?.urlId === urlId)
      .reduce((sum, click) => sum + (click?.count || 0), 0);
      
    console.log('Total clicks calculated:', totalClicks);
    return totalClicks;
  }, [getUrlAnalytics]);

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
              <UrlBadges url={url} />
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
                  <span>
                    Created: {format(new Date(url.createdAt), "PP")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {getUrlClickCount(url._id) || 0} clicks
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

          <UrlActions
            url={url}
            copied={copied}
            onCopy={handleCopy}
            showQR={showQR}
            setShowQR={setShowQR}
            onAnalyticsClick={onAnalyticsClick}
            onDeleteUrl={onDeleteUrl}
            getDailyClick={getDailyClick}
          />
        </div>

        {showQR && (
          <div className="mt-4 flex justify-center">
            <Scanner />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UrlCard;