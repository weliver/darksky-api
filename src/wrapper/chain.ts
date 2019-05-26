import {
  Exclude,
  EXCLUDE_ALL,
  Extend,
  ForecastRequest,
  Language,
  NumberString,
  RequestParams,
  TimeMachineDate,
  Units
} from '../types'
import { DarkSkyBase, DarkSkyOptions } from './base'

/**
 * An implementation of DarkSkyBase that allows for chaining method calls to customize the request.
 *
 * * Note: Should only be used via [[createRequestChain]] or `DarkSky.chain`.
 *
 * @private
 * @see DarkSky
 */
export class DarkSkyRequestChain extends DarkSkyBase {
  /**
   * The request options.
   */
  private readonly request: ForecastRequest

  constructor(
    token: string,
    latitude: NumberString,
    longitude: NumberString,
    options?: Partial<DarkSkyOptions>
  ) {
    super(token, options)
    this.request = { latitude, longitude }
  }

  /**
   * Set multiple request query parameters at once using a RequestParams.
   *
   * * Note: This will override any current settings in the `requestParams` object.
   *
   * @param params Params to override the current Query parameters.
   * @returns Chain
   */
  params(params?: RequestParams) {
    if (params) {
      this.requestParams = params
    }

    return this
  }

  /**
   * Create a TimeMachine request instead of a current forecast.
   *
   * @param time Specific time to get the weather for.
   * @returns Chain
   */
  time(time: TimeMachineDate) {
    this.request.time = time
    return this
  }

  /**
   * Set the units for the response.
   *
   * @see RequestParams
   * @param units Units to use.
   * @returns Chain
   */
  units(units: Units) {
    this.requestParams.units = units
    return this
  }

  /**
   * Set the language for the response.
   *
   * @see RequestParams
   * @param language Language to use.
   * @returns Chain
   */
  language(language: Language) {
    this.requestParams.lang = language
    return this
  }

  /**
   * When true, return hour-by-hour data for the next 168 hours, instead of the next 48.
   *
   * @see RequestParams
   * @param extend Whether or not to extend the hourly results.
   * @returns Chain
   */
  extendHourly(extend: boolean = true) {
    this.requestParams.extend = extend ? Extend.HOURLY : undefined
    return this
  }

  /**
   * Exclude some number of data blocks from the API response.
   *
   * * Note: This will override any of the 'only' functions, ie `onlyCurrently`, etc.
   *
   * @see RequestParams
   * @param exclude List of datablocks to exclude from the response.
   */
  exclude(...exclude: Exclude[]) {
    this.requestParams.exclude = [...this.requestParams.exclude!, ...exclude]
    return this
  }

  /**
   * Shorthand for excluding all datablocks except for the Currently.
   *
   * @returns Chain
   */
  onlyCurrently() {
    this.requestParams.exclude = this.excludeAllBut(Exclude.CURRENTLY)
    return this
  }

  /**
   * Shorthand for excluding all datablocks except for the Minutely.
   *
   * @returns Chain
   */
  onlyMinutely() {
    this.requestParams.exclude = this.excludeAllBut(Exclude.MINUTELY)
    return this
  }

  /**
   * Shorthand for excluding all datablocks except for the Hourly.
   *
   * @returns Chain
   */
  onlyHourly() {
    this.requestParams.exclude = this.excludeAllBut(Exclude.HOURLY)
    return this
  }

  /**
   * Shorthand for excluding all datablocks except for the Daily.
   *
   * @returns Chain
   */
  onlyDaily() {
    this.requestParams.exclude = this.excludeAllBut(Exclude.DAILY)
    return this
  }

  /**
   * Execute the request and return the response wrapped in a promise.
   */
  execute() {
    const { latitude, longitude, time } = this.request

    return time
      ? this.client.timeMachine({ latitude, longitude, time }, this.requestParams)
      : this.client.forecast({ latitude, longitude }, this.requestParams)
  }

  /**
   * Takes the list of excluded datablocks and adds all the time ones except for [[include]].
   *
   * @param include Exclude all datablocks except for this one.
   */
  private excludeAllBut(include: Exclude): Exclude[] {
    return [...(this.requestParams.exclude || []), ...EXCLUDE_ALL.filter(x => x !== include)]
  }
}

/**
 * Conveience function for creating a Request Chain.
 *
 * Example usage:
 *
 * ```typescript
 * // Only get the hourly forecast, and extend it.
 * createRequestChain("api-token", 42, -42)
 *  .units(Units.CA)
 *  .extendHourly()
 *  .onlyHourly()
 *  .execute()
 * ```
 *
 * @param token DarkSky developer API token.
 * @param latitude The latitude of a location (in decimal degrees).
 * @param longitude The longitude of a location (in decimal degrees).
 * @param options Optional query params for the request.
 */
export function createRequestChain(
  token: string,
  latitude: NumberString,
  longitude: NumberString,
  options?: Partial<DarkSkyOptions>
) {
  return new DarkSkyRequestChain(token, latitude, longitude, options)
}