import axios, { AxiosHeaders, type AxiosResponse } from 'axios'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GoogleMapsService } from '../../src/services/GoogleMapsService'

describe('GoogleMapsService.calculateTwoWheelerRoute', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('requests a high-quality TWO_WHEELER route and decodes its road geometry', async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-google-maps-key')
    const response: AxiosResponse<{
      routes: Array<{
        distanceMeters: number
        duration: string
        polyline: { encodedPolyline: string }
      }>
    }> = {
      data: {
        routes: [{
          distanceMeters: 1234,
          duration: '120s',
          polyline: { encodedPolyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@' },
        }],
      },
      status: 200,
      statusText: 'OK',
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
    }
    const post = vi.spyOn(axios, 'post').mockResolvedValue(response)
    const service = new GoogleMapsService()

    const route = await service.calculateTwoWheelerRoute(
      { latitude: 38.5, longitude: -120.2 },
      { latitude: 43.252, longitude: -126.453 },
    )

    expect(post).toHaveBeenCalledWith(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      expect.objectContaining({
        travelMode: 'TWO_WHEELER',
        polylineQuality: 'HIGH_QUALITY',
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Goog-Api-Key': 'test-google-maps-key',
          'X-Goog-FieldMask':
            'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline',
        }),
      }),
    )
    expect(route).toEqual({
      coordinates: [
        { latitude: 38.5, longitude: -120.2 },
        { latitude: 40.7, longitude: -120.95 },
        { latitude: 43.252, longitude: -126.453 },
      ],
      distanceMeters: 1234,
      durationSeconds: 120,
    })
  })
})