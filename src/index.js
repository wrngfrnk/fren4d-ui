import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// TODO: Separate into different files per class if necessary
// TODO: Use a Sass loader w/ webpack to directly deal with the sass files
// TODO: Saving/loading to JSON
// TODO: Integrate with robot!

class Pixel extends React.Component {
    // TODO: Change onClick to something else that allows clicking and dragging to activate several pixels at once
    render() {
        return (
            <button className={`pixel${this.props.active ? " active" : ""}`} onClick={this.props.action}></button>
        );
    }
}

class PixelRow extends React.Component {
    // TODO: Be consistent with (x, y) vs (y, x)
    constructor(props) {
        super(props);
        this.state = {
            bin: this.props.bin
        }
    }

    updateRow(x, y, active) {
        let newBin = this.dec2bin(this.props.bin);
        newBin[x] = active ? 1 : 0;
        let dec = this.bin2dec(newBin);

        this.props.clickHandler(x, y, dec);
    }

    dec2bin(dec = 0) {
        // Return zero padded binary value of 0 to 255 as array of ints
        let bin = (dec > 255 ? 255 : dec).toString(2);
        return Array.from("00000000".substr(bin.length) + bin).map(val => parseInt(val, 10));
    }

    bin2dec(bin = Array(8).fill(0)) {
        // Return decimal representation of binary array as int
        let dec = Array.from(bin).join(''); // Convert the argument to an actual array, because we cannot call join() on arguments (the argument object is not an array)
        return parseInt(dec, 2); 
    }

    getCurrentPixelActive(x) {
        return this.dec2bin(this.props.bin)[x] === 1;
    }

    renderPixel(y, x, active) {
        return <Pixel key={"pixel" + y + "" + x} x={x} y={y} active={ active } action={e => this.updateRow(x, y, !active)} />;
    } 

    render() {
        const cols = 8
        
        return (
            <div>
                {Array.from(Array(cols).keys()).map((x) => 
                    this.renderPixel(this.props.y, x, this.getCurrentPixelActive(x))
                )}
                {this.props.bin}
            </div>
        );
    }
}

class Frame extends React.Component {
    constructor(props) {
        super(props);
        this.controlActions = this.controlActions.bind(this);
        this.clickHandler = this.clickHandler.bind(this);

        this.state = {
            pixelRows: Array(8).fill(0), 
        }
    }

    renderControls() {
        return <FrameControls actions={this.controlActions(this.state.pixelRows)} />;
    }

    renderDebug(frame) {
        return <FrameDebug frameData={frame} />;
    }

    controlActions(...args) {
        // TODO: Make it use the argument instead of current state, allowing for manipulation of single rows/cols

        let undo = ()       => { return; } // TODO: Use prevstate (and do anything at all )
        let flipX = ()      => { return; }
        let flipY = ()      => { return; }
        
        let invert = ()     => { return; }
        
        let mirrorX = ()    => { return args[0]; }
        let mirrorY = ()    => { return args[0]; }
        
        let clear = ()      => { return apply(Array(8).fill(0)); } // here too

        let shiftUp = ()    => { 
            let newRows = [...this.state.pixelRows.slice(1,8), this.state.pixelRows[0]];
            apply(newRows)
        }

        let shiftDown = ()    => {
            let newRows = [this.state.pixelRows[7], ...this.state.pixelRows.slice(0,7)];
            apply(newRows)
        }

        let shiftRight = ()    => {
            let newRows = this.state.pixelRows.map(row => {
                // Shifting 00001001 right would result in 00000100. This is a problem, because we want the pixels to "wrap around" when shifting them out of bounds.
                // However, the last bit being 1 means that the decimal value is odd. Thus, we can simply add 128 to the resulting value when one bit is pushed out.

                return parseInt(row % 2 === 1 ? (row >> 1) + 128 : row >> 1, 10) 
            });

            apply(newRows);
        }

        let shiftLeft = ()    => { 
            // Here we kind of have the same problem as the right shift. Bits shifted off to the left will overflow the value (> 255).
            // To solve this, we can use the fact that all values >= 128 means that the first bit is 1. So, if the first bit is 1, remove 128 (i.e. setting it to 0) and then shift them.
            // Then add 1 to the shifted value to set the last bit to 1, thus effectively wrapping the bits around!

            let newRows = this.state.pixelRows.map(row => {
                return (row >= 128 ? ((row - 128) << 1) + 1: row << 1)
            });

            apply(newRows) 
        }

        const apply = (newRows) => {
            return this.setState(prevState => ({
                pixelRows: newRows
            }));
        }

        return {
            modify: {
                undo: undo,
                flipX: flipX,
                flipY: flipY,
                invert: invert,
                mirrorX: mirrorX,
                mirrorY: mirrorY,
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

    clickHandler(e, y, dec) {
        let newRows = this.state.pixelRows;
        newRows[y] = dec;

        this.setState(prevState => ({
            pixelRows: newRows,
        }));
    }

    render() {
        const rows = this.state.pixelRows.length;

        return (
            <div>
                <div className="frame-controls">
                    {this.renderControls() /* Directly mount the component maybe? */} 
                </div>
                <div className="frame-container">
                    {Array.from(Array(rows).keys()).map((i) =>
                        <PixelRow y={i} clickHandler={this.clickHandler} bin={this.state.pixelRows[i]} key={"row" + i} />
                    )}
                </div>
                <div className="frame-timeline">
                    <FrameTimeline />
                </div>
                <div className="frame-debug">
                    {this.renderDebug(this.state.pixelRows)}
                </div>
            </div>
        )
    }
}

class FrameControls extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            frameTime: 0
        }
    }

    render() {
        return (
            <div>
                <div className="frame-control-group">
                    <button>Previous frame</button>
                    <button>Next frame</button>
                    <button>Duplicate last frame</button>
                    <button>Preview</button>
                </div>
                <div className="frame-control-group">
                    {Object.keys(this.props.actions.modify).map(a => {
                        // Output buttons for all the actions from the bound function handler
                        return <button key={"action-" + a} onClick={this.props.actions.modify[a]}>{a}</button>
                        })
                    }
                </div>
                <div className="frame-control-group">
                    Frame time <input type="range" min="0" max="30000" step="10" id="frameTime" onChange={e => this.setState({frameTime: e.target.value})} /> {this.state.frameTime} ms
                </div>
                <div className="frame-control-group frame-shift">
                    {Object.keys(this.props.actions.shift).map(d => {
                        return <FrameShifter key={"shift-" + d} dir={d} action={this.props.actions.shift[d]} />
                        })
                    }
                    
                </div>
            </div>
        );
    }
}

class FrameShifter extends React.Component {
    render() {
        return (
            <button className={"frame-shift-" + this.props.dir} onClick={this.props.action}>
                Shift {this.props.dir}
            </button>
        );
    }
}

class FrameTimeline extends React.Component {
    render() {
        return (
            <div>Show all frames in the animation on a timeline here</div>
        );
    }
}

class Sidebar extends React.Component {
    // ...
    render() {
        return(
            <div>
                8x8 Led Matrix Animation Creator Thing
                <div className="menu">
                    <button>Save animation</button>
                    <button>Load animation</button>
                    <button>Delete animation</button>
                </div>
            </div>
        )
    }
}

class FrameDebug extends React.Component {
    render() {
        return (
            <div>Some debug info here</div>
        );
    }
}


class Matrix extends React.Component {
  render() {
    return (
        <div id="wrapper">
            <div id="sidebar">
                <Sidebar />
            </div>
            <div id="frame-main">
                <div className="frame">
                    <Frame />
                </div>
            </div>
        </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Matrix />,
  document.getElementById('root')
);
