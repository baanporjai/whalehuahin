/* Single source for shuttle info (CMS stand-in). Used by Home and shuttle.html.
   Source: hotel's "Hotel Shuttle Bus Timetable" sign (free service). */
const SHUTTLE = {
  note: 'Reserve your seat in advance.',
  phone: '+66 32 522 202',
  reserve: 'Reserve your seat at the lobby, or call +66 32 522 202, at least 30 minutes before the shuttle time.',
  routes: [
    /* The bus drops guests at three places; the times are when it leaves the hotel. */
    { id: 'out', label: 'To City Center', note: 'Drop-off at City Center (Clock Tower), Hua Hin Beach or Market Village', kind: 'dropoff',
      times: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      /* `plus` = estimated minutes after leaving the hotel. */
      stops: [{ label: 'City Center (Clock Tower)', plus: 15 }, { label: 'Hua Hin Beach', plus: 15 }, { label: 'Market Village (shopping mall)', plus: 20 }] },
    /* `times` are the City Center pick-up times; `plus` is how many minutes later the bus reaches each stop
       (the bus leaves the hotel at 10:00, 12:00 ... so City Center is +15, the beach +15, Market Village +20). */
    { id: 'back', label: 'To Whale Hua Hin', note: 'Pick-up at City Center (Clock Tower), Hua Hin Beach or Market Village', kind: 'pickup',
      times: ['10:15', '12:15', '14:15', '16:15', '18:15', '20:15', '22:15'],
      stops: [{ label: 'City Center (Clock Tower)', plus: 0 }, { label: 'Hua Hin Beach', plus: 0 }, { label: 'Market Village (shopping mall)', plus: 5 }] },
  ],
};

/* Minutes since midnight in Hua Hin, whatever the visitor's timezone */
const hotelNowMin = () => {
  const [h, m] = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok', hour12: false, hour: '2-digit', minute: '2-digit' }).split(':');
  return +h * 60 + +m;
};
const timeMin = t => +t.slice(0, 2) * 60 + +t.slice(3);
