
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useGoogleSheetsSync } from "@/hooks/useGoogleSheetsSync";
import { RefreshCw, Upload, Clock, CheckCircle, AlertCircle } from "lucide-react";

const GoogleSheetsSync = () => {
  const [csvData, setCsvData] = useState("");
  const { isLoading, lastSyncTime, manualSync } = useGoogleSheetsSync();

  const handleManualSync = () => {
    if (!csvData.trim()) {
      return;
    }
    manualSync(csvData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <RefreshCw className="h-5 w-5 mr-2" />
          Google Sheets Sync
        </CardTitle>
        <CardDescription>
          Sync registration data from your Google Sheets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Last Sync:</span>
            <Badge variant="outline">
              {lastSyncTime ? lastSyncTime.toLocaleString() : 'Never'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <Badge className="bg-yellow-100 text-yellow-800">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Syncing...
              </Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ready
              </Badge>
            )}
          </div>
        </div>

        {/* Manual Sync Instructions */}
        <div className="space-y-3">
          <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How to sync from Google Sheets:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Open your Google Sheets document</li>
                <li>Select all data (Ctrl+A or Cmd+A)</li>
                <li>Copy the data (Ctrl+C or Cmd+C)</li>
                <li>Paste it in the text area below</li>
                <li>Click "Sync Data" to import</li>
              </ol>
            </div>
          </div>

          {/* File Upload Option */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Or upload CSV file:</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Manual Data Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">CSV Data:</label>
            <Textarea
              placeholder="Paste your CSV data here..."
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setCsvData("")}
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button
              onClick={handleManualSync}
              disabled={isLoading || !csvData.trim()}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Sync Data
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Expected CSV Format */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium mb-2">Expected CSV Format:</p>
          <code className="text-xs bg-white p-2 rounded block overflow-x-auto">
            Timestamp,First Name,Last Name,Date of Birth,Gender,Email,Phone,Purpose,Preferred Study Time,Special Requirements,Registration Experience
          </code>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleSheetsSync;
