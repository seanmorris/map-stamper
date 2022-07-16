import { Bindable } from 'curvature/base/Bindable';
import { View } from 'curvature/base/View';
import { Bag } from 'curvature/base/Bag';

import { MapView }  from './MapView';
import { PoolView } from './PoolView';

document.addEventListener('DOMContentLoaded', function() {

	const grids = new Map;

	const pool = new PoolView;
	const maps = View.from(`<div><div cv-each="maps:map">[[map]]</div><input type = "file" cv-on = "change"></div>`);

	maps.args.maps = new Bag;

	maps.change = event => {
		let reader = new FileReader();
		reader.onload = event => maps.args.maps.add(new MapView({map:event.target.result}, grids));
		reader.readAsDataURL(event.target.files[0]);
		event.target.value = null;
	};

	pool.onTimeout(500, () => pool.args.stamps.push(
		{ id: 1,  grid: 'CONQ001', x:  25, y: 25, used: ''},
		{ id: 2,  grid: 'CONQ002', x:  18, y: 16, used: ''},
		{ id: 3,  grid: 'CONQ003', x:  19, y: 25, used: ''},
		{ id: 4,  grid: 'CONQ004', x:  19, y: 13, used: ''},
		{ id: 5,  grid: 'CONQ005', x:  25, y: 21, used: ''},
		{ id: 6,  grid: 'CONQ006', x:  8,  y: 22, used: ''},
		{ id: 7,  grid: 'CONQ007', x:  6,  y: 12, used: ''},
		{ id: 8,  grid: 'CONQ008', x:  4,  y: 7 , used: ''},
		{ id: 9,  grid: 'CONQ009', x:  6,  y: 10, used: ''},
		{ id: 10, grid: 'CONQ010', x:  4,  y: 9 , used: ''},
	));

	pool.args.stamps.bindTo((v,k,t,d,p) => grids.set(v.grid, v));

	const crosshair = new Image();
	crosshair.src = '/crosshairs.png';

	pool.dragstart = (event, stamp) => {
		event.dataTransfer.setDragImage(crosshair, 15, 15);
		event.dataTransfer.setData('text/plain', stamp.grid);
	};

	pool.render(document.body);
	maps.render(document.body);
});
