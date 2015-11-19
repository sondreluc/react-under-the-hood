var React             = require('react');
var Stars             = require('../data/Stars.js');
var StarChart         = require('./StarChart.jsx');
var ShipInfo          = require('./ShipInfo.jsx');
var Navigation        = require('./Navigation.jsx');
var SetIntervalMixin  = require('../mixins/SetIntervalMixin.jsx');
var nav               = require('../utilities/starshipNavigation.js');

var App = React.createClass({
	getInitialState: function () {
		return {
			ship: {
				info: {
					shipName: 'The Capra Enterprice',
					captain: 'Ole Martin',
					firstOfficer: 'Rune',
					tacticalOfficer: 'Nils-Kristian',
					helmsman: 'Eivind'
				},
				position: [500, 300],
				destination: {
					name: 'Sol',
					position: [500, 300],
					juristiction: 'Federation'
				},
				speed: 0
			}
		}
	},
	render: function () {
		var stars = Stars.getStarData();
		var ship = this.state.ship;
		return (
			<div>
				<StarChart starData={stars} ship={ship}/>
				<div className="helm">
					<div id="helm-header">
						<h1>Helm Control</h1>
					</div>
					<ShipInfo ship={ship} updateShip={this.updateShip} />
				</div>
			</div>
		);
	},

	updateShip: function(ship){
		this.setState({ship: ship});
	}
});
module.exports = App;