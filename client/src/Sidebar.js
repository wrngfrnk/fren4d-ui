import React from 'react';
import Button from './Button.js'
import './Sidebar.css';

//TODO: Just testing splitting components, this is probably unnecessary.

class Sidebar extends React.Component {
    render() {
        return(
            <div id="sidebar">
                <h1>8x8 Led Matrix Animation Creator Thing</h1>
                <div className="menu">
                    {/*<Button action={this.props.actions.newAnim}    text="Save"    />
                    <Button action={this.props.actions.saveAnim}   text="Save"    />
                    <Button action={this.props.actions.loadAnim}   text="Load"    />
                    <Button action={this.props.actions.deleteAnim} text="Delete"  /> */}
                </div>
            </div>
        );
    }
}

export default Sidebar;