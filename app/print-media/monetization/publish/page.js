"use client";

import { useState } from "react";
import { Button } from "@/components/UI/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/MonetizationCards";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Upload } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Header from "@/components/UI/header";


export default function Publish() {
  const [date, setDate] = useState(null);
  const [selectedFile, setSelectedFile] = useState("example-article.pdf");
const [publisherInfo, setPublisherInfo] = useState({
    fullName: "",
    email: "",
    organization: ""
  });
  const [articleDetails, setArticleDetails] = useState({
    title: "",
    abstract: "",
    keywords: ""
  });
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handlePublisherInfoChange = (field, value) => {
    setPublisherInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArticleDetailsChange = (field, value) => {
    setArticleDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <p className="text-base text-gray-600 leading-relaxed">
            Publish sponsored articles, local business stories, job posts and more on Press Pass and earn 85% of the revenue generated. Press Pass CPM = R250.00
          </p>
        </div>

        <Card className="w-full border-2 border-blue-500">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">Article Submission Form</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Publisher Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Publisher Information</h3>
              <div className="space-y-3">
                <Input 
  placeholder="Full Name" 
  className="w-full" 
  value={publisherInfo.fullName}
  onChange={(e) => handlePublisherInfoChange("fullName", e.target.value)}
/>
                <Input 
  placeholder="Email Address" 
  type="email" 
  className="w-full" 
  value={publisherInfo.email}
  onChange={(e) => handlePublisherInfoChange("email", e.target.value)}
/>
                <Input 
  placeholder="Organization / Affiliation" 
  className="w-full" 
  value={publisherInfo.organization}
  onChange={(e) => handlePublisherInfoChange("organization", e.target.value)}
/>
              </div>
            </div>

            {/* Article Details */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Article Details</h3>
              <div className="space-y-3">
                <Input 
  placeholder="Article Title" 
  className="w-full" 
  value={articleDetails.title}
  onChange={(e) => handleArticleDetailsChange("title", e.target.value)}
/>
                <Textarea 
  placeholder="Short Abstract / Summary (max 300 words)" 
  className="w-full min-h-[80px] resize-none" 
  value={articleDetails.abstract}
  onChange={(e) => handleArticleDetailsChange("abstract", e.target.value)}
/>
                <Input 
  placeholder="Keywords / Tags (comma-separated)" 
  className="w-full" 
  value={articleDetails.keywords}
  onChange={(e) => handleArticleDetailsChange("keywords", e.target.value)}
/>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Intended Publication Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Upload */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Upload Article Document</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Choose File
                  </Button>
                  <span className="text-sm text-gray-600">{selectedFile}</span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Maximum size: 5MB</div>
                  <div>• Accepted formats: .doc, .docx, .pdf</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Additional Notes (Optional)</h3>
              <Textarea 
  placeholder="Additional Notes" 
  className="w-full min-h-[80px] resize-none" 
  value={additionalNotes}
  onChange={(e) => setAdditionalNotes(e.target.value)}
/>
            </div>

            {/* Submit */}
            <div className="flex justify-center pt-4">
              <Button className="bg-black hover:bg-gray-800 text-white px-8">
                Submit Article
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
      </>
  );
}

