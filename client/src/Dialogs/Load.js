import React, { Component } from 'react';
import Loader from './../components/Loader.js';

import './Load.css';

class FileManager extends Component {
    constructor(props) {
        super(props);

        this.selectFile = this.selectFile.bind(this);

        this.state = {
            files: [],
            done: false,
            selectedFile: null,
        }
    }

    componentDidMount() {
        fetch('/frame/list/')
            .then(res => res.json())
            .then(res => this.setState({
                files: res.files,
                status: res.status,
                done: true,
            })
        );
    }

    selectFile(i) {
        let newFile = (i !== this.state.selectedFile) ? i : null;

        this.setState(prevState => ({
            selectedFile: newFile
        }), () => {
            this.props.clickAction(this.state.files[i]);
        });

    }

    render() {
        if(this.state.done) {
            return (
                <ul className="file-manager">
                    {this.state.files.map((file, i) => {
                        return (
                            <li 
                                className={"file-line" + '' + (i === this.state.selectedFile ? ' selected' : '')}
                                key={"file-" + i} 
                                onClick={() => this.selectFile(i)}                            >
                                {file}
                            </li>
                        );
                    })}
                </ul>
            )
        } else {
            return <Loader />;
        }
    }
}

class LoadDialog extends Component {
    setFileToLoad(file) {
        this.props.loadAction(this.props.loadAction(file));
    }

    render() {
        return (
            <div>
                <FileManager clickAction={this.setFileToLoad.bind(this)} />
            </div>
        );
    }
}

export default LoadDialog;