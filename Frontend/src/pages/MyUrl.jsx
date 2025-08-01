import React, {
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";

import { UrlContext } from "../context/UrlContext";

import { useDailyClickUrl } from "../api/DailyClickApi";
import { ClickContext } from "../context/ClickContext";
import { useTotalUSerClickUrl } from "../api/TotalUserClickApi";
import Navbar from "../components/NavBar";
import { useDelete } from "../api/DeleteUrlApi";
import { AuthContext } from "../context/AuthContext";
import UrlsHeader from "../components/Url/UrlsHeader";
import AnalyticsOverview from "../components/Url/AnalyticsOverview";
import UrlsTabs from "../components/Url/UrlsTabs";
import AnalyticsModal from "../components/Url/AnalyticsModal";
import { useMutation } from "@tanstack/react-query";
import { useDeleteUrl } from "../api/DeleteUrlApi.jsx"

const MyUrl = () => {
  const { allUrls, setAllUrls } = useContext(UrlContext);
  const { totalUserClicks } = useContext(ClickContext);
  const { isAuthenticated } = useContext(AuthContext);
  

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUrl, setSelectedUrl] = useState(null);


  const { getDailyClick, getUrlAnalytics, isLoading: isDailyClickLoading } = useDailyClickUrl();
  const { totalUrlClick } = useTotalUSerClickUrl();
  // const { deleteUrlById } = useDelete();


  
  
  // Fetching Total url click
  useEffect(() => {
    if (allUrls.length > 0 && allUrls[0].user) {
      totalUrlClick(allUrls[0].user);
    }
  }, [allUrls, totalUrlClick]);



  //Get individual URL data
  useEffect(() => {
    if (selectedUrl?._id) {
      const existingData = getUrlAnalytics(selectedUrl._id);
      if (!existingData) {
        getDailyClick(selectedUrl._id);
      }
    }
  }, [selectedUrl?._id, getDailyClick, getUrlAnalytics]);


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



  const deleteMutation = useDeleteUrl((urlId) => {
    setAllUrls((prev) => prev.filter((url) => url._id !== urlId))
  })

  const handleDeleteUrl = (urlId) => {
    if (isAuthenticated) {
      deleteMutation.mutate(urlId);
    }
  }


  // Handle analytics button click
  const handleAnalyticsClick = useCallback(async (url) => {
    console.log('Analytics clicked for URL:', url);
    setSelectedUrl(url); // Set the full URL object
    
    // Check if we already have data for this URL
    const existingData = getUrlAnalytics(url._id);
    console.log('Existing analytics data:', existingData);
    
    if (!existingData) {
      console.log('Fetching new analytics data for URL ID:', url._id);
      try {
        const newData = await getDailyClick(url._id);
        console.log('Analytics data fetched successfully:', newData);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }
    }
  }, [getDailyClick, getUrlAnalytics]);



  return (
    <>
      <div className="container mx-auto py-2 relative z-10">
        <UrlsHeader />

        {/* Analytics Overview */}

        <AnalyticsOverview 
          totalLinks={allUrls?.length || 0}
          totalClicks={totalUserClicks.totalClicks}
          activeLinks={activeLinksCount}
        />
             


        <UrlsTabs
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredUrls={filteredUrls}
          totalUserClicks={totalUserClicks}
          onDeleteUrl={handleDeleteUrl}
          onAnalyticsClick={handleAnalyticsClick}
          getUrlAnalytics={getUrlAnalytics}
          getDailyClick={getDailyClick}
        />
      </div>

      {/* Individual URL Analytics Modal */}

      <AnalyticsModal
        selectedUrl={selectedUrl}
        onClose={() => setSelectedUrl(null)}
        getUrlAnalytics={getUrlAnalytics}
        isDailyClickLoading={isDailyClickLoading}
      />
    </>
  );
};

export default MyUrl;
