declare namespace TopHap {
  export interface UIState {
    siderMode: 'list' | 'statistics'
    sider: {
      size: 'Normal' | 'Wide'
      visible: boolean
      properties: {
        mode: 'List' | 'Detail'
        id?: string
      }
    }
    isSideMenuExpanded: boolean
    isLegendExpanded: boolean
    viewport: {
      width: number
      height: number
    }
    feedback: boolean
  }

  export interface UICreators {
    updateStates(payload: object): AnyAction
    updateSider(
      field: keyof UIState['sider'],
      payload: any,
      update = false
    ): AnyAction
    updateViewport(viewport: UIState['viewport']): AnyAction
    showFeedback(visible: boolean): AnyAction
  }
}
