import { Callout } from '../../../globekit.esm.js';

/**
 * This is the definition of the callout that appears over the selected airport
 */
class POIDetailCallout extends Callout {
  createElement() {
    // Uncomment this line then click on an airport to see the data object;
    // console.log(this.definition.data);

    // Here is the html element that will be attached to the coord
    const div = document.createElement('div');
    div.className = 'poi-callout';
    div.innerHTML = `<div class="callout-container">
      <h3>${this.definition.data.name}</h3>
      <table>
        <tbody>
          <tr>
            <td>Bigfoot Sightings:</td>
            <td>${this.definition.data.bigfoot_sightings}</td>
          </tr>
        </tbody>
      </table>
    </div>`;
    return div;
  }

  // This function sets offsets for the htmlElement from the lat/lon coord
  setPosition(position) {
    const nx = position.screen.x - 29;
    const ny = position.screen.y - 187;
    this.element.style.transform = `translate(${nx.toFixed(1)}px, ${ny.toFixed(0)}px)`;
    this.element.style.zIndex = Math.round(10000 * position.screen.y);

    if (position.world.similarityToCameraVector < 0.3) {
      this.element.classList.add('hidden');
    } else {
      this.element.classList.remove('hidden');
    }
  }
}

export { POIDetailCallout };
