import React, { Component } from 'react';

class SaveDialog extends Component {
    render() {
        return (
            <div>
                Save animation as {this.props.filename}.json?
            </div>
        );
    }
}

export default SaveDialog;