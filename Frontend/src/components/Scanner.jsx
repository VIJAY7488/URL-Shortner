import React, { useContext, useState } from "react";
import { Copy, ExternalLink, Share2, Download } from "lucide-react";
import { AuthContext } from "../api/AuthContext";

const Scanner = () => {
  const { publicUrl } = useContext(AuthContext);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (publicUrl?.shortUrl) {
      try {
        await navigator.clipboard.writeText(publicUrl.shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share && publicUrl?.shortUrl) {
      try {
        await navigator.share({
          title: 'Share Link',
          url: publicUrl.shortUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  const handleDownload = () => {
    if (publicUrl?.qrCode) {
      const link = document.createElement('a');
      link.href = publicUrl.qrCode;
      link.download = 'qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Shorten QR Code</h2>
        <p className="text-gray-600 text-sm">Scan or share your generated link</p>
      </div>

      <div className="relative mb-8">
        <div className="w-64 h-64 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl mx-auto overflow-hidden shadow-inner">
          <div className="flex items-center justify-center h-full p-0">
            {publicUrl?.qrCode ? (
              <div className="relative group">
                <img 
                  src={publicUrl.qrCode} 
                  alt="QR Code" 
                  className="w-64 h-full rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105" 
                />

                {/* Download button overlay */}
                <button onClick={handleDownload} className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Download QR Code">
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ): (
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-8 h-8 border-2 border-gray-400 border-dashed rounded"></div>
                </div>
                <p className="text-gray-500 text-sm font-medium">QR Code will appear here</p>
                <p className="text-gray-400 text-xs mt-1">Generate a link to see your QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Link Section */}
      {publicUrl?.shortUrl && (
        <div className="space-y-4">
          {/* Link Display */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Your Short Link</h3>
              <ExternalLink
                onClick={() => {window,open(publicUrl.shortUrl)}} className="w-4 h-4 text-gray-400" />
            </div>
            <a 
            href={publicUrl.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium text-sm break-all transition-colors duration-200">
              {publicUrl.shortUrl}
            </a>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 shadow-sm">
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              {navigator.share && (
                <button 
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-medium transition-colors duration-200 shadow-sm">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
              )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-center text-xs text-gray-500">
          Share this QR code or link with others to give them quick access
        </p> 
      </div>
    </div>
  );
};

export default Scanner;



