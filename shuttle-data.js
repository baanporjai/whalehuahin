/* Single source for shuttle info (CMS stand-in). Used by Home and shuttle.html.
   Source: hotel's "Hotel Shuttle Bus Timetable" sign (free service). */
const SHUTTLE = {
  note: 'Reserve your seat in advance.',
  phone: '+66 32 522 202',
  reserve: 'Reserve your seat at the lobby, or call +66 32 522 202, at least 30 minutes before the shuttle time.',
  routes: [
    { id: 'out', label: 'To City Center', note: 'Drop-off at Baan Manthana Hotel',
      times: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '19:00', '20:00', '21:00', '22:00'] },
    { id: 'back', label: 'To Whale Hua Hin', note: 'Pick-up at Baan Manthana Hotel',
      times: ['10:15', '12:15', '14:15', '16:15', '18:15', '19:15', '20:15', '21:15', '22:15'] },
  ],
};

/* Minutes since midnight in Hua Hin, whatever the visitor's timezone */
const hotelNowMin = () => {
  const [h, m] = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Bangkok', hour12: false, hour: '2-digit', minute: '2-digit' }).split(':');
  return +h * 60 + +m;
};
const timeMin = t => +t.slice(0, 2) * 60 + +t.slice(3);
