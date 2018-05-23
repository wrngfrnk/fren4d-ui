import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import Sidebar from './Sidebar.js';
import Button from './Button.js';
import Timeline from './Timeline.js';
import Dialog from './Dialog.js';
import CanvasFrame from './CanvasFrame.js';

// TODO: Use a Sass loader w/ webpack to directly deal with the sass files
// TODO: Saving/loading to JSON
// TODO: Integrate with robot!

class Filename extends React.PureComponent {
    constructor(props) {
        super(props);
        this.shouldUpdateName = this.shouldUpdateName.bind(this)

        this.state = {
            focus: false,
            timeout: null
        }
    }

    shouldUpdateName(newName) {
        // Use a timeout to wait for 500ms of no input before updating the name
        clearTimeout(this.state.timeout);
        const updateTimeout = setTimeout(() => {
            this.setState({
                newName: newName
            }, this.setNewName())
            return true;
        }, 500);

        this.setState({
            timeout: updateTimeout,
        }, () => false);
    }

    setNewName() {
        console.log('Updating name')
        return (() => this.props.action(this.state.newName !== '' ? this.state.newName : 'animation'))
    }

    render() {
        return (
            <div className="animation-name">
                {!this.state.focus && (<div onClick={() => this.setState({focus: true})}>{this.props.currentName || 'name'}.json</div>)}
                {this.state.focus && (
                    <input autoFocus
                        className="nameinput"
                        width="auto"
                        onBlur={() => this.setState({focus: false})} 
                        onFocus={e => {e.target.value = this.props.currentName; e.target.select()}}
                        onInput={e => this.shouldUpdateName(e.target.value)} 
                        onKeyDown={(e) => (e.key === 'Enter') ? this.setState({focus: false}) : null} 
                    />
                )}
            </div>
        );
    }
}

class App extends React.Component {
    // TODO: Let this handle currentFrame, frameTime
    constructor(props) {
        super(props);

        this.setCurrentFrame = this.setCurrentFrame.bind(this);
        this.previewAnim = this.previewAnim.bind(this);
        this.updateFrame = this.updateFrame.bind(this);
        this.saveAnimation = this.saveAnimation.bind(this);
        this.loadAnimation = this.loadAnimation.bind(this);
        this.setFileToLoad = this.setFileToLoad.bind(this);
        this.openDialogPortal = this.openDialogPortal.bind(this);

        this.state = {
            animation: {
                name: '',
                frames: [{
                    frameDataL: [],
                    frameDataR: [],
                    frameTime: 0
                }],
                mood: []
            },
            currentFrame: 0,
            showDialog: false,
            currentDialog: '',
            dialogData: {}
        }
    }

    componentDidMount() {
        let loadFilename = this.state.animation.name || 'test';

        this.newAnimation();
    }

    openDialogPortal(dialog = '', {...dialogData}) {
        console.log("Pappa?")
        this.setState({
            showDialog: true,
            currentDialog: dialog,
            dialogData: dialogData
        });
    }

    closeDialogPortal() {
        this.setState({
            showDialog: false,
        })
    }

    
    // -----
    // Frame management methods
    // -----

    getLength() {
        return this.state.animation.frames.length;
    }

    setCurrentFrame(frame = 0) {
        this.setState({
            currentFrame: frame
        });
    }

    prevFrame() {
        return (this.state.currentFrame - 1 <= 0) ? 0 : this.state.currentFrame - 1;
    }

    nextFrame() {
        let nextFrame = this.state.currentFrame + 1 === this.state.animation.frames.length ? this.state.currentFrame : this.state.currentFrame + 1;
        return nextFrame;
   }

    addFrame(newData = {frameDataL: Array(8).fill(0), frameDataR: Array(8).fill(0), frameTime: 100}) {
        let newFrames = [
            ...this.state.animation.frames.slice(0, this.state.currentFrame + 1).concat(newData),
            ...this.state.animation.frames.slice(this.state.currentFrame + 1, this.getLength())
        ]

        this.setState(prevState => ({
            animation: {
                ...prevState.animation,
                frames: newFrames
            }
        }));

        setTimeout(() => {
            this.setCurrentFrame(this.nextFrame())
        }, 10); // Ugly hack to wait for the state to be set before proceeding to the next frame.
    }

    duplicateFrame() {
        let template = JSON.parse(JSON.stringify(
            this.state.animation.frames.slice(this.state.currentFrame, this.state.currentFrame + 1)[0]
        )); // Ugly hack to deep copy template data
        
        return this.addFrame(template)
    }

    duplicateAnimation() {
        this.setState(prevState => ({
            animation: {
                ...prevState.animation,
                frames: JSON.parse(JSON.stringify(prevState.animation.frames.concat(prevState.animation.frames)))
            }
        }));
    }

    deleteFrame() {
        let newFrames = [...this.state.animation.frames.slice(0, this.state.currentFrame), ...this.state.animation.frames.slice(this.state.currentFrame + 1, this.state.animation.frames.length)];

        if(this.state.currentFrame + 1 === this.getLength()) {
            this.setCurrentFrame(this.prevFrame());
        }

        this.setState(prevState => ({
            animation: {
                ...prevState.animation,
                frames: newFrames
            }
        }));
    }

    updateFrame(eye, data) {
        let targetEye = "frameData" + (eye === 0 ? 'L' : 'R');
        let newFrame = this.state.animation.frames;
        
        newFrame[this.state.currentFrame][targetEye] = data;

        this.setState(prevState => ({
            animation: {
                ...prevState.animation,
                frames: newFrame
            }
        }));
    }

    updateFrameTime(val) {
        let newFrame = this.state.animation.frames;
        newFrame[this.state.currentFrame].frameTime = val;

        this.setState(prevState => ({
            animation: {
                ...prevState.animation,
                frames: newFrame
            }
        }));
    }

    copyLR(eye = 0) {
        let template = JSON.parse(JSON.stringify(this.state.animation.frames[this.state.currentFrame]))
        let newEye = (eye === 1) ? template.frameDataL : template.frameDataR;

        this.updateFrame(eye, newEye);
    }


    // ------
    // Animation management methods
    // ------

    previewAnim() {
        if(!this.state.previewing) {
            let saveFrame = this.state.currentFrame;
            this.setCurrentFrame();
            this.setState({
                previewing: true
            })
            let play = () => {
                setTimeout(() => {
                    if(this.state.currentFrame + 1 !== this.state.animation.frames.length) {
                        this.setCurrentFrame(this.nextFrame());
                        play();
                    } else {
                        this.setState({
                            currentFrame: saveFrame,
                            previewing: false,
                        });
                    }
                }, this.state.animation.frames[this.state.currentFrame].frameTime);
            }

            return play();
        }
    }

    setFilename(filename) {
        this.setState(prevState => ({
            animation: {
                ...prevState.animation,
                name: filename
            }
        }));
    }

    newAnimation() {
        this.setState({
            animation: {
                frames: [
                    {
                        frameDataL: Array(8).fill(0),
                        frameDataR: Array(8).fill(0),
                        frameTime: 100
                    },
                ],
                name: 'new_animation',
                mood: [],
            },
            currentFrame: 0
        });
    }

    setFileToLoad(filename) {
        if(filename !== undefined) {
            this.setState({
                fileToLoad: filename
            });
        }
    }

    loadAnimation(callback = null, filename = this.state.fileToLoad) {
        console.log("Loading file", filename)
        fetch('/frame/load/' + filename)
        .then(res => res.json())
        .then(res => this.setState({ animation: {
            ...res.animation 
        }}, callback));
    }

    saveAnimation(callback = null, filename = this.state.animation.name) {
        const url = '/frame/save/' + filename;
        const data = this.state.animation;

        fetch(url, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: new Headers({
            'Content-Type': 'application/json'
          }),
        }).then(console.log("Saved it, probably."))
        .then(callback);
    }

    render() {
        return (
            <div id="wrapper">
                {this.state.showDialog && (
                    <Dialog template={this.state.currentDialog} dialogData={this.state.dialogData} closeAction={this.closeDialogPortal.bind(this)}/>
                )}

                {this.state.previewing ? <div id="previewing">PREVIEWING...</div> : null}

                <Sidebar />

                <Filename action={this.setFilename.bind(this)} currentName={this.state.animation.name} />
                
                <Button 
                    action={this.newAnimation.bind(this)}
                    text="New Animation"
                />

                <Button
                    action={() => this.openDialogPortal('load', {
                        title: "Load animation",
                        loadAction: this.setFileToLoad,
                        actions: [
                            {
                                label: 'Load',
                                func: this.loadAnimation
                            },{
                                label: 'Cancel',
                                func: this.closeDialogPortal.bind(this)
                            }
                        ]
                    })}
                    text="Load animation"
                />
                
                <Button
                    action={() => this.openDialogPortal('save', {
                        title: "Save animation",
                        filename: this.state.animation.name,
                        actions: [
                            {
                                label: 'Save',
                                func: this.saveAnimation
                            },{
                                label: 'Cancel',
                                func: this.closeDialogPortal.bind(this)
                            }
                        ]
                    })}
                    text={"Save animation"}
                />

                <div className="frame-change">
                    <Button 
                        action={() => this.setCurrentFrame(this.prevFrame())} 
                        text="Prev frame" 
                        disabled={this.state.currentFrame === 0}
                    />

                    <Button 
                        action={() => this.addFrame()} 
                        text="Add frame" 
                    />
                    
                    <Button 
                        action={() => this.setCurrentFrame(this.nextFrame())} 
                        text="Next frame" 
                        disabled={this.state.currentFrame +1 === this.state.animation.frames.length}
                    /> 

                    <br />

                    <Button 
                        action={() => this.duplicateFrame()} 
                        text="Duplicate frame"
                    />
                    
                    <Button 
                        action={() => this.deleteFrame()} 
                        text="Delete frame"
                        disabled={this.state.animation.frames.length <= 1}
                    />
                    <Button 
                        action={() => this.duplicateAnimation()} 
                        text="Duplicate Animation"
                    />
                </div>
                <Button action={this.previewAnim} text="Preview Animation"  />
                <div id="frame-clone">
                    <Button action={() => this.copyLR(1)} text="Copy L > R" />
                    <Button action={() => this.copyLR(0)} text="Copy L < R" />
                </div>
                <div id="frame-time"> {/* TODO: Make the frametime easier to set */}
                    Frame Time: 
                    <input 
                        list="frametimes" 
                        type="range" 
                        min="10" 
                        max="1000"
                        step="10"
                        onChange={e => {this.updateFrameTime(e.target.value)}} 
                        value={this.state.animation.frames[this.state.currentFrame].frameTime}
                    /> 
                    {this.state.animation.frames[this.state.currentFrame].frameTime} ms
                </div>
                <div id="frame-main">
                    <CanvasFrame eye={0} frameData={this.state.animation.frames[this.state.currentFrame].frameDataL} onUpdate={this.updateFrame} />
                    <CanvasFrame eye={1} frameData={this.state.animation.frames[this.state.currentFrame].frameDataR} onUpdate={this.updateFrame} />
                </div>
                <Timeline frames={this.state.animation.frames} currentFrame={this.state.currentFrame} action={this.setCurrentFrame} />
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <App />,
    document.getElementById('root')
);