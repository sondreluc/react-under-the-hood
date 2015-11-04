var React = require('react');

module.exports = React.createClass({
  getInitialState: function() {
    return { editing: false };
  },

  render: function() {
    return this.state.editing ? this.renderEdit() : this.renderValue()
  },

  renderValue: function() {
    var props = this.props;
    return <p onClick={this.enterEditState}>{props.item || props.defaultValue}</p>
  },

  enterEditState: function() {
    this.setState({ editing: true });
  },

  renderEdit: function() {
    return (
      <input type="text"
        autoFocus="true"
        defaultValue={this.props.item}
        onBlur={this.finishEdit}
        onKeyPress={this.checkEnter} />
    );
  },

  checkEnter: function(e) {
    if (e.key === 'Enter') {
      this.finishEdit(e);
    }
  },

  finishEdit: function(e) {
    var keyName = this.props.keyName;
    var newValue = e.target.value;
    this.props.onEdit(keyName, newValue);
    this.setState({editing: false});
  }
});
