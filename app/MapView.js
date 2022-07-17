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
		event.preventDefault();

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
	};

	renderImage()
	{
		this.args.rendered = '';

		const svg = this.tags.svg.cloneNode(true);

		let style = '';

		for(const sheet of document.styleSheets)
		{
			for(const rule of sheet.cssRules)
			{
				style += rule.cssText;
			}
		}

		const styleSheet = document.createElement('style');

		styleSheet.innerHTML = style;

		svg.prepend(styleSheet);

		this.args.rendered = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.outerHTML);

		const image = this.tags.image;

		return new Promise(accept => {
			image.node.addEventListener('load', event => {

				const canvas  = this.tags.canvas;
				const context = canvas.getContext('2d');

				setTimeout(() => {
					context.clearRect(0, 0, canvas.width, canvas.height);
					context.drawImage(image.node, 0, 0);

					canvas.toBlob(blob => accept(blob));
				}, 100);
			});
		});
	}

	viewImage()
	{
		this.renderImage().then(blob => window.open(URL.createObjectURL(blob)));
	}

	saveImage()
	{
		this.renderImage().then(blob => {

			if(globalThis.showSaveFilePicker)
			{
				globalThis.showSaveFilePicker({
					suggestedName: 'grid-locations.png',
					types: [{
						description: 'PNG file',
						accept: {'image/png': ['.png']},
					}],
				}).then(handle => handle.createWritable()
				).then(writableStream => writableStream.write(blob).then(() => writableStream.close())
				).catch(error => {
					if(!(error instanceof DOMException))
					{
						console.error(error);
					}
				}).finally(() => this.args.rendered = '');

				return;
			}

			const link = document.createElement('a');

			link.setAttribute('download', 'grid-locations.png');
			link.setAttribute('href', URL.createObjectURL(blob));

			console.log(link);

			link.click();
		});
	}

	delete(event, stamp)
	{
		this.args.tags.delete(stamp);
	}
}
