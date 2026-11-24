import { services } from "../../data/services";
import {
  conditionOptions, emptyDetails, extraOptions, furnishingOptions,
  propertyTypes, type QuoteDetails, type QuoteErrors,
} from "./schema";

export function validateDetails(input: unknown, complete = false) {
  const errors: QuoteErrors = {};
  const details: QuoteDetails = { ...emptyDetails, extras: [] };
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { details, errors: { serviceId: "Enter your cleaning details." } as QuoteErrors };
  }
  const value = input as Record<string, unknown>;
  for (const key of Object.keys(emptyDetails) as (keyof QuoteDetails)[]) {
    if (key === "extras") continue;
    const limit = key === "requirements" || key === "otherDescription" ? 500 : key === "location" ? 120 : 64;
    if (typeof value[key] !== "string" || value[key].length > limit) {
      errors[key] = `Enter a valid value of no more than ${limit} characters.`;
    } else {
      details[key] = value[key].trim().replace(/[\u0000-\u001f\u007f]/g, " ");
    }
  }
  if (!Array.isArray(value.extras) || value.extras.length > extraOptions.length ||
      value.extras.some((item) => !extraOptions.some((option) => option.value === item))) {
    errors.extras = "Choose from the listed additional requirements.";
  } else {
    details.extras = [...new Set(value.extras)] as string[];
  }
  if (details.serviceId && !services.some((service) => service.id === details.serviceId)) errors.serviceId = "Choose a listed service.";
  if (details.property && !propertyTypes.some((item) => item === details.property)) errors.property = "Choose a listed property type.";
  if (details.furnished && !furnishingOptions.some((item) => item === details.furnished)) errors.furnished = "Choose a furnishing option.";
  if (details.condition && !conditionOptions.some((item) => item === details.condition)) errors.condition = "Choose a property condition.";
  if (details.bedrooms && !/^[0-8]$/.test(details.bedrooms)) errors.bedrooms = "Choose between 0 and 8 bedrooms.";
  if (details.bathrooms && !/^[1-6]$/.test(details.bathrooms)) errors.bathrooms = "Choose between 1 and 6 bathrooms.";
  if (details.preferredDate) {
    const date = new Date(details.preferredDate + "T00:00:00Z");
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(details.preferredDate) ||
        !Number.isFinite(date.getTime()) ||
        date.toISOString().slice(0, 10) !== details.preferredDate ||
        details.preferredDate < yesterday) errors.preferredDate = "Choose a valid upcoming date.";
  }
  if (details.serviceId !== "end-of-lease-cleaning") {
    details.bedrooms = ""; details.bathrooms = ""; details.furnished = "";
    details.condition = ""; details.extras = []; details.otherDescription = "";
    delete errors.bedrooms; delete errors.bathrooms; delete errors.furnished;
    delete errors.condition; delete errors.extras; delete errors.otherDescription;
  } else if (details.property === "studio") {
    details.bedrooms = "0";
    delete errors.bedrooms;
  }
  if (!details.extras.includes("other")) details.otherDescription = "";
  if (complete) {
    if (!details.serviceId) errors.serviceId = "Choose a cleaning service.";
    if (details.location.length < 2) errors.location = "Enter your suburb or postcode.";
    if (!details.property) errors.property = "Choose a property type.";
    if (details.serviceId === "end-of-lease-cleaning") {
      if (!details.bedrooms) errors.bedrooms = "Choose the number of bedrooms.";
      if (!details.bathrooms) errors.bathrooms = "Choose the number of bathrooms.";
      if (!details.furnished) errors.furnished = "Choose a furnishing option.";
      if (!details.condition) errors.condition = "Choose a property condition.";
      if (details.extras.includes("other") && !details.otherDescription) errors.otherDescription = "Describe your other requirements.";
    }
  }
  return { details, errors };
}
