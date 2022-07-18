import { View } from 'curvature/base/View';
import { Bag } from 'curvature/base/Bag';

export class PoolView extends View
{
	template = require('./pool.html');

	constructor(args = {}, grids)
	{
		super(args);

		this.grids = grids;

		this.args.stamps = this.args.stamps || new Bag;

		this.crosshairs = new Image();
		this.crosshairs.src = '/crosshairs.png';
	}

	dragstart(event, stamp)
	{
		event.dataTransfer.setDragImage(this.crosshairs, 15, 15);
		event.dataTransfer.setData('text/plain', stamp.grid);

		stamp.r = stamp.r ?? 0;
		stamp.c = stamp.c ?? '#00FF00';

		this.activate(event, stamp);
	}

	activate(event, stamp)
	{
		for(const [name,stamp] of this.grids)
		{
			stamp.active = false;
		}

		stamp.active = true;
	}

	jump(event, stamp)
	{
		if(stamp.map)
		{
			const event = new CustomEvent('activate', {detail:{item:stamp.map}})

			stamp.map.dispatchEvent(event);
		}
	}
}
