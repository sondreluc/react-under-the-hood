var React    = require('react');
var Stars    = require('./Stars.jsx');
var Starship = require('./Starship.jsx');

module.exports = React.createClass({
  render: function() {
    var props = this.props;
    return (
      <div className="star-chart">
        <svg width="1000" height="600">
          <Stars starData={props.starData}
            updateDestination={this.props.updateDestination}/>
          <Starship ship={props.ship}/>
        </svg>
      </div>
    );
  }
});
