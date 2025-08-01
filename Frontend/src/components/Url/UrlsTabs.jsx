import React, { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { BarChart3, PieChart } from "lucide-react";
import UrlSearch from "./UrlSearch";
import UrlsList from "./UrlsList";
import AnalyticsCharts from "../AnalyticsCharts";
import { format, subDays } from "date-fns";

const UrlsTabs = ({
  searchTerm,
  setSearchTerm,
  filteredUrls,
  totalUserClicks,
  onDeleteUrl,
  onAnalyticsClick,
  getUrlAnalytics,
  getDailyClick
}) => {
  // Generate Total analytics data
  const generateTotalAnalyticsData = (totalUserClicks) => {
    const allClickHistory = totalUserClicks.dailyBreakdown || [];

    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const searchDate = format(date, "yyyy-MM-dd");
      const displayDate = format(date, "MMM dd");

      const clickData = allClickHistory.find((click) => click.date === searchDate);

      return {
        date: displayDate,
        clicks: clickData ? clickData.clicks : 0,
      };
    });
  };

  const totalAnalyticsData = useMemo(
    () => generateTotalAnalyticsData(totalUserClicks),
    [totalUserClicks]
  );

  return (
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
        <UrlSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <UrlsList
          filteredUrls={filteredUrls}
          searchTerm={searchTerm}
          onDeleteUrl={onDeleteUrl}
          onAnalyticsClick={onAnalyticsClick}
          getUrlAnalytics={getUrlAnalytics}
          getDailyClick={getDailyClick}
        />
      </TabsContent>

      <TabsContent value="analytics">
        <AnalyticsCharts data={totalAnalyticsData} />
      </TabsContent>
    </Tabs>
  );
};

export default UrlsTabs;