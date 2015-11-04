var React            = require('react');
var nav              = require('../utilities/starshipNavigation.js');
var starData         = require('../data/starData.js');
var Ship             = require('../data/Ship.js');
var StarChart        = require('./StarChart.jsx');
var ShipInfo         = require('./ShipInfo.jsx');
var Navigation       = require('./Navigation.jsx');
var SetIntervalMixin = require('../mixins/SetIntervalMixin.jsx');

module.exports = React.createClass({
  mixins: [SetIntervalMixin],

  getInitialState: function() {
    return { ship: new Ship() };
  },

  render: function() {
    var ship = this.state.ship;
    return (
      <div>
        <StarChart
          starData={starData}
          ship={ship}
          updateDestination={this.updateDestination}/>
        <div className="helm">
          <div id="helm-header">
            <h1>Helm Control</h1>
          </div>
          <ShipInfo ship={ship} updateShip={this.updateShip} />
          <Navigation
            ship={ship}
            starData={starData}
            updateSpeed={this.updateSpeed}
            engageWarpDrive={this.engageWarpDrive}
            updateDestination={this.updateDestination}/>
        </div>
      </div>
    );
  },

  updateShip: function(ship) {
    this.setState({ship: ship});
  },

  updateDestination: function(destination) {
    var ship = this.state.ship;
    ship.destination = destination;
    this.setState({ship: ship});
  },

  updateSpeed: function(newSpeed) {
    var ship = this.state.ship;
    ship.speed = newSpeed;
    this.setState({ship: ship});
  },

  engageWarpDrive: function() {
    this.setInterval(this.updateShipPosition, 10);
  },

  updateShipPosition: function() {
    var ship = this.state.ship;
    var nextPos = nav.nextPositionToDestination(ship);
    if (nav.destinationReached(ship)) {
      this.clearIntervals();
    } else {
      ship.position = nextPos;
      this.setState({ship: ship});
    }
  }
});
