/// <reference path="./module-config.ts" />
/// <reference path="./mapper.ts" />
/// <reference path="./items-set.ts" />
/// <reference path="./item-model.ts" />


import { ModuleConfig } from './module-config';
import { Mapper } from './mapper';
import { ItemsSet } from './items-set';
import { ItemState } from './item-model';

import { MetricsPanelCtrl } from 'app/plugins/sdk';
import { initProgress } from './directives/progress';
import { initWaiting } from './directives/waiting';

declare var System: any; // app/headers/common can`t be imported


class Ctrl extends MetricsPanelCtrl {
  static templateUrl = "partials/template.html";
  
  public mapper: Mapper;
  public itemSet: ItemsSet;
  
  private _panelPath?: string;
  

  constructor($scope, $injector) {
    super($scope, $injector);
    ModuleConfig.init(this.panel);
    this._initStyles();
    
    initProgress(this.panelPath, 'progressListPluginProgress');
    initWaiting(this.panelPath, 'progressListPluginWaiting');
    
    this.mapper = new Mapper();
    this.itemSet = new ItemsSet();
    
    this.$scope.ItemState = ItemState;
    
    this.events.on('init-edit-mode', this._onInitEditMode.bind(this));
    this.events.on('data-received', this._onDataReceived.bind(this));
  }

  link(scope, element) {
  }
  
  _initStyles() {
    System.import(this.panelPath + 'css/panel.base.css!');
    if (window['grafanaBootData'].user.lightTheme) {
      System.import(this.panelPath + 'css/panel.light.css!');
    } else {
      System.import(this.panelPath + 'css/panel.dark.css!');
    }
  }

  _onDataReceived(seriesList: any) {
    var items = this.itemSet.setItemStates(this.mapper.mapMetricData(seriesList));
    this.$scope.items = items;
  }

  _onInitEditMode() {
    var thisPartialPath = this.panelPath + 'partials/';
    this.addEditorTab(
      'Data Mapping', thisPartialPath + 'editor.mapping.html', 2
    );
  }

  _dataError(err) {
    this.$scope.data = [];
    this.$scope.dataError = err;
  }

  get panelPath() {
    if(!this._panelPath) {
      var panels = window['grafanaBootData'].settings.panels;
      var thisPanel = panels[this.pluginId];
      // the system loader preprends publib to the url,
      // add a .. to go back one level
      this._panelPath = '../' + thisPanel.baseUrl + '/';
    }
    return this._panelPath;
  }
}


export { Ctrl as PanelCtrl }
