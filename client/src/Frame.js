import React from 'react';
import {bin2dec, dec2bin} from './Helpers.js';
import Button from './Button.js';

class Pixel extends React.Component {
    // TODO: Change onClick to something else that allows clicking and dragging to activate several pixels at once
    render() {
        return (
            <button className={`pixel${this.props.active ? " active" : ""}`} onMouseDown={this.props.action} onMouseOver={this.props.action}></button>
        );
    }
}

class PixelRow extends React.Component {
    constructor(props) {
        super(props);
        this.bin2dec = bin2dec.bind(this);
        this.dec2bin = dec2bin.bind(this);
    }

    updateRow(e, x, y, active) {
        if(e.buttons === 1) {
            let newBin = this.dec2bin(this.props.bin);
            newBin[x] = active ? 1 : 0;
         
            let dec = this.bin2dec(newBin);
            this.props.clickHandler(y, dec);
        }
    }

    getCurrentPixelActive(x) {
        return this.dec2bin(this.props.bin)[x] === 1;
    }

    renderPixel(y, x, active) {
        return <Pixel key={"pixel" + y + "" + x} x={x} y={y} active={ active } action={e => this.updateRow(e, x, y, !active)} />;
    } 

    render() {
        return (
            <div className="pixel-row">
                {Array.from(Array(8).keys()).map((x) => 
                    this.renderPixel(this.props.y, x, this.getCurrentPixelActive(x))
                )}
            </div>
        );
    }
}

class Frame extends React.Component {
    constructor(props) {
        super(props);
        this.controlActions = this.controlActions.bind(this);
        this.clickHandler = this.clickHandler.bind(this);
        this.bin2dec = bin2dec.bind(this);
        this.dec2bin = dec2bin.bind(this);

        this.state = {
            pixelRows:  [],
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ 
            pixelRows: nextProps.frameData,
        });
    }

    renderControls() {
        return <FrameControls actions={this.controlActions()} />;
    }

    controlActions(...args) {
        args = Array.from(args); // TODO: Implement arguments, move all this somewhere else

        let undo = ()       => { return; } // TODO: Anything
        
        let flipX = ()      => { 
            let newRows = this.state.pixelRows.map(row => {
                return bin2dec(dec2bin(row).reverse());
            }); 

            return apply(newRows);
        }

        let flipY = ()      => { return apply(this.state.pixelRows.reverse()); }
        
        let invert = ()     => { 
            let newRows = this.state.pixelRows.map(row => {
                return Math.abs(row - 255);
            }); 

            return apply(newRows);
        }
        
        let mirrorX = ()    => { 
            let newRows = this.state.pixelRows.map(row => {
                let bin = dec2bin(row);
                return bin2dec([...bin.slice(0, 4), ...bin.slice(0, 4).reverse()]);
            });

            return apply(newRows);
        }
        
        let mirrorY = ()    => { 
            let newRows = [...this.state.pixelRows.slice(0, 4), ...this.state.pixelRows.slice(0, 4).reverse()];
            return apply(newRows);
        }

        let fillRandom = () => {
            return apply(Array.from({length: 8}, () => Math.floor(Math.random() * 255))); 
        }
        
        let clear = ()      => { return apply(Array(8).fill(0)); } 

        let shiftUp = ()    => { 
            let newRows = [...this.state.pixelRows.slice(1,8), this.state.pixelRows[0]];
            return apply(newRows);
        }

        let shiftDown = ()    => {
            let newRows = [this.state.pixelRows[7], ...this.state.pixelRows.slice(0,7)];
            return apply(newRows);
        }

        let shiftRight = ()    => {
            let newRows = this.state.pixelRows.map(row => {
                // Shifting 00001001 right would result in 00000100. This is a problem, because we want the pixels to "wrap around" when shifting them out of bounds.
                // However, the last bit being 1 means that the decimal value is odd. Thus, we can simply add 128 to the resulting value when one bit is pushed out.

                return parseInt(row % 2 === 1 ? (row >> 1) + 128 : row >> 1, 10) 
            });

            return apply(newRows);
        }

        let shiftLeft = ()    => { 
            // Here we kind of have the same problem as the right shift. Bits shifted off to the left will overflow the value (> 255).
            // To solve this, we can use the fact that all values >= 128 means that the first bit is 1. So, if the first bit is 1, remove 128 (i.e. setting it to 0) and then shift them.
            // Then add 1 to the shifted value to set the last bit to 1, thus effectively wrapping the bits around!

            let newRows = this.state.pixelRows.map(row => {
                return (row >= 128 ? ((row - 128) << 1) + 1: row << 1)
            });

            return apply(newRows) 
        }

        const apply = (newRows) => { // Probably rename this
            return this.props.onUpdate(this.props.eye, newRows)
        }

        return {
            modify: {
                undo: undo,
                flipX: flipX,
                flipY: flipY,
                invert: invert,
                mirrorX: mirrorX,
                mirrorY: mirrorY,
                random: fillRandom,
                clear: clear,
            },
            shift: {
                up: shiftUp,
                right: shiftRight,
                down: shiftDown,
                left: shiftLeft,
            }
        }
    }

    clickHandler(row, dec) {
        let newRows = this.state.pixelRows;
        newRows[row] = dec;

        this.props.onUpdate(this.props.eye, newRows)
    
        return;
    }

    render() {
        const rows = this.state.pixelRows.length;
        return (
            <div className="frame">
                <div className="frame-controls">
                    {this.renderControls() /* Directly mount the component maybe? */} 
                </div>
                <div className="frame-container">
                    <FrameShifter key={"shift-up"} dir={"up"} action={this.controlActions().shift.up} label="^" />
                    <FrameShifter key={"shift-left"} dir={"left"} action={this.controlActions().shift.left} label="<" />
                    <div className="frame-grid">
                        {Array.from(Array(rows).keys()).map((i) =>
                            <PixelRow y={i} clickHandler={this.clickHandler} bin={this.state.pixelRows[i]} key={"row" + i} />
                        )}
                    </div>
                    <FrameShifter key={"shift-right"} dir={"right"} action={this.controlActions().shift.right} label=">" />
                    <FrameShifter key={"shift-down"} dir={"down"} action={this.controlActions().shift.down} label="v" />
                </div>
            </div>
        );
    }
}

class FrameControls extends React.Component {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
           <div className="frame-control-group">
                {Object.keys(this.props.actions.modify).map(a => {
                    // Output buttons for all the actions from the bound function handler
                    return <Button key={"action-" + a} action={this.props.actions.modify[a]} buttonClass="frame-control" text={a} />
                    })
                }
            </div>
        );
    }
}

class FrameShifter extends React.Component {
    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <Button buttonClass={"frame-shift " + this.props.dir} action={this.props.action} text={this.props.label} />
        );
    }

}

export default Frame;