import { Check, Copy, ExternalLink, QrCode } from 'lucide-react'
import React, { useContext, useState } from 'react'
import Scanner from './Scanner'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { UrlContext } from '../context/UrlContext'
import { AuthContext } from '../context/AuthContext'

const ShortUrl = () => {
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const { publicUrl, userUrl } = useContext(UrlContext);
    const { isAuthenticated } = useContext(AuthContext);

    const activeUrl = isAuthenticated && userUrl ? userUrl : publicUrl;

    if (!activeUrl || !activeUrl.shortUrl) return null;  // Avoid rendering if no URL yet

    const handleCopy = async () => {
      if (activeUrl.shortUrl) {
        try {
          await navigator.clipboard.writeText(activeUrl.shortUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 1000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
      }
    };

  return (
    <>
    {activeUrl && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-lg font-semibold text-green-800 mb-4">
        URL Shortened Successfully! 🎉
      </h3>
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-white rounded border">
          <Input
            value={activeUrl.shortUrl}
            readOnly
            className="flex-1"
          />
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm">
            {copied ? (<Check className="h-4 w-4 text-green-500" />): (<Copy className="h-4 w-4" />)}
          </Button>

          <Button
            onClick={() => window.open(activeUrl.shortUrl, '_blank')}
            variant="outline"
            size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => setShowQR(!showQR)}
            variant="outline"
            size="sm">
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
        {showQR && (
          <div className="flex justify-center">
            <Scanner />
          </div>
        )}
      </div>
    </div>
    )}
    </>
  )
}

export default ShortUrl
