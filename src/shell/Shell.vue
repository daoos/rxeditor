<template>
  <div class="vular-studio">
    <toolbar
      @changeTheme = "changeTheme"
      @openProject = "openProject"
    ></toolbar>
    <div class="workspace">
      <LeftArea>
        <template #top>
          <WidgetTabs>
            <tab :name="$t('widgets.options')"
                 :icon="'fas fa-paint-brush'" 
                 :selected="true">
                <OptionBox v-model="options" :breakPoint = "breakPoint"></OptionBox>
            </tab>
            <tab :name="$t('widgets.code')"
                 :icon="'fas fa-code'">
              <CodeBox v-model="code"></CodeBox>
            </tab>
            <tab :name="$t('widgets.anmation')"
                 :icon="'fab fa-windows'">
              <h1>动画，暂不实现</h1>
            </tab>
            <tab :name="$t('widgets.style')"
                 :icon="'fab fa-css3'">
              <StyleBox v-model="node"></StyleBox>
            </tab>
          </WidgetTabs>
        </template>
        <template #bottom>
          <WidgetTabs>
            <tab :name="$t('widgets.overview')"
                 :icon="'fas fa-th-list'" 
                 :selected="true">
              <OptionOverviewBox v-model="node"></OptionOverviewBox>
            </tab>
          </WidgetTabs>
        </template>
      </LeftArea>
      <CenterArea>
        <PagesArea>
        </PagesArea>
      </CenterArea>
      <RightArea>
        <template #top>
          <WidgetTabs>
            <tab 
              :name="$t('widgets.studio')"
              :icon="'fas fa-puzzle-piece'" 
              :selected="true"
            >
            <Toolbox :groups="toolbox"></Toolbox>
            </tab>
            <tab :name="$t('widgets.files')"
                 :icon="'fas fa-copy'">
              <NodeTree v-model="files" 
               :openIcon="'fas fa-folder-open'" 
               :closeIcon="'fas fa-folder'"
               :editable = 'true'
               @nodeSelected="fileSelect"
              >
               </NodeTree>
            </tab>
          </WidgetTabs>
        </template>
        <template #bottom>
          <WidgetTabs>
            <tab 
              :name="$t('widgets.treeview')"
              :icon="'fas fa-project-diagram'" 
              :selected="true">
              <NodeTree v-model="nodes" 
                :openIcon="'fas fa-caret-down'" 
                :closeIcon="'fas fa-caret-right'" 
                :leafIcon="''"
                :folderCanbeSelected = 'true'>
              </NodeTree>
            </tab>
          </WidgetTabs>
        </template>
      </RightArea>
    </div>
  </div>
</template>

<script>
import Toolbar from './components/Toolbar.vue'
import LeftArea from './components/LeftArea.vue'
import CenterArea from './components/CenterArea.vue'
import RightArea from './components/RightArea.vue'
import WidgetTabs from './components/tabs/WidgetTabs.vue'
import Tab from './components/tabs/Tab.vue'
import Toolbox from './components/Toolbox/Toolbox.vue'
import PagesArea from './components/page/PagesArea.vue'
import NodeTree from './components/tree/NodeTree.vue'
import RxInputRow from './components/inputs/RxInputRow.vue'
import OptionBox from './components/options/OptionBox.vue'
import OptionOverviewBox from './components/options/OptionOverviewBox.vue'
import CodeBox from './components/options/CodeBox.vue'
import StyleBox from './components/options/StyleBox.vue'


//import files from '../mock/files.js'
import nodes from '../mock/nodes.js'
//import options from '../mock/options.js'
//import toolbox from '../mock/toolbox.js'

import {OptionsFactory} from './schemas/OptionsFactory'

var optionsFactory = new OptionsFactory

export default {
  name: 'rxeditor',
  components:{
    Toolbar,
    LeftArea,
    CenterArea,
    RightArea,
    WidgetTabs,
    Tab,
    PagesArea,
    Toolbox,
    NodeTree,
    RxInputRow,
    OptionBox,
    OptionOverviewBox,
    CodeBox,
    StyleBox,
  },
  data () {
    return {
      breakPoint:'md',
      baseToolbox:[],
      files:[],
      nodes:nodes,
      options:[],
      //optionOverview : {},
      code:'<div></div>',
      //styles:{},
      currentTheme:null,
      node:null,
    }
  },
  computed:{
    toolbox(){
      let themeToolbox = this.currentTheme ? this.currentTheme.toolboxItems : null
      if(themeToolbox){
        let themeToolboxGroup = {
          title : this.$t('toolbox.theme'),
          items : themeToolbox
        }
        let toolbox = [themeToolboxGroup]
        toolbox.push.apply(toolbox, this.baseToolbox)
        return toolbox
      }
      else{
        return this.baseToolbox
      }
    }
  },
  watch:{
    currentTheme(theme){
      this.showFiles(theme)
      $bus.$emit('themeChanged', theme)
    }
  },

  methods:{
    fileSelect(file){
      $bus.$emit('fileSelected', file)
    },
    changeTheme(theme){
      if(!theme.theme){
        return
      }
      $axios.get(theme.theme)
      .then((res)=>{
        this.currentTheme = res.data
      })
    },

    openProject(porject){
      this.showFiles(porject)
    },

    showFiles(proOrTheme){
      this.files.length = 0
      let htmlFiles = {
        title: this.$t('widgets.pages'),
        selected: false,
        opened: false,
        isFolder: true,//不能被编辑，可以新建子节点
        leafIcon: 'far fa-file-code',//子节点图标，构建新节点时使用
        fileType:'page',
        children: []
      }
      if(proOrTheme.pages){
        proOrTheme.pages.forEach(fileName =>{
          htmlFiles.children.push(
            {
              title:fileName,
              selected:false,
              opened:false,
              isEditing:false,
              fileType:'page',
              icon:"far fa-file-code",
            }
          )
        })
      }

      this.files.push(htmlFiles)

      let styleFiles = {
        title: this.$t('widgets.styles'),
        selected: false,
        opened: false,
        isFolder: true,//不能被编辑，可以新建子节点
        leafIcon: 'far fa-file-code',//子节点图标，构建新节点时使用
        fileType:'style',
        children: []
      }
      if(proOrTheme.styles){
        proOrTheme.styles.forEach(fileName =>{
          styleFiles.children.push(
            {
              title:fileName,
              selected:false,
              opened:false,
              isEditing:false,
              icon:"far fa-file-code",
              fileType:'style',
            }
          )
        })
      }
      this.files.push(styleFiles)

      let jsFiles = {
        title: this.$t('widgets.javascript'),
        selected: false,
        opened: false,
        isFolder: true,//不能被编辑，可以新建子节点
        leafIcon: 'far fa-file-code',//子节点图标，构建新节点时使用
        fileType:'javascript',
        children: []
      }
      if(proOrTheme.javascript){
        proOrTheme.javascript.forEach(fileName =>{
          jsFiles.children.push(
            {
              title:fileName,
              selected:false,
              opened:false,
              isEditing:false,
              icon:"far fa-file-code",
              fileType:'javascript',
            }
          )
        })
      }
      this.files.push(jsFiles)

      let imageFiles = {
        title: this.$t('widgets.images'),
        selected: false,
        opened: false,
        isFolder: true,//不能被编辑，可以新建子节点
        leafIcon: 'far fa-file-code',//子节点图标，构建新节点时使用
        fileType:'image',
        children: []
      }
      if(proOrTheme.images){
        proOrTheme.images.forEach(fileName =>{
          imageFiles.children.push(
            {
              title:fileName,
              selected:false,
              opened:false,
              isEditing:false,
              icon:"far fas fa-file-image",
              fileType:'image',
            }
          )
        })
      }
      this.files.push(imageFiles)
    },

    focusNode(node, pageId){
      this.node = node
      this.pageId = pageId
      console.log('Shell focusNode')
      this.options = optionsFactory.resolveOptions(node, this.breakPoint)
    },

    unFocusNode(id){
      this.options = []
      this.node = null
      this.pageId = ''
    },

    resizeScreen(breakPoint){
      console.log('shell resizeScreen')
      this.breakPoint = breakPoint
      this.options.forEach(optionGroup=>{
        optionGroup.changeBreakPoint(breakPoint)
        optionGroup.resolveValue(this.node)
      })
    },

    onOptionValueChange(){
      this.options.forEach(optionGroup=>{
        optionGroup.fillBackValue(this.node)
      })
      $bus.$emit('shellChangedNode', this.node, this.pageId)
    },

    onOverViewValueChange(){
      this.options.forEach(optionGroup=>{
        optionGroup.resolveValue(this.node)
      })
      $bus.$emit('shellChangedNode', this.node, this.pageId)
    },

    onStyleValueChange(){
      $bus.$emit('shellChangedNode', this.node, this.pageId)
    }

  },

  mounted () {
    $bus.$on('focusNode', this.focusNode)
    $bus.$on('unFocusNode', this.unFocusNode)
    $bus.$on('optionValueChange', this.onOptionValueChange)
    $bus.$on('overViewValueChange', this.onOverViewValueChange)
    $bus.$on('styleValueChange', this.onStyleValueChange)
    $bus.$on('resizeScreen', this.resizeScreen)


    this.currentTheme = null
    $axios.get('api/theme/default')
    .then((res)=>{
      this.currentTheme = res.data
    })

    $axios.get("api/toolbox").then((res)=>{
      this.baseToolbox = res.data
    })

  },

  beforeDestroyed() {
    $bus.$off('focusNode', this.focusNode)
    $bus.$off('unFocusNode', this.unFocusNode)
    $bus.$off('optionValueChange', this.onOptionValueChange)
    $bus.$off('overViewValueChange', this.onOverViewValueChange)
    $bus.$off('styleValueChange', this.onStyleValueChange)
    $bus.$off('resizeScreen', this.resizeScreen)
  },

}
</script>

<style>
</style>
