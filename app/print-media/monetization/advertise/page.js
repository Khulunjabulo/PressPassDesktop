"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/UI/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/MonetizationCards";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { RadioGroup, RadioGroupItem } from "@/components/UI/radio-group";
import { Checkbox } from "@/components/UI/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Upload } from "lucide-react";
import PrintMediaFooter from '@/components/UI/PrintMediaFooter';

const Header = dynamic(() => import("@/components/UI/header"), { ssr: false });

export default function Advertise() {
  const [formData, setFormData] = useState({
    fullName: "",
    jobTitle: "",
    companyName: "",
    companyWebsite: "",
    businessEmail: "",
    businessType: "",
    contentInterests: [],
    languagesOfContent: "",
    advertisingInterests: [],
    targetAudience: "",
    campaignGoals: "",
    estimatedBudget: "",
    startDateDuration: "",
    termsAccepted: false,
  });

  const handleCheckboxChange = (key, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      [key]: checked
        ? [...prev[key], value]
        : prev[key].filter((item) => item !== value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl border-2 border-blue-400">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Media Buyer Application Form
            </CardTitle>
            <CardDescription className="text-gray-600">
              Partner with us to distribute your content or advertise on our
              platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, jobTitle: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyWebsite">Company Website</Label>
                    <Input
                      id="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyWebsite: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        businessEmail: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Business Type</h3>
                <RadioGroup
                  value={formData.businessType}
                  onValueChange={(val) =>
                    setFormData({ ...formData, businessType: val })
                  }
                  className="flex flex-wrap gap-6"
                >
                  {["publisher", "advertiser", "ad-agency", "other"].map(
                    (type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <RadioGroupItem value={type} id={type} />
                        <Label htmlFor={type}>{type.replace("-", " ")}</Label>
                      </div>
                    )
                  )}
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Content Interest</h3>
                <div className="flex flex-wrap gap-6 mb-4">
                  {["Newspaper", "Magazine", "Blog"].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={item}
                        checked={formData.contentInterests.includes(item)}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "contentInterests",
                            item,
                            e.target.checked
                          )
                        }
                      />
                      <Label htmlFor={item}>{item}</Label>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Label htmlFor="languages">Languages of Content</Label>
                  <Select
                    onValueChange={(val) =>
                      setFormData({ ...formData, languagesOfContent: val })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select languages" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "english",
                        "Afrikaans",
                        "Isizulu",
                        "IsiXhosa",
                        "Sesotho",
                        "Setswana",
                        "Sepedi",
                        "Vhenda",
                        "Ndebele",
                        "Tsonga",
                      ].map((lang) => (
                        <SelectItem key={lang} value={lang}>
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Advertising Interest
                </h3>
                <div className="flex flex-wrap gap-6 mb-4">
                  {["Banner Ads", "Sponsored Articles", "Native Ads"].map(
                    (item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={item}
                          checked={formData.advertisingInterests.includes(item)}
                          onChange={(e) =>
                            handleCheckboxChange(
                              "advertisingInterests",
                              item,
                              e.target.checked
                            )
                          }
                        />
                        <Label htmlFor={item}>{item}</Label>
                      </div>
                    )
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Input
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetAudience: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaignGoals">Campaign Goals</Label>
                    <Input
                      id="campaignGoals"
                      value={formData.campaignGoals}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          campaignGoals: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="estimatedBudget">Estimated Budget</Label>
                    <Input
                      id="estimatedBudget"
                      value={formData.estimatedBudget}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          estimatedBudget: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDateDuration">
                      Start Date / Duration
                    </Label>
                    <Input
                      id="startDateDuration"
                      value={formData.startDateDuration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          startDateDuration: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Upload Media</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Upload File</p>
                    <p>Product_image.jpg, 1.2 MB</p>
                    <p className="text-blue-600 cursor-pointer hover:underline">
                      Preview
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      termsAccepted: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <span className="text-blue-600 hover:underline cursor-pointer">
                    Terms & Conditions
                  </span>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!formData.termsAccepted}
              >
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <PrintMediaFooter/>
    </>
  );
}
