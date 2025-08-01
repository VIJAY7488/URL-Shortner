import React from "react";
import { Badge, Clock, Lock } from "lucide-react";

const UrlBadges = ({ url }) => {
  return (
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
  );
};

export default UrlBadges;