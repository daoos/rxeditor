export class RXEditorCommandProxy{
  constructor(pageId){
    this.pageId = pageId
    window.addEventListener("message", (event)=>{
      if(this.pageId === event.data.pageId){
        this.handleMessage(event.data)
      }
    });

    this.focusNode = (node, pageId)=>{
      this.sendMessage({
        name: 'focusNode',
        pageId: pageId,
        node:{
          id:node.id,
          ruleName:node.ruleName,
          meta:node.meta,
          optionsSchema:node.rule.optionsSchema,
        }
      })
    }

    this.unFocusNode = (node)=>{
      this.sendMessage({
        name: 'unFocusNode',
        id: node.id,
      })
    }
  }

  rxeditorReady(){
    this.sendMessage({
      name: 'rxeditorReady'
    })
  }

  commandExcuted(canUndo, canRedo, commandSchema){
    this.sendMessage({
      name: 'commandExcuted',
      canUndo: canUndo,
      canRedo:canRedo,
      commandSchema: commandSchema,
    })
  }

  takeOverDraggingByWorkspace(){
    this.sendMessage({
      name: 'takeOverDraggingByWorkspace'
    })
  }

  saveCodeFiles(innerHTML, json){
    this.sendMessage({
      name: 'saveCodeFiles',
      innerHTML:innerHTML,
      json:json,
    })
  }


  handleMessage(message){
    //console.log('received:' + message.name + ":" + message.rxNameId)
    switch (message.name) {
      case 'requestAssemble':
        let loadedData = this.serveForRXEditor.assembleWithTheme(message.theme)
        this.sendMessage({
          name: 'replyAssemble',
          toolbox: loadedData.toolbox,
          treeViewNodes: loadedData.treeViewNodes,
        })
        break;
      case 'draggingFromToolbox':
        this.serveForRXEditor.dragFromToolbox(message.item)
        break;
      case 'endDragFromToolbox':
        this.serveForRXEditor.endDragFromToolbox(message.rxNameId)
        break;
      case 'changeCanvasState':
        this.serveForRXEditor.changeCanvasState(message.state)
        break;
      case 'nodeChanged':
        this.serveForRXEditor.nodeChanged(message.node)
        break;
      case 'undo':
        this.serveForRXEditor.undo()
        break;
      case 'redo':
        this.serveForRXEditor.redo()
        break;
      case 'download':
        this.serveForRXEditor.download()
        break;
      case 'clearCanvas':
        this.serveForRXEditor.clearCanvas()
        break;
      case 'changeTheme':
        this.serveForRXEditor.changeTheme(message.theme)
        break;
      case 'focusNodeFromSchell':
        this.serveForRXEditor.focusNodeFromShell(message.node)
        break;
    }
  }


  sendMessage(message){
    message.pageId = this.pageId
    message.canvasHeight = document.body.scrollHeight
    window.parent.postMessage(message, '/');    
  }
}

