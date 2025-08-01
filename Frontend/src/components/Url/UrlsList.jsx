import React from "react";
import { Card, CardContent } from "../ui/card";
import UrlCard from "./UrlCard";

const UrlsList = ({
  filteredUrls,
  searchTerm,
  onDeleteUrl,
  onAnalyticsClick,
  getUrlAnalytics,
  getDailyClick
}) => {
  if (filteredUrls?.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 text-lg">
            {searchTerm
              ? "No URLs found matching your search."
              : "No URLs created yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {filteredUrls.map((url) => (
        <UrlCard
          key={url._id}
          url={url}
          onDeleteUrl={onDeleteUrl}
          onAnalyticsClick={onAnalyticsClick}
          getUrlAnalytics={getUrlAnalytics}
          getDailyClick={getDailyClick}
        />
      ))}
    </div>
  );
};

export default UrlsList;