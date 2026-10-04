/* Single source for shuttle info (CMS stand-in). Used by Home and shuttle.html.
   TODO: replace placeholder stops/times with the real schedule. */
const SHUTTLE = {
  note: 'Advance reservation may be required.',
  reserve: 'Ask at the front desk, or message us on LINE.', // TODO confirm real reservation method
  stops: [
    { name: 'Hua Hin Beach', detail: 'Every hour', first: '09:00', last: '18:00', every: 60 },
    { name: 'Night Market', detail: 'Evening runs', first: '17:00', last: '22:00', every: 60 },
    { name: 'Hua Hin Town Centre', detail: 'Every 2 hours', first: '10:00', last: '20:00', every: 120 },
    { name: 'Selected stops on request', detail: 'Ask at the front desk', first: null, last: null },
  ],
};
