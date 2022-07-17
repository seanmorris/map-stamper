import { Bindable } from 'curvature/base/Bindable';
import { View } from 'curvature/base/View';

import { Application }  from './Application';

document.addEventListener('DOMContentLoaded', function() {

	const app = new Application;

	app.pool.render(document.body);
	app.maps.render(document.body);

	setTimeout(() => [

		{ id: 1,  grid: 'CONQ001', x:  25, y: 25 },
		{ id: 2,  grid: 'CONQ002', x:  18, y: 16 },
		{ id: 3,  grid: 'CONQ003', x:  19, y: 25 },
		{ id: 4,  grid: 'CONQ004', x:  19, y: 13 },
		{ id: 5,  grid: 'CONQ005', x:  25, y: 21 },
		{ id: 6,  grid: 'CONQ006', x:  8,  y: 22 },
		{ id: 7,  grid: 'CONQ007', x:  6,  y: 12 },
		{ id: 8,  grid: 'CONQ008', x:  4,  y: 7  },
		{ id: 9,  grid: 'CONQ009', x:  6,  y: 10 },
		{ id: 10, grid: 'CONQ010', x:  4,  y: 9  },
		{ id: 11, grid: 'CONQ011', x:  4,  y: 4  },

	].map(stamp => app.stamps.add(stamp)), 500);
});
