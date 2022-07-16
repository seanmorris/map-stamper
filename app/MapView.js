import { View } from 'curvature/base/View';
import { Bag } from 'curvature/base/Bag';
import { Elicit } from 'curvature/net/Elicit';

export class MapView extends View
{
	template = require('./map.html');

	constructor(args = {}, grids)
	{
		const stamps = args.tags;

		super(args);

		this.grids = grids;

		this.args.map      = this.args.map      ?? '/sample-floorplan.jpg';
		this.args.rotation = this.args.rotation ?? 0;
		this.args.scale    = this.args.scale    ?? 1;
		this.args.tags     = new Bag;
		this.args.width    = 773;
		this.args.height   = 580;

		const elicitor = new Elicit(this.args.map);

		elicitor.dataUri().then(uri => {
			this.args.map = uri;

			const image = new Image;

			image.onload = event => {
				this.args.width  = image.width;
				this.args.height = image.height;
			}

			image.src = uri;
		});

		if(stamps)
		for(const stamp of stamps)
		{
			this.args.tags.add(stamp);
		}

		this.args.tags.addEventListener('added', event => {
			const item = event.detail.item;
			if(item.map)
			{
				item.map.args.tags.remove(item);
			}

			item.used = true;
			item.map  = this;
		});

		this.args.tags.addEventListener('removed', event => {
			event.detail.item.used = false;
			event.detail.item.map  = null;
		});

		this.crosshairs = new Image();
		this.crosshairs.src = '/crosshairs.png';
	}

	dragstart(event, stamp)
	{
		event.dataTransfer.setDragImage(this.crosshairs, 15, 15);
		event.dataTransfer.setData('text/plain', stamp.grid);
	}

	dragover(event)
	{
		event.preventDefault();
	}

	drop(event)
	{
		const mapRect = this.tags.map.node.getBoundingClientRect();

		const name  = event.dataTransfer.getData("text/plain");
		const stamp = this.grids.get(name);


		stamp.l = (event.clientX + -mapRect.x + -15) / mapRect.width;
		stamp.t = (event.clientY + -mapRect.y + -15) / mapRect.height;

		this.args.tags.add(stamp);
	}

	reset(event)
	{
		this.args.rotation = 0;
		this.args.scale = 1;
		this.args.panX  = 0;
		this.args.panY  = 0;
	};

	saveImage()
	{
		const svg = this.tags.svg.cloneNode(true);

		fetch('/app.css')
		.then(response => response.text())
		.then(response => {

			const styles = document.createElement('style');

			styles.innerHTML = response;

			svg.prepend(styles);

			this.args.rendered = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.outerHTML);

			const image = this.tags.image;

			image.node.addEventListener('load', event => {

				const canvas = this.tags.canvas;

				const context = canvas.getContext('2d');

				// context.clearRect(0, 0, canvas.width, canvas.height);

				context.drawImage(image.node, 0, 0);

				canvas.toBlob(blob => {
					showSaveFilePicker({
						suggestedName: 'grid-locations.png',
						types: [{
							description: 'PNG file',
							accept: {'image/png': ['.png']},
						}],
					}).then(handle => {
						return handle.createWritable();
					}).then(writableStream => {
						return writableStream.write(blob).then(()=> writableStream.close());
					});

				});

			}, {once:true});

		});
	}

	delete(event, stamp)
	{
		this.args.tags.delete(stamp);
	}
}
