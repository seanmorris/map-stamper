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

		this.listen(
			this.args.maps
			, 'added'
			, event => {
				const map = event.detail.item;
				map.addEventListener('activate', event => this.switchTo(event, event.detail.item));
				this.switchTo(event, map);
			}
		);
	}

	change(event)
	{
		let reader = new FileReader();
		reader.onload = event => this.args.maps.add(new MapView({map:event.target.result}, this.grids));
		reader.readAsDataURL(event.target.files[0]);
		event.target.value = null;
	}

	hideAll(skip)
	{
		for(const map of this.args.maps.items())
		{
			if(map === skip)
			{
				continue;
			}

			map.args.visible = false;
		}
	}

	switchTo(event, map)
	{
		this.hideAll(map);

		this.onTimeout(100, () => map.args.visible = true);
	}
}
