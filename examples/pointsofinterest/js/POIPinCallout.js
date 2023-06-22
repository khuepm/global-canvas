import { Callout } from '../../../globekit.esm.js';

/**
 * This is the definition of the callout that appears over the selected airport
 */
class POIPinCallout extends Callout {
  createElement() {
    // Uncomment this line then click on an airport to see the data object;
    // console.log(this.definition.data);

    // Here is the html element that will be attached to the coord
    const div = document.createElement('div');
    div.className = 'pin-callout';
    div.innerHTML = '<div class="callout-container"></div>';

    this.onClick = this.onClick.bind(this);
    div.addEventListener('click', this.onClick);

    return div;
  }

  // This function sets offsets for the htmlElement from the lat/lon coord
  setPosition(position) {
    const nx = position.screen.x - 21;
    const ny = position.screen.y - 60;
    this.element.style.transform = `translate(${nx.toFixed(2)}px, ${ny.toFixed(2)}px)`;
    this.element.style.zIndex = Math.round(10000 * position.screen.y);

    if (position.world.similarityToCameraVector < 0.3) {
      this.element.classList.add('hidden');
    } else {
      this.element.classList.remove('hidden');
    }
  }

  onClick() {
    this.element.dispatchEvent(new CustomEvent('pinclick', { bubbles: true, detail: this.definition }));
  }
}

export { POIPinCallout };
