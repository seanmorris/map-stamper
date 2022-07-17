import { View } from 'curvature/base/View';
import { Bag } from 'curvature/base/Bag';

export class PoolView extends View
{
	template = require('./pool.html');

	constructor(args)
	{
		super(args);

		this.args.stamps = this.args.stamps || new Bag;

		this.crosshairs = new Image();
		this.crosshairs.src = '/crosshairs.png';
	}

	dragstart(event, stamp)
	{
		event.dataTransfer.setDragImage(this.crosshairs, 15, 15);
		event.dataTransfer.setData('text/plain', stamp.grid);
	}
}
