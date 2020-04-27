import React , {Component} from 'react';
import './App.css';
import {OBJViewer, STLViewer} from 'react-stl-obj-viewer';
import Dropzone from 'react-dropzone';
import {CubeIcon} from './components/CustomIcons';

const { ipcRenderer } = window.require('electron');
const { dialog } = window.require('electron').remote;
const fs = window.require('fs');
const path = window.require("path");
// /import electron, { ipcRenderer } from 'electron';

class App extends Component {
    constructor() {
        super();
        this.state = {
            file: null
        };
    }
    handleOnChange = (files) => {
      console.log(files)
      //console.log(e.target.files)
      const file = files[0];
      this.setState({file: null}, () => this.setState({file: file}));
    }
    componentDidMount() {
      // When the document is rendered.
      const self = this;
      ipcRenderer.on('MSG_OPEN_FILE_DIALOG', function (event, data) {
          console.log('Message received', data);
          dialog.showOpenDialog(
            {   properties: [ 'openFile']
              , filters: [{ name: 'STL Mesh, Wavefront OBJ-Arch', extensions: ['stl','obj'] }]}
            ).then(result => {
              if(!result.canceled){
                const reader = fs.readFileSync(result.filePaths[0]);
                const buffer = self.toArrayBuffer(reader);
                const fileName = path.basename(result.filePaths[0]);
                const file = new File([buffer], fileName);
                console.log(file);
                self.setState({file: null}, () => self.setState({file: file}));
              }
            });
      });
    }
    toArrayBuffer(myBuf) {
       var myBuffer = new ArrayBuffer(myBuf.length);
       var res = new Uint8Array(myBuffer);
       for (var i = 0; i < myBuf.length; ++i) {
          res[i] = myBuf[i];
       }
       return myBuffer;
    }
    render() {
        const ext = this.state.file ? this.state.file.name.slice((Math.max(0, this.state.file.name.lastIndexOf(".")) || Infinity) + 1) : null;
        const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 15;
        const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 15;
        return (
            <div className="App">
                <div className="container">
                    <Dropzone onDrop={this.handleOnChange}>
                  	{({ getRootProps, getInputProps, isDragActive }) => (
                      <section className="ant-upload ant-upload-drag">
                        <div {...getRootProps({
                          onClick: event => event.stopPropagation()
                        })}>
                          <input {...getInputProps()} />
                          <div className="centered">
                          {(!ext || isDragActive) &&
                            <div className="dropZoneInner">
                              {(!ext || isDragActive) && <p className="ant-upload-drag-icon">
                                <CubeIcon/>
                              </p>}
                              {
                                isDragActive ?
                                  <p className="ant-upload-text">Drop the files here ...</p> : !ext && <div>
                                  <p className="ant-upload-text">Drag 'n' drop some file in this area</p><p className="ant-upload-hint">
                                    Support for a STL Mesh (*.stl) and Wavefront OBJ-Arch (*.obj) files
                                  </p>
                                  </div>
                              }
                            </div>
                          }
                          </div>
                          {ext && ext.toLowerCase() === 'stl' && <STLViewer
                              onSceneRendered={(element) => {
                                  console.log(element)
                              }}
                              sceneClassName="test-scene"
                              file={this.state.file}
                              className="obj"
                              height= {h}
                              width= {w}
                              backgroundColor= "#fafafa"
                              modelColor="#5AAAE7"/>}
                          {ext && ext.toLowerCase() === 'obj' && <OBJViewer
                              onSceneRendered={(element) => {
                                  console.log(element)
                              }}
                              sceneClassName="test-scene"
                              file={this.state.file}
                              className="obj"
                              height= {h}
                              width= {w}
                              backgroundColor= "#fafafa"
                              modelColor="#5AAAE7"/>}
                        </div>
                      </section>

                  	)}
                    </Dropzone>
                </div>
            </div>
        );
    }
}

export default App;
