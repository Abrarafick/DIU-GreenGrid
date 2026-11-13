/**
 * Solar Generation Forecasting Engine (Phase 4)
 * 
 * Capabilities:
 * - Diurnal bell-curve solar generation estimation for 850 kWp rooftop arrays
 * - Geographical solar coordinates for DIU Ashulia (23.8763° N, 90.3204° E)
 * - Future weather integration hook (cloud cover, GHI)
 * - STRICT TRANSPARENCY: Identifies when weather data is unavailable; never fabricates live weather.
 */

import { AiResultCategory, classifyDatasetReliability } from "./classifier";

export interface SolarHourlyPoint {
  hour: number;
  label: string;
  predictedKwh: number;
  predictedKw: number;
  clearSkyBenchmarkKwh: number;
  isPeakGenerationWindow: boolean;
}

export interface SolarForecastResponse {
  category: AiResultCategory;
  categoryLabel: string;
  isSimulated: boolean;
  ratedCapacityKw: number;
  estimatedNext24hYieldKwh: number;
  peakYieldHour: string;
  maxExpectedKw: number;
  weatherIntegrationStatus: "UNAVAILABLE (HISTORICAL_CLEAR_SKY_ESTIMATE)" | "ACTIVE_WEATHER_API";
  weatherNotice: string;
  cloudCoverAssumptionPercent: number | null;
  diurnalCurve: SolarHourlyPoint[];
  selfConsumptionOpportunityNotice: string;
}

export function generateSolarForecast(
  metrics: any[],
  weatherInput?: { cloudCoverPercent?: number; ghiWm2?: number; ambientTempC?: number }
): SolarForecastResponse {
  const reliability = classifyDatasetReliability(metrics);
  const ratedCapacityKw = 850.0; // 850 kWp installed DIU rooftop arrays

  // System performance ratio (PR = 0.78 accounting for inverter efficiency, dust/soiling & wiring)
  const systemPR = 0.78;

  // Weather availability check
  const isWeatherConnected = Boolean(weatherInput && weatherInput.cloudCoverPercent !== undefined);
  const weatherStatus = isWeatherConnected
    ? "ACTIVE_WEATHER_API"
    : "UNAVAILABLE (HISTORICAL_CLEAR_SKY_ESTIMATE)";
  const weatherNotice = isWeatherConnected
    ? `Satellite cloud cover index applied: ${weatherInput?.cloudCoverPercent}%.`
    : "Notice: External weather telemetry is currently disconnected. Upcoming generation is estimated using historical diurnal solar bell curves and clear-sky irradiance models. Live weather observations are strictly never fabricated.";

  const cloudFactor = isWeatherConnected
    ? Math.max(0.2, 1.0 - (weatherInput!.cloudCoverPercent! / 100) * 0.75)
    : 0.95; // Clear sky benchmark assumption

  // Ashulia daylight hours: 06:00 to 18:00 BST. Solar noon around 12:00.
  // Model diurnal solar profile: P(t) = P_rated * PR * sin(pi * (t - 6) / 12)^1.35
  const diurnalCurve: SolarHourlyPoint[] = [];
  let total24hKwh = 0;
  let maxKw = 0;
  let peakHour = "12:00 PM";

  for (let h = 0; h < 24; h++) {
    const label = `${String(h).padStart(2, "0")}:00`;
    let instantaneousKw = 0;
    let clearSkyKwh = 0;
    const isPeakWindow = h >= 10 && h <= 14;

    if (h >= 6 && h <= 18) {
      const solarFraction = Math.sin((Math.PI * (h - 6)) / 12);
      if (solarFraction > 0) {
        const clearSkyPower = ratedCapacityKw * systemPR * Math.pow(solarFraction, 1.35);
        clearSkyKwh = Number(clearSkyPower.toFixed(1));
        instantaneousKw = Number((clearSkyPower * cloudFactor).toFixed(1));
      }
    }

    const predictedKwh = instantaneousKw; // 1-hour interval: kWh = kW * 1h
    total24hKwh += predictedKwh;

    if (instantaneousKw > maxKw) {
      maxKw = instantaneousKw;
      peakHour = `${h > 12 ? h - 12 : h}:00 ${h >= 12 ? "PM" : "AM"}`;
    }

    diurnalCurve.push({
      hour: h,
      label,
      predictedKwh,
      predictedKw: instantaneousKw,
      clearSkyBenchmarkKwh: clearSkyKwh,
      isPeakGenerationWindow: isPeakWindow,
    });
  }

  return {
    category: reliability.category,
    categoryLabel: reliability.categoryLabel,
    isSimulated: reliability.isSimulated,
    ratedCapacityKw,
    estimatedNext24hYieldKwh: Number(total24hKwh.toFixed(1)),
    peakYieldHour: peakHour,
    maxExpectedKw: Number(maxKw.toFixed(1)),
    weatherIntegrationStatus: weatherStatus,
    weatherNotice,
    cloudCoverAssumptionPercent: isWeatherConnected ? weatherInput!.cloudCoverPercent! : null,
    diurnalCurve,
    selfConsumptionOpportunityNotice:
      "Peak solar generation window occurs between 10:00 AM and 02:00 PM (~580 kW peak output). Campus facilities should schedule flexible high-demand equipment (water reservoir pumps, heavy laboratory compute clusters) during this window to maximize clean renewable self-consumption.",
  };
}
