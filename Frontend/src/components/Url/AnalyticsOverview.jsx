import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart3, TrendingUp, Eye } from "lucide-react";

const AnalyticsOverview = ({ totalLinks, totalClicks, activeLinks }) => {
  return (
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
            {totalLinks}
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
  );
};

export default AnalyticsOverview;