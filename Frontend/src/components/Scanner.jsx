import React, { useContext, useState } from "react";
import { Button } from '../components/ui/button';
import { Copy, ExternalLink, Share2, Download } from "lucide-react";
import { UrlContext } from "../context/UrlContext";
import { AuthContext } from "../context/AuthContext";

const Scanner = () => {
  const { publicUrl, userUrl } = useContext(UrlContext);
  const { isAuthenticated } = useContext(AuthContext);

  console.log(isAuthenticated)

  const activeUrl = isAuthenticated && userUrl ? userUrl : publicUrl;


  const downloadQRCode = () => {
    if (activeUrl.qrCode) {
      const link = document.createElement("a");
      link.href = activeUrl.qrCode;
      link.download = "qr-code.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">

      <div className="flex items-center justify-center h-full p-0">
          {activeUrl?.qrCode && (
            <div className="relative group">
              <img
                src={activeUrl.qrCode}
                alt="QR Code"
                className="w-48 h-full rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
        </div>
        <Button onClick={downloadQRCode} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download QR Code
        </Button>
    </div>
  );
};

export default Scanner;
