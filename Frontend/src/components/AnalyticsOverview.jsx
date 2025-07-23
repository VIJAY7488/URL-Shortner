import { BarChart3, TrendingUp, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import React, { useContext, useMemo } from "react";
import { useUserAllUrls } from "../api/GetAllUserUrlsApi";
import { UrlContext } from "../context/UrlContext";

const AnalyticsOverview = () => {

    const { getAllUserUrls } = useUserAllUrls();
    const { allUrls } = useContext(UrlContext);

    console.log('getAllUserUrls' + getAllUserUrls);
    console.log(allUrls);

  const stats = useMemo(() => {
    const totalClicks = allUrls.reduce((sum, url) => sum + (url.totalClicks || 0), 0);
    const activeLinks = allUrls.filter(url => url.isActive).length;

    return [
      {
        label: "Total Links",
        icon: BarChart3,
        value: allUrls.length,
        color: "text-purple-600",
      },
      {
        label: "Total Clicks",
        icon: TrendingUp,
        value: totalClicks,
        color: "text-blue-600",
      },
      {
        label: "Active Links",
        icon: Eye,
        value: activeLinks,
        color: "text-green-600",
      },
    ];
  }, [allUrls]);


  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {stats.map(({ label, icon: Icon, value, color }) => (
        <Card
          key={label}
          className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${color}`}>
              {value ?? 0}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AnalyticsOverview;
