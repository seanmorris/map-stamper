import { View } from 'curvature/base/View';

export class PoolView extends View
{
	template = require('./pool.html');

	constructor(args)
	{
		super(args);

		this.args.stamps = [];
	}
}
