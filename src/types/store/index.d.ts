declare namespace TopHap {
  export interface StoreState {
    global: GlobalState
    ui: UIState
    user: UserState
    preferences: PreferencesState
    properties: PropertiesState
    compare: CompareState
  }
}
