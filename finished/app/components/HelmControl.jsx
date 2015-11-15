var React      = require('react');
var ShipInfo   = require('./ShipInfo.jsx');
var Navigation = require('./Navigation.jsx');

module.exports = React.createClass({
  render: function() {
    var ship = this.props.ship;
    var starData = this.props.starData;
    return (
      <div className="helm">
        <div id="helm-header">
          <h1>Helm Control</h1>
        </div>
        <ShipInfo
          info={ship.info}
          updateShipInfo={this.props.updateShipInfo} />
        <Navigation
          ship={ship}
          starData={starData}
          updateSpeed={this.props.updateSpeed}
          engageWarpDrive={this.props.engageWarpDrive}
          updateDestination={this.props.updateDestination}/>
      </div>
    );
  }
});
