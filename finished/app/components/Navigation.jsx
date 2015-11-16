var React                = require('react');
var NavigationDashboard  = require('./NavigationDashboard.jsx');
var WarpDriveControls    = require('./WarpDriveControls.jsx');
var CourseControl        = require('./CourseControl.jsx');

module.exports = React.createClass({
  render: function() {
    var ship = this.props.ship;
    return (
      <div className="navigation">
        <NavigationDashboard ship={ship}/>
        <CourseControl
          starData={this.props.starData}
          updateDestination={this.props.updateDestination}/>
        <WarpDriveControls
          speed={ship.speed}
          updateSpeed={this.props.updateSpeed}
          engageWarpDrive={this.props.engageWarpDrive}/>
      </div>
    );
  }
});
