import React, { useContext, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge, BarChart3, Calendar, Clock, Copy, ExternalLink, Eye, Lock, QrCode, Trash2, TrendingUp } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { UrlContext } from '../context/UrlContext';

const MyUrl = () => {
  const { allUrls } = useContext(UrlContext);
  const [searchTerm, setSearchTerm] = useState('');

  const totalClicks = useMemo(() => {
    return allUrls?.reduce((acc, url) => acc + (url.clicks || 0), 0);
  }, [allUrls]);

  const activeLinksCount = useMemo(() => {
    return allUrls?.filter(url => !url.isExpired).length;
  }, [allUrls]);

  const filteredUrls = useMemo(() => {
    return allUrls?.filter(url =>
      url.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.shortUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.originalUrl?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUrls, searchTerm]);

  return (
    <div className='container mx-auto px-4 py-8 relative z-10'>
      <div className='mb-8'>
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
              {activeLinksCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for URLs and Analytics */}
      <Tabs defaultValue="urls" className="space-y-6"></Tabs>

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
                {searchTerm ? 'No URLs found matching your search.' : 'No URLs created yet.'}
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
                        <span className="truncate">{url.originalUrl}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Created:</span>
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
                      onClick={() => navigator.clipboard.writeText(url.shortUrl)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => window.open(url.shortUrl, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyUrl;
