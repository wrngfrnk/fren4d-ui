import React from 'react';
import Button from './Button.js'
import './Sidebar.css';

//TODO: Just testing splitting components, this is probably unnecessary.

class Sidebar extends React.Component {
    render() {
        return(
            <div>
                8x8 Led Matrix Animation Creator Thing
                <div className="menu">
                    <Button action={this.saveAnim}   text="Save"    />
                    <Button action={this.loadAnim}   text="Load"    />
                    <Button action={this.deleteAnim} text="Delete"  />
                    <Button action={this.previewAnim} text="Preview"  />
                </div>
            </div>
        );
    }
}

export default Sidebar;