import { Bag } from 'curvature/base/Bag';
import { MapList }  from './MapList';
import { PoolView } from './PoolView';

export class Application
{
	constructor()
	{
		this.grids  = new Map;
		this.stamps = new Bag;

		this.pool = new PoolView({stamps:this.stamps});
		this.maps = new MapList({}, this.grids);

		this.stamps.addEventListener(
			'added', event => {
				const item = event.detail.item;
				this.grids.set(item.grid, item);
			}
		);

		this.stamps.addEventListener(
			'removed', event => {
				const item = event.detail.item;
				this.grids.delete(item.grid);
			}
		);
	}
}
