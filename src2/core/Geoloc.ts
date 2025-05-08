export type Geo = {
    link: string
    probable_location: {
      location: {
        lat: number
        lon: number
      }
      source: string
      candidates: Array<{
        credibility: any
        date: string
        location: {
          lat: number
          lon: number
        }
        source: string
        reasons: Array<string>
      }>
    }
    result: Array<{
      _index: string
      _id: string
      _score: any
      _source: {
        _class: string
        id: string
        driver_id: string
        driver_name: string
        vehicle_id: string
        vehicle_licence: string
        mission_id: string
        mission_customer: string
        mission_comid: string
        mission_number: string
        mission_type: string
        mission_pickupname: string
        mission_dropoffname: string
        mission_passenger: string
        estimated_time_of_arrival: string
        estimated_remaining_distance: string
        origin: string
        date: string
        mission_startdate: string
        location: {
          lat: number
          lon: number
        }
      }
      sort: Array<number>
    }>
  }
  