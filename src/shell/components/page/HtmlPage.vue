<template>
  <div class="html-page">
    <div class="page-toolbar">
      <div class="left">
        <div class="icon-button big" 
          :class="size === 'xl' ? 'active' :''"
          @click="resizeScreen('xl')"
          title = "XL"
        >
          <i class="fas fa-tv"></i>
        </div>
        <div class="icon-button"
          :class="size === 'lg' ? 'active' :''"
          @click="resizeScreen('lg')"
          title = "LG"
        >
          <i class="fas fa-desktop"></i>
        </div>
        <div class="icon-button"
          :class="size === 'md' ? 'active' :''"
          @click="resizeScreen('md')"
          title = "MD"
        >
          <i class="fas fa-laptop"></i>
        </div>
        <div class="icon-button"
          :class="size === 'sm' ? 'active' :''"
          @click="resizeScreen('sm')"
          title = "SM"
        >
          <i class="fas fa-tablet-alt"></i>
        </div>
        <div class="icon-button"
          :class="size === 'xs' ? 'active' :''"
          @click="resizeScreen('xs')"
          title = "XS"
        >
          <i class="fas fa-mobile-alt"></i>
        </div>
      </div>
      <div class="center">Mini Toolbar</div>
      <div class="right">
        <div class="icon-button">
          <i class="far fa-square"></i>
        </div>
        <div class="icon-button">
          <i class="fas fa-arrows-alt-h"></i>
        </div>
        <div class="icon-button">
          <i class="fas fa-arrows-alt-v"></i>
        </div>
        <div class="icon-button">
          <i class="fas fa-eye"></i>
        </div>
        <div class="icon-button">
          <i class="fas fa-code"></i>
        </div>
        <div class="icon-button">
          <i class="fas fa-undo"></i>
        </div>
        <div class="icon-button">
          <i class="fas fa-redo"></i>
        </div>
        <div class="icon-button">
          <i class="fas fa-trash-alt"></i>
        </div>
        <div class="icon-button">
          <i class="fas fa-cog"></i>
        </div>
      </div>
    </div>
    <div class="page-content">
      <!-- 需要动态设定高度，当内容有变化时设定 -->
      <div class="canvas"
        :style = "{width:width}"
      >
        <iframe src="javascrip:0" 
          scrolling="no" 
          frame-border ="0"
          border = "0"
          allow-transparency = "no"
          :height="canvasHeight" 
          ref ="canvasFrame"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import {IFrameCommandProxy} from "./iframe-command-porxy.js"

export default {
  name: 'HtmlPage',
  components:{
  },
  props:{
    value:{ default:()=>{return{}} },
    breakpoints : {
      default : ()=>{ 
        this.xs = '490'
        this.sm = '576'
        this.md = '768'
        this.lg = '992'
        this.xl = '1200'
        return this
      }
    }, 
  },
  data () {
    return {
      size : 'md',
      content:`<div class="container"></div>`,
      commandProxy: new IFrameCommandProxy(this._uid),
      //actived: false,
      canvasHeight: '100%',
    }
  },
  computed:{
    inputValue: {
        get:function() {
          return this.value;
        },
        set:function(val) {
          this.$emit('input', val);
        },
    },

    actived(){
      return this.inputValue === this.$store.state.activedFile
    },

    width(){
      return this.breakpoints[this.size] + 'px'
    }
  },

  mounted () {
    this.pageId = this._uid
    this.commandProxy.serveForShell = this
    this.commandProxy.iframe = this.$refs.canvasFrame
    //$bus.$on('activedFile', this.onFileActived)
    $bus.$on('draggingFromToolbox', this.draggingFromToolbox)
    $bus.$on('shellChangedNode', this.nodeChanged)
    $bus.$on('canvasHeight', this.onCanvasHeight)
    document.addEventListener('mouseup', this.onMouseUp)
    //$bus.$on('overViewBoxChangedNode', this.nodeChanged)

    let iframedocument =  this.$refs.canvasFrame.contentDocument;//contentWindow.document;
    let iframeContent = `<html style="width:100%;height:100%;">
          <head>
            <title>RXEditor Workspace</title>
            <link href="style/rxeditor.css" rel="stylesheet">
            <link href="vendor/bootstrap-4.4.1-dist/css/bootstrap.min.css" rel="stylesheet">
          </head>
          <body id="page-top" style="background-color:#FFF;padding:0;width:100%; height:100%;">
            <div id="canvas"></div>
            <script type="text/javascript" src="dist/core.js"/><\/script>
            <script>
              creatEditorCore(${this.pageId})
              rxEditor.hangOn('canvas');
            <\/script>
          </body>
        </html>
      `
    iframedocument.open();
    iframedocument.write(iframeContent);
    iframedocument.close();
    //if(!window.$editorBus) window.$editorBus= new Vue()
    window.addEventListener("message", this.receiveCanvasMessage);
  },

  destoryed () {
    //delete window.$editorBus
    $bus.$off('draggingFromToolbox', this.draggingFromToolbox)
    $bus.$off('shellChangedNode', this.nodeChanged)
    $bus.$off('canvasHeight', this.onCanvasHeight)
    //$bus.$off('overViewBoxChangedNode', this.nodeChanged)
    window.removeEventListener("message", this.receiveCanvasMessage);
    document.removeEventListener('mouseup', this.onMouseUp)
  },

  methods: {
    resizeScreen(size){
      this.size = size
    },

    draggingFromToolbox(item){
      if(this.actived){
        //console.log('send in HTMLPage', this.inputValue.title)
        this.commandProxy.draggingFromToolbox(item)
      }
    },
    onRxEditorReady(){
      //console.log(this._uid)
      //console.log('onRxEditorReady:', this.inputValue.title)
    },

    nodeChanged(node, pageId){
      if(pageId === this.pageId){
        this.commandProxy.nodeChanged(node)
      }
    },

    onCanvasHeight(height, pageId){
      if(pageId === this.pageId){
        this.canvasHeight = height + 'px'
      }
    },

    onMouseUp(){
      this.commandProxy.endDragFromToolbox()
    }
  },

  watch:{
    size(val){
      $bus.$emit('resizeScreen', this.size, this.pageId)
    }
  }
}
</script>

<style>
 .html-page{
    flex: 1;
    display: flex;
    flex-flow: column;
    height: 0;
  }

  .page-content{
    flex: 1;
    height: 0;
    overflow: auto;
    display: block;
  }

  .canvas{
    margin:0 auto ; 
    transition: all 0.5s;
    background: #fff;
  }

  .canvas iframe{
    width: 100%;
    min-height:calc(100vh - 112px);
    border:0;
  }
</style>