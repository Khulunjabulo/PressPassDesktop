"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/MonetizationCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Home,
  Search,
  Bookmark,
  User,
  Monitor,
  Smartphone,
} from "lucide-react";
import Header from "@/components/UI/header";

export default function Partner() {
  const [formData, setFormData] = useState({
    advertiserNumber: "",
    advertTitle: "",
    durationMonths: "",
    dailyDisplayTime: "",
    startDate: "",
    endDate: "",
    siteSpacePM: "",
    displayMobile: false,
    displayDesktop: false,
    siteSpaceMonths: "",
    dailyDisplayTimeR10: "",
    dailyDisplayTimeDays: "",
    total: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white p-6 text-center border-b">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Allow Press Pass to find advertisers to advertise on your
            publication. Earn 50% of the revenue
          </h1>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="flex gap-8 mb-8 overflow-x-auto">
            <div className="flex-shrink-0 w-80">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Mobile Ad Placements
                </h2>
              </div>

              <Card className="p-4">
                <div className="mx-auto w-64 bg-gray-900 rounded-2xl p-2">
                  <div className="bg-white rounded-xl overflow-hidden">
                    <div className="bg-blue-500 p-3 text-white text-center">
                      <div className="text-sm font-semibold">
                        Press Pass News
                      </div>
                    </div>

                    <div className="bg-yellow-100 border-2 border-dashed border-yellow-400 p-3 m-2 text-center">
                      <div className="text-xs text-yellow-700 font-semibold">
                        AD BANNER
                      </div>
                      <div className="text-xs text-yellow-600">728x90</div>
                    </div>

                    <div className="p-3 space-y-3">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded p-3 text-white text-center">
                        <div className="bg-green-600 px-2 py-1 rounded text-xs font-semibold mb-1 inline-block">
                          Isolezwe
                        </div>
                        <div className="text-xs">Press Pass News Reader</div>
                      </div>

                      <div className="bg-red-100 border-2 border-dashed border-red-400 p-2 text-center">
                        <div className="text-xs text-red-700 font-semibold">
                          IN-FEED AD
                        </div>
                        <div className="text-xs text-red-600">300x250</div>
                      </div>

                      <div className="space-y-2">
                        {[1, 2].map((item) => (
                          <div
                            key={item}
                            className="flex space-x-2 p-2 bg-gray-50 rounded"
                          >
                            <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="h-2 bg-gray-300 rounded mb-1"></div>
                              <div className="h-1 bg-gray-200 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-green-100 border-2 border-dashed border-green-400 p-2 text-center">
                        <div className="text-xs text-green-700 font-semibold">
                          BOTTOM AD
                        </div>
                        <div className="text-xs text-green-600">320x50</div>
                      </div>
                    </div>

                    <div className="bg-blue-500 p-2">
                      <div className="flex justify-around">
                        <Home className="h-4 w-4 text-white" />
                        <Search className="h-4 w-4 text-white" />
                        <Bookmark className="h-4 w-4 text-white" />
                        <User className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex-1 min-w-96">
              <div className="flex items-center gap-2 mb-4">
                <Monitor className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Desktop Ad Placements
                </h2>
              </div>

              <Card className="p-4">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="bg-blue-500 p-3 text-white text-center mb-3 rounded">
                    <div className="font-semibold">
                      Press Pass News - Desktop
                    </div>
                  </div>

                  <div className="bg-yellow-100 border-2 border-dashed border-yellow-400 p-4 mb-4 text-center rounded">
                    <div className="text-sm text-yellow-700 font-semibold">
                      LEADERBOARD AD
                    </div>
                    <div className="text-xs text-yellow-600">728x90</div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3 space-y-3">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded p-4 text-white">
                        <div className="bg-green-600 px-3 py-1 rounded text-sm font-semibold mb-2 inline-block">
                          Isolezwe
                        </div>
                        <div className="text-sm">Featured News Story</div>
                      </div>

                      <div className="bg-red-100 border-2 border-dashed border-red-400 p-3 text-center rounded">
                        <div className="text-sm text-red-700 font-semibold">
                          CONTENT AD
                        </div>
                        <div className="text-xs text-red-600">468x60</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((item) => (
                          <div
                            key={item}
                            className="bg-white p-3 rounded shadow-sm"
                          >
                            <div className="w-full h-16 bg-gray-200 rounded mb-2"></div>
                            <div className="h-2 bg-gray-300 rounded mb-1"></div>
                            <div className="h-1 bg-gray-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-purple-100 border-2 border-dashed border-purple-400 p-3 text-center rounded">
                        <div className="text-xs text-purple-700 font-semibold">
                          SIDEBAR AD
                        </div>
                        <div className="text-xs text-purple-600">300x250</div>
                      </div>

                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="h-2 bg-gray-300 rounded mb-2"></div>
                        <div className="space-y-1">
                          <div className="h-1 bg-gray-200 rounded"></div>
                          <div className="h-1 bg-gray-200 rounded"></div>
                        </div>
                      </div>

                      <div className="bg-orange-100 border-2 border-dashed border-orange-400 p-3 text-center rounded">
                        <div className="text-xs text-orange-700 font-semibold">
                          SIDEBAR AD
                        </div>
                        <div className="text-xs text-orange-600">300x600</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="bg-blue-500 text-white">
              <CardTitle className="text-center text-xl">Advert Form</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Advertiser Information */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                      Advertiser Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="advertiser-number"
                          className="text-sm font-medium"
                        >
                          Advertiser Number
                        </Label>
                        <Input
                          id="advertiser-number"
                          placeholder="00"
                          value={formData.advertiserNumber}
                          onChange={(e) =>
                            handleInputChange(
                              "advertiserNumber",
                              e.target.value
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="advert-title"
                          className="text-sm font-medium"
                        >
                          Advert Title
                        </Label>
                        <Input
                          value={formData.advertTitle}
                          onChange={(e) =>
                            handleInputChange("advertTitle", e.target.value)
                          }
                          id="advert-title"
                          placeholder="---"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Advert Schedule */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                      Advert Schedule
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Duration of Advertisement (Months)
                          </Label>
                          <Input
                            value={formData.durationMonths}
                            onChange={(e) =>
                              handleInputChange(
                                "durationMonths",
                                e.target.value
                              )
                            }
                            placeholder="-- months"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Daily Display Time (Minutes)
                          </Label>
                          <Input
                            value={formData.dailyDisplayTime}
                            onChange={(e) =>
                              handleInputChange(
                                "dailyDisplayTime",
                                e.target.value
                              )
                            }
                            placeholder="(0)minutes = 0 hours"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Start Date
                          </Label>
                          <div className="relative mt-1">
                            <Input
                              value={formData.startDate}
                              onChange={(e) =>
                                handleInputChange("startDate", e.target.value)
                              }
                              placeholder="2025/--/--"
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            End Date
                          </Label>
                          <div className="relative mt-1">
                            <Input
                              value={formData.endDate}
                              onChange={(e) =>
                                handleInputChange("endDate", e.target.value)
                              }
                              placeholder="2025/--/--"
                            />
                            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Budget & Targeting */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                      Budget & Targeting
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Site space p.m
                        </Label>
                        <Input
                          value={formData.siteSpacePM}
                          onChange={(e) =>
                            handleInputChange("siteSpacePM", e.target.value)
                          }
                          placeholder="R-- ---"
                          className="mt-1"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Display Platforms
                        </Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="mobile"
                              checked={formData.displayMobile}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  "displayMobile",
                                  e.target.checked
                                )
                              }
                            />

                            <Label htmlFor="mobile" className="text-sm">
                              Display on Mobile Devices
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="desktop"
                              checked={formData.displayDesktop}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  "displayDesktop",
                                  e.target.checked
                                )
                              }
                            />

                            <Label htmlFor="desktop" className="text-sm">
                              Display on Desktop Platform
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Site space x month/s
                        </Label>
                        <Input
                          value={formData.siteSpaceMonths}
                          onChange={(e) =>
                            handleInputChange("siteSpaceMonths", e.target.value)
                          }
                          placeholder="R-- ---"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Daily Display Time (Minutes) x R10per minute
                        </Label>
                        <Input
                          value={formData.dailyDisplayTimeR10}
                          onChange={(e) =>
                            handleInputChange(
                              "dailyDisplayTimeR10",
                              e.target.value
                            )
                          }
                          placeholder="R-- ---"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Daily Display Time (Minutes) x days
                        </Label>
                        <Input
                          value={formData.dailyDisplayTimeDays}
                          onChange={(e) =>
                            handleInputChange(
                              "dailyDisplayTimeDays",
                              e.target.value
                            )
                          }
                          placeholder="R-- = x days = R-- ---"
                          className="mt-1"
                        />
                      </div>

                      <div className="pt-4 border-t">
                        <Label className="text-sm font-bold">Total</Label>
                        <Input
                          value={formData.total}
                          onChange={(e) =>
                            handleInputChange("total", e.target.value)
                          }
                          placeholder="R-- ---"
                          className="mt-1 font-semibold bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3">
                      Submit Advertisement Request
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
