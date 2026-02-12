"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/UI/Button";
import { Input } from "@/components/UI/Input";
import { Label } from "@/components/UI/label";
import { Calendar } from "@/components/UI/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/UI/popover";
import { CalendarIcon, X, Edit2 } from "lucide-react";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { cn } from "@/lib/utils";

// Template pricing structure - all templates same price for now
const TEMPLATE_PRICING = {
  1: { day: 500, week: 3000, month: 10000 }, // Headline
  2: { day: 500, week: 3000, month: 10000 }, // Feed
  3: { day: 500, week: 3000, month: 10000 }, // Within Article
  4: { day: 500, week: 3000, month: 10000 }, // Page Wrap 1
  5: { day: 500, week: 3000, month: 10000 }, // Page Wrap 2
};

const DURATION_OPTIONS = [
  { value: 'day', label: 'Day', singular: 'day', plural: 'days' },
  { value: 'week', label: 'Week', singular: 'week', plural: 'weeks' },
  { value: 'month', label: 'Month', singular: 'month', plural: 'months' },
];

export default function AdPaymentForm({ 
  templateId, 
  templateName, 
  dimension,
  deviceType,
  onSubmit, 
  onCancel,
  initialData = null,
  isEditing = false 
}) {
  // Load from localStorage if available
  const getStoredFormData = () => {
    if (initialData) return initialData;
    
    try {
      const storageKey = `adForm_${templateId}_${deviceType}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert stored date string back to Date object
        if (parsed.startDate) {
          parsed.startDate = new Date(parsed.startDate);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading form data:', e);
    }
    
    return {
      durationType: 'week',
      customDuration: '',
      startDate: new Date(),
      notes: '',
    };
  };

  const [formData, setFormData] = useState(getStoredFormData());
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [endDate, setEndDate] = useState(null);
  const [errors, setErrors] = useState({});

  // Get pricing for this template
  const pricing = TEMPLATE_PRICING[templateId] || TEMPLATE_PRICING[1];

  // Save to localStorage whenever form data changes
  useEffect(() => {
    try {
      const storageKey = `adForm_${templateId}_${deviceType}`;
      localStorage.setItem(storageKey, JSON.stringify(formData));
    } catch (e) {
      console.error('Error saving form data:', e);
    }
  }, [formData, templateId, deviceType]);

  // Calculate price and end date
  useEffect(() => {
    const { durationType, customDuration, startDate } = formData;
    
    let price = 0;
    let calculatedEndDate = null;

    const quantity = parseInt(customDuration) || 0;
    
    if (quantity > 0) {
      price = pricing[durationType] * quantity;
      
      if (durationType === 'day') {
        calculatedEndDate = addDays(startDate, quantity);
      } else if (durationType === 'week') {
        calculatedEndDate = addWeeks(startDate, quantity);
      } else if (durationType === 'month') {
        calculatedEndDate = addMonths(startDate, quantity);
      }
    }

    setCalculatedPrice(price);
    setEndDate(calculatedEndDate);
  }, [formData, pricing]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customDuration || parseInt(formData.customDuration) < 1) {
      newErrors.customDuration = 'Please enter a valid duration';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Please select a start date';
    }

    // Check if start date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (formData.startDate < today) {
      newErrors.startDate = 'Start date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const paymentData = {
      ...formData,
      templateId,
      templateName,
      dimension,
      deviceType,
      totalPrice: calculatedPrice,
      endDate,
      pricing: {
        durationType: formData.durationType,
        rate: pricing[formData.durationType],
        quantity: parseInt(formData.customDuration),
      }
    };

    onSubmit(paymentData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit ' : ''}Ad Campaign Details
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {templateName} - {dimension} ({deviceType})
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Duration Type Selection */}
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-3 block">
            Campaign Duration Type
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {DURATION_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleInputChange('durationType', option.value)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  formData.durationType === option.value
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                )}
              >
                <div className="font-semibold">{option.label}</div>
                <div className="text-xs mt-1">
                  R{pricing[option.value].toLocaleString()} / {option.singular}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Duration Input */}
        <div>
          <Label htmlFor="duration" className="text-sm font-semibold text-gray-700">
            Number of {DURATION_OPTIONS.find(o => o.value === formData.durationType)?.plural || 'units'}
          </Label>
          <Input
            id="duration"
            type="number"
            min="1"
            placeholder={`Enter number of ${DURATION_OPTIONS.find(o => o.value === formData.durationType)?.plural || 'units'}`}
            value={formData.customDuration}
            onChange={(e) => handleInputChange('customDuration', e.target.value)}
            className={cn(
              "mt-2",
              errors.customDuration && "border-red-500"
            )}
          />
          {errors.customDuration && (
            <p className="text-red-500 text-xs mt-1">{errors.customDuration}</p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">
            Campaign Start Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.startDate && "text-muted-foreground",
                  errors.startDate && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate ? format(formData.startDate, "PPP") : "Select start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => handleInputChange('startDate', date)}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.startDate && (
            <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
          )}
        </div>

        {/* Additional Notes */}
        <div>
          <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
            Additional Notes (Optional)
          </Label>
          <textarea
            id="notes"
            placeholder="Any special instructions or notes for your campaign..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="mt-2 w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Summary Card */}
        {calculatedPrice > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold text-blue-900 mb-3">Campaign Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">Duration:</p>
                <p className="font-semibold text-gray-800">
                  {formData.customDuration} {
                    parseInt(formData.customDuration) === 1 
                      ? DURATION_OPTIONS.find(o => o.value === formData.durationType)?.singular
                      : DURATION_OPTIONS.find(o => o.value === formData.durationType)?.plural
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-600">Rate:</p>
                <p className="font-semibold text-gray-800">
                  R{pricing[formData.durationType].toLocaleString()} / {
                    DURATION_OPTIONS.find(o => o.value === formData.durationType)?.singular
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-600">Start Date:</p>
                <p className="font-semibold text-gray-800">
                  {format(formData.startDate, "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-gray-600">End Date:</p>
                <p className="font-semibold text-gray-800">
                  {endDate ? format(endDate, "MMM dd, yyyy") : "-"}
                </p>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  R{calculatedPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={calculatedPrice === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isEditing ? (
              <>
                <Edit2 className="w-4 h-4 mr-2" />
                Update & Continue
              </>
            ) : (
              'Continue to Payment'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}