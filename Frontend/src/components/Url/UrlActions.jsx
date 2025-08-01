import React from "react";
import { Button } from "../ui/button";
import {
  Check,
  Copy,
  ExternalLink,
  LineChart,
  QrCode,
  Trash2,
} from "lucide-react";

const UrlActions = ({
  url,
  copied,
  onCopy,
  showQR,
  setShowQR,
  onAnalyticsClick,
  onDeleteUrl
}) => {
  return (
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
        onClick={() => window.open(url.shortUrl, "_blank")}
        variant="outline"
        size="sm"
      >
        <ExternalLink className="h-4 w-4" />
      </Button>

      <Button
        onClick={() => setShowQR(showQR === url._id ? null : url._id)}
        variant="outline"
        size="sm"
      >
        <QrCode className="h-4 w-4" />
      </Button>

      <Button
        onClick={() => onAnalyticsClick(url)}
        variant="outline"
        size="sm"
        className="text-blue-600 hover:text-blue-700"
      >
        <LineChart className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onDeleteUrl(url._id)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default UrlActions;