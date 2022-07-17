import { View } from 'curvature/base/View';
import { Bag } from 'curvature/base/Bag';

import { MapView } from './MapView';

export class MapList extends View
{
	template = require('./map-list.html');

	constructor(args = {}, grids)
	{
		super(args);

		this.grids = grids;

		this.args.maps = new Bag;
	}

	change(event)
	{
		let reader = new FileReader();
		reader.onload = event => this.args.maps.add(new MapView({map:event.target.result}, this.grids));
		reader.readAsDataURL(event.target.files[0]);
		event.target.value = null;
	}
}
