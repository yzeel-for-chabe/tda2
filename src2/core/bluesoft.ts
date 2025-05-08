export function parseStatusFromRequest(
    mission: any,
  ): string {
    switch (mission.MIS_SMI_ID) {
      case '1':
      case '17':
      case '15':
        return 'quotationInProgress';
      case '2':
        return 'quotationAvailable';
      case '14':
      case '16':
      case '4':
      case '11':
        return 'upcomingBooking';
      case '8':
    	if (mission.MIS_HEURE_REEL_DEBUT) {
          return 'rideStarted'
        } else {
          return 'chauffeurOnLocation';
        }
      case '9':
        return 'passengerDroppedOff';
      case '19':
      case '13':
      case '21':
        return 'closed';
      case '7':
        return 'canceled';
      case '22':
        return 'billed';
      default:
        return 'unknown';
    }
  }