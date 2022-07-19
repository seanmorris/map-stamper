import { View } from 'curvature/base/View';
import { Bag } from 'curvature/base/Bag';
import { Elicit } from 'curvature/net/Elicit';
import { Keyboard } from 'curvature/input/Keyboard';

export class MapView extends View
{
	template = require('./map.html');

	constructor(args = {}, grids)
	{
		const stamps = args.tags;

		super(args);

		this.grids = grids;

		this.args.map      = this.args.map;
		this.args.rotation = this.args.rotation ?? 0;
		this.args.scale    = this.args.scale    ?? 1;
		this.args.tags     = new Bag;
		this.args.width    = 773;
		this.args.width    = 773;
		this.args.visible  = this.args.visible ?? true;

		this.activeStamp   = null;

		const keyboard = Keyboard.get();

		let adjust = 0.001;

		keyboard.keys.bindTo('Shift', v => {
			adjust = v > 0 ? 0.01 : 0.001;
		});

		keyboard.keys.bindTo('Control', v => {
			adjust = v > 0 ? 0.0001 : 0.001;
		});

		const pause = 20;

		keyboard.keys.bindTo('ArrowRight', v => {
			if(!this.activeStamp || !this.args.visible || v <= 0) return;
			if(v > 1 && v < pause) return;
			this.activeStamp.l += adjust;
		});

		keyboard.keys.bindTo('ArrowLeft', v => {
			if(!this.activeStamp || !this.args.visible|| v <= 0) return;
			if(v > 1 && v < pause) return;
			this.activeStamp.l -= adjust;
		});

		keyboard.keys.bindTo('ArrowDown', v => {
			if(!this.activeStamp || !this.args.visible || v <= 0) return;
			if(v > 1 && v < pause) return;
			this.activeStamp.t += adjust;
		});

		keyboard.keys.bindTo('ArrowUp', v => {
			if(!this.activeStamp || !this.args.visible|| v <= 0) return;
			if(v > 1 && v < pause) return;
			this.activeStamp.t -= adjust;
		});

		keyboard.listening = true;

		this.onRemove(() => keyboard.listening = false);

		this.onFrame(() => keyboard.update());

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

	activate(event, stamp)
	{
		for(const [name,stamp] of this.grids)
		{
			stamp.active = false;
		}

		stamp.active = true;

		this.activeStamp = stamp;
	}

	drop(event)
	{
		event.preventDefault();

		const mapRect = this.tags.map.node.getBoundingClientRect();

		const name  = event.dataTransfer.getData("text/plain");
		const stamp = this.grids.get(name);

		stamp.l = (event.clientX + -mapRect.x + -15) / mapRect.width;
		stamp.t = (event.clientY + -mapRect.y + -15) / mapRect.height;

		stamp.r = stamp.r ?? 0;
		stamp.c = stamp.c ?? '#00FF00';

		this.args.tags.add(stamp);

		this.activeStamp = stamp;

	}

	reset(event)
	{
		this.args.rotation = 0;
		this.args.scale = 1;
	}

	resetRotation(event)
	{
		this.args.rotation = 0;
	}

	resetScale(event)
	{
		this.args.scale = 1;
	}

	renderImage()
	{
		this.args.rendered = '';

		const svg = this.tags.svg.cloneNode(true);

		svg.addEventListener('load', event => console.log(event));

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

		const image = this.tags.image.node;

		return new Promise(accept => {
			image.addEventListener('load', event => {

				const canvas  = this.tags.canvas;
				const context = canvas.getContext('2d');

				context.clearRect(0, 0, canvas.width, canvas.height);

				setTimeout(() => {
					context.drawImage(image, 0, 0);
					canvas.toBlob(blob => accept(blob));
				}, 100);

			}, {once: true});

			image.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.outerHTML);
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

	rotateLeft(event, stamp)
	{
		stamp.r -= 0.25;
	}

	rotateRight(event, stamp)
	{
		stamp.r += 0.25;
	}

	delete(event, stamp)
	{
		this.args.tags.delete(stamp);
	}
}
